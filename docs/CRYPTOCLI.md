# Crypto CLI Tool
The `crypto.py` module acts as the heavy lifter for the application and can be used as a standalone Python script or imported into other projects. One such use case would be a CLI tool `crypto_cli.py` which was the inital use case before evolving into a web application.


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