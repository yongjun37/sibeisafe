# Secure Share
A web application allowing for encrypting and decrypting files using AES-256 encryption (Fernet cipher) via password-based encryption.

## Tech Stack
- **Frontend:** React (JavaScript) 
-  **Backend:** Python, Flask, Flask-CORS
-  **Cryptography:** Python `cryptography` library (AES-256 (Fernet), PBKDF2HMAC, SHA-256)


## Getting Started
### Requirements
- python 3.9+
- npm and Node.js

### Backend
1. Navigate to your backend directory. 
2. Create and activate a virtual environment ***(Optional but Recommended)*** :
	```bash
	python -m venv .venv
	source venv/bin/activate 	# On Windows use .venv\Scripts\Activate.ps1
	```
3. Install dependencies 
	```bash
	pip install Flask flask-cors cryptography
	```
4. Start the Flask Server
	```bash
	python app.py # Backend will run on http://localhost:5000
	```
### Frontend 
1. Navigate to frontend directory.
2. Start the development server:
	```bash
	npm run dev
	```
## Usage 
1. Open the frontend application in your browser.

2.  **To Encrypt:** Navigate to the Encrypt view, upload a file, enter a strong password, and click "Encrypt". The encrypted file (ending in `.enc`) will automatically download to your machine.

 3.   **To Decrypt:** Navigate to the Decrypt view, upload your `.enc` file, enter the exact password used for encryption, and click "Decrypt". The original file will be restored and downloaded.

## CLI Tool
The `crypto.py` module acts as the heavy lifter for the application and can be used as a standalone Python script or imported into other projects. 

One such use case would be a CLI tool which was the inital use case before evolving into a web application.



###  Usage:

#### 1. Generate Encryption Key File
```powershell
python crypto_cli.py genkey --out mykey.key    # Creates a new encryption key and saves it to my.key
```
#### 2. Encrypt Files

**Using key file:**
```powershell
python crypto_cli.py encrypt --in document.pdf --out document.pdf.enc --key my.key
```
**Using password:**
```powershell
python crypto_cli.py encrypt --in document.pdf --out document.pdf.enc --password
# You'll be prompted to enter and confirm password
```

#### 3. Decrypt Files

**Using key file:**
```powershell
python crypto_cli.py decrypt --in document.pdf.enc --out document.pdf --key mykey.key
```

**Using password:**
```powershell
python crypto_cli.py decrypt --in document.pdf.enc --out document.pdf --password
# You'll be prompted to enter password
```

#### 4. Hash Files (Integrity Check)

**Generate hash:**
```powershell
python crypto_cli.py hash --in document.pdf
# Output: SHA-256: a3c5f9e2b1d4c8a7f6e5...
```

**Verify file integrity:**
```powershell
python crypto_cli.py verify --in document.pdf --hash a3c5f9e2b1d4c8a7f6e5...
# Output: ✅ File integrity verified
```

### Exit Codes
| Code | Meaning                                                   |
| ---- | --------------------------------------------------------- |
| `0`  | Success                                                   |
| `1`  | User / file error (missing file, invalid input)           |
| `2`  | Cryptographic failure (wrong key/password, tampered file) |


## Roadmap & Future Improvements 

- **Batch & Directory Encryption:** Allow users to securely process multiple files or entire folders at once.
-  **Pre-Encryption Compression:** Optimize storage and transfer times by compressing files prior to encryption. 
- **Cloud Infrastructure (AWS S3):** Transition from local file handling to secure, scalable cloud object storage. 
- **UI/UX Enhancements:** Continue refining the web interface for a smoother, more intuitive user experience. 

## What's built
- **CLI Tool:** Developed a secure command-line interface (`crypto_cli.py`) to interact directly with the main cryptographic engine (`crypto.py`)

-  **Frontend and Backend Integration:** Successfully connected the React UI with the Flask encryption engine. 

## Author's Notes 
I built SecureShare as a hands-on project to deepen my practical understanding of both full-stack development and secure file handling. Building this tool allowed me to explore several key concepts. 

### Concepts Learnt:
- **Applied Cryptography:** Implementing symmetric encryption, password-based key derivation (PBKDF2), and handling cryptographic failures securely. 
- **Secure Tooling:** Designing a robust command-line interface for the underlying cryptographic engine. 
-  **Full-Stack Architecture:** Learning the basics of React and Flask, and successfully bridging the gap between a modern frontend and a Python backend.