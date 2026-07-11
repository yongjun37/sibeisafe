# SibeiSafe
SibeiSafe is a web-based storage application built strictly on a zero-knowledge architecture. By utilizing the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API), all files are encrypted entirely client-side before transmission, ensuring the server never sees plaintext data.

**Live Site:** https://sibeisafe.xyz \
**Github Repository:** https://github.com/yongjun37/sibeisafe 

## Tech Stack
|   |   |
|---|---|
| **Frontend** | React, Vite, Bootstrap 5 |
| **Backend + Data** | Flask + Gunicorn, PostgreSQL, AWS S3 |
| **Infrastructure** | Nginx, AWS EC2 |
| **Security & Cryptography** | Web Crypto API, Flask-JWT-Extended, Flask-Bcrypt |

## Documentation
For a deep dive into the decisions, infrastructure, and cryptographic pipeline behind SibeiSafe, please refer to the `docs/` directory:
* [System Architecture & Infrastructure](docs/ARCHITECTURE.md)
* [Security Architecture & Threat Model](docs/SECURITY.md)
* [Author's Notes & Project Evolution](docs/AUTHORSNOTES.md)


## Feature Data Flow
- **Register:** Frontend validates strength → Backend hashes via bcrypt → Store email and hashed password in PostgreSQL 

- **Login:** POST `/api/login`→ Backend hashes via bcrypt. → Compare hashed password with PostgreSQL data → Issue JWT Token.

- **Upload:** Client encrypts file → POST `/api/upload` → Backend streams blob to AWS S3 → Record metadata in PostgreSQL

- **Dashboard:** GET `/api/files` → Backend verifies JWT → Returns database records owned by to the authenticated `owner_id`.

- **Download:** GET `/api/download/<id>` → JWT ownership check → Fetch blob from S3 → Client's Browser extracts Salt/IV and decrypts locally.

- **Share:** `POST /api/files/<file_id>/share` → Generates a temporary `share_uuid` → Unauthenticated user accesses `/share/:share_uuid`  → Decrypts and download client-side using a password shared from other channels (Revoked via `DELETE`).

- **Delete:** JWT ownership check → Backend deletes encrypted blob from S3 → delete PostgreSQL metadata record.


## Known Limitations & Trade-offs
- **No DEK/KEK Architecture:** Enterprise systems like ProtonDrive uses this architecture, allowing users to store encrypted files without the need of a password. Implementing this added massive complexity and was hence deferred.
  
- **Unencrypted Metadata:** While file contents are encrypted, account and file metadata are stored in plaintext in PostgreSQL. This is a required to allow for authentication routing and dashboard generation.

- **No password recovery:** Because the server never processes or stores the file encryption password, it is mathematically impossible to reset it. A forgotten password means the encrypted files are permanently unrecoverable.
  
- **No Server-Side Virus Scanning:** Because the backend only receives an ecnrypted blob, the server is unable to read to the file's contents, making malware scanning impossible. 


## Future Improvements
- **DEK/KEK Architecture (v2):** Implementing an asymmetric key-wrapping system to allow for seamless password rotations without requiring users to download, re-encrypt, and re-upload their files.
  
- **Infrastructure as Code (IaC):** Containerization and CI/CD pipelines to streamline deployment.
