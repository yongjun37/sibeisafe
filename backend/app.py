# Standard library imports
import os

# Third-party imports
from flask import Flask, jsonify, request, send_file, after_this_request
from flask_cors import CORS
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import boto3
from werkzeug.utils import secure_filename
from uuid import uuid4

# Local imports
from crypto import encrypt_file_password, decrypt_file_password
from helpers import is_strong_password, get_db_connection

# Load environment variables from .env file
load_dotenv()

# Global constants
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
DOWNLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'downloads')

# Initialize Flask app and extensions
app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
s3_client = boto3.client('s3')

# Normalize JWT Error
@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'error': 'Missing authorization token. Please log in.'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'error': 'Invalid authorization token. Please log in again.'
    }), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'error': 'Your session has expired. Please log in again.'
    }), 401

# --------- Routes ---------
@app.route('/health', methods=['GET'])
def health():
    return 'I am alive!'


@app.route('/login', methods=['POST'])
def login():
    # Get the email and password from the request
    email = request.form.get('email')
    password = request.form.get('password')
    
    # Check if email and password are provided
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Connect to database
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Could not connect to the database'}), 500

    # Check if email exists in database
    with connection:
        with connection.cursor() as cursor:
            
            cursor.execute("SELECT password_hash FROM users WHERE email = %s", [email])

            query = cursor.fetchone()
            # Check if email exists in database
            if query == None:
                return jsonify({'error': 'Invalid email or password'}), 401
            
            # Compare password with stored hash in database
            dbpassword = query[0]
            isMatch = bcrypt.check_password_hash(dbpassword, password)
            if not isMatch:
                return jsonify({'error': 'Invalid email or password'}), 401
    
    # Create JWT Token and return it to client
    access_token = create_access_token(identity=email)
    return jsonify(access_token=access_token), 200
    

@app.route('/register', methods=['POST'])
def register():
    # Get the email and password from the request
    email = request.form.get('email')
    password = request.form.get('password')

    # Check if email and password are provided
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Validate password strength
    if not is_strong_password(password):
        return jsonify({'error': 'Password must be at least 8 characters long and include uppercase, lowercase, digits, and special characters'}), 400

    # Hash the password before storing it in the database
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Connect and check if database connection is successful
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Could not connect to the database'}), 500
    
    with connection:
        with connection.cursor() as cursor:
            # Check if email already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", [email])
            if cursor.fetchone():
                return jsonify({'error': 'The email may already be in use, or the data is invalid. Please try logging in.'}), 409
            
            # Insert the new user into the database
            cursor.execute("INSERT INTO users (email, password_hash) VALUES (%s, %s)", [email, hashed_password])

    return jsonify({'message': f'{email} registered successfully!'}), 201

@app.get('/files')
@jwt_required()
def get_files(): 
    # Get email via JWT Token
    email = get_jwt_identity()

    # Connect to database
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Could not connect to the database'}), 500
    
    with connection:
        with connection.cursor() as cursor:
            # Get user files from database
            cursor.execute("SELECT f.id, f.filename, f.uploaded_at \
                            FROM files f  \
                            JOIN users u ON f.owner_id = u.id \
                            WHERE u.email = %s", [email])
            
            files = cursor.fetchall()

            # If no files return 204 (empty array)
            if not files:
                return jsonify([]), 200
    
    return jsonify(files), 200


@app.delete('/files/<file_id>')
@jwt_required()
def delete_files(file_id): 
    # TODO: deletes file from S3 and DB
    # Get email via JWT Token
    email = get_jwt_identity()

    # Connect to database
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Could not connect to the database'}), 500
    
    with connection:
        with connection.cursor() as cursor:
            # Explicitly check if email exists as deleted users may still have valid JWT
            cursor.execute("SELECT id FROM users WHERE email = %s", [email])
            user_query = cursor.fetchone()
            if user_query is None:
                return jsonify({'error': 'User not found'}), 404
            
            # Retrieve owner_id
            owner_id = user_query[0]

            # Get S3 key
            cursor.execute("SELECT s3_key FROM files WHERE id = %s AND owner_id = %s", [file_id, owner_id])
            key_query = cursor.fetchone()
            if key_query is None:
                return jsonify({'error': 'File does not exist or not is owned by you'}), 404
            
            # Retrieve s3_key
            s3_key = key_query[0]
            s3_bucket = os.getenv('S3_BUCKET_NAME')

            try: 
                s3_client.delete_object(Bucket=s3_bucket, Key=s3_key)
            except Exception as e:
                return jsonify({'error': str(e)}), 400
            
            cursor.execute("DELETE FROM files WHERE id = %s AND owner_id = %s", [file_id, owner_id])

    return jsonify({'message': 'File permanently deleted'}), 200


@app.route('/download/<file_id>', methods=['POST'])
@jwt_required()
def download(file_id):      
    # Get email via JWT Token
    email = get_jwt_identity()
    password = request.form.get('password')

    if not password:
        return jsonify({'error': 'Password is required'}), 400

    # Connect to database
    connection = get_db_connection()
    if connection is None:
        return jsonify({'error': 'Could not connect to the database'}), 500
    
    with connection:
        with connection.cursor() as cursor:
            # Explicitly check if email exists as deleted users may still have valid JWT
            cursor.execute("SELECT id FROM users WHERE email = %s", [email])
            user_query = cursor.fetchone()
            if user_query is None:
                return jsonify({'error': 'User not found'}), 404
            
            # Retrieve owner_id
            owner_id = user_query[0]

            # Get file metadata
            cursor.execute("SELECT s3_key, filename FROM files WHERE id = %s AND owner_id = %s", [file_id, owner_id])
            file_query = cursor.fetchone() 
            if file_query is None:
                return jsonify({'error': 'File does not exist or not is owned by you'}), 404

            s3_bucket = os.getenv('S3_BUCKET_NAME')
            s3_key = file_query[0]
            filename = file_query[1]
            
            output_path = os.path.join(DOWNLOAD_FOLDER, str(uuid4()))
            input_path = output_path + ".enc"

            # Cleanup files after request
            @after_this_request
            def cleanup(response):
                if os.path.exists(input_path):
                    os.remove(input_path)
                if os.path.exists(output_path):
                    os.remove(output_path)
                return response
      
            # Try to download file from S3 client to save to /downloads folder
            try:
                file = s3_client.download_file(s3_bucket, s3_key, input_path)

                success = decrypt_file_password(input_path, output_path, password)
                if not success: 
                    return jsonify({'error': 'Wrong password or corrupted file'}), 400
            
            # Catch S3 download errors
            except Exception as e:
                return jsonify({'error': str(e)}), 400
            
    return send_file(output_path, download_name=filename, as_attachment=True)


@app.route('/upload', methods=['POST'])
@jwt_required()
def upload():
    # Get the email of user, uploaded file, and password
    email = get_jwt_identity()
    file = request.files.get('file')
    password = request.form.get('password')

    # Validate file and password
    if not file or not password:
        return jsonify({'error': 'File and password are required'}), 400
    
    # Get secure filename to prevent directory traversal attacks
    filename = secure_filename(file.filename)
    if not filename:
        return jsonify({'error': 'Invalid file name'}), 400

    # Save the uploaded file to the uploads directory
    input_path = os.path.join(UPLOAD_FOLDER, str(uuid4()))
    file.save(input_path)

    # Define output path for encrypted file
    output_path = input_path + '.enc'

    # Connect to database, if connection fails, clean up local files and exit
    connection = get_db_connection()
    if connection is None:
        if os.path.exists(input_path):
            os.remove(input_path)
        return jsonify({'error': 'Could not connect to the database'}), 500
    
    
    with connection:
        with connection.cursor() as cursor:
            # Verify email exists and retrieve user id
            cursor.execute("SELECT id FROM users WHERE email = %s", [email])
            data = cursor.fetchone()
            if not data:
                if os.path.exists(input_path):
                    os.remove(input_path)
                return jsonify({'error': 'User not found'}), 404
            
            owner_id = data[0]

            # Define S3 key and bucket
            s3_key = f"{owner_id}/{uuid4()}.enc"
            s3_bucket = os.getenv('S3_BUCKET_NAME')

            # Try to encrypt and upload file to S3, if anything fails, return an error response and clean up files
            try:
                success = encrypt_file_password(input_path, output_path, password)
            
                if not success:
                    return jsonify({'error': 'Encryption failed'}), 400
                
                s3_client.upload_file(output_path, s3_bucket, s3_key)

            except Exception as e:
                return jsonify({'error': str(e)}), 400

            finally:
                if os.path.exists(input_path):
                    os.remove(input_path)
                if os.path.exists(output_path):
                    os.remove(output_path)
            
            # Insert metadata into database
            cursor.execute(
                "INSERT INTO files (owner_id, filename, s3_key) VALUES (%s, %s, %s)", 
                [owner_id, filename, s3_key]
            )
    
    return jsonify({'message': 'File uploaded and encrypted successfully!'}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)