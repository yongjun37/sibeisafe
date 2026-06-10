# Standard library imports
import os

# Third-party imports
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required

# Local imports
from crypto import encrypt_file_password, decrypt_file_password
from helpers import is_strong_password, get_db_connection

# Load environment variables from .env file
load_dotenv()

# Global constants
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')

# Initialize Flask app and extensions
app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

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


@app.route('/encrypt', methods=['POST'])
@jwt_required()
def encrypt():
    # Get the uploaded file and password from the request
    file = request.files.get('file')
    password = request.form.get('password')

    if not file or not password:
        return jsonify({'error': 'File and password are required'}), 400

    # Get the paths of input and output files
    input_path = os.path.join(UPLOAD_FOLDER, file.filename)
    output_path = os.path.join(UPLOAD_FOLDER, f'enc_{file.filename}')
    
    # Save file to uploads directory
    file.save(input_path)

    # Encrypt the file using the provided password
    success = encrypt_file_password(input_path, output_path, password)

    if not success:
        return jsonify({'error': 'Encryption failed'}), 400
    
    return send_file(output_path, as_attachment=True)


@app.route('/decrypt', methods=['POST'])
@jwt_required()
def decrypt():
    # Get the uploaded file and password from the request
    file = request.files.get('file')
    password = request.form.get('password')

    if not file or not password:
        return jsonify({'error': 'File and password are required'}), 400

    # Get the input and output paths
    input_path = os.path.join(UPLOAD_FOLDER, file.filename)
    output_path = os.path.join(UPLOAD_FOLDER, f'dec_{file.filename}')

    # Save the uploaded file to the uploads directory
    file.save(input_path)

    # Decrypt the file using the provided password
    success = decrypt_file_password(input_path, output_path, password)

    if not success:
        return jsonify({'error': 'Decryption failed. Wrong password or corrupted file.'}), 400
        
    return send_file(output_path, as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)