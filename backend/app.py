import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from crypto import encrypt_file_password, decrypt_file_password

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')


app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return 'I am alive!'

@app.route('/encrypt', methods=['POST'])
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