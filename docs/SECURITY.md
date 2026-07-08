# Security Architecture
**Zero-Knowledge Architecture:** Plaintext files and encryption passwords never leave the browser.

**Data minimization:** Only login passwords are sent to server-side for hashing and storing. Encryption passwords are strictly client-side, completely unknown to the backend.

**Storage:** Files are stored in S3 as `owner_id/random-uuid.enc` to prevent leaking PII and namespace collisions.

**Sharing:** Sharing generates a temporary `share_uuid` to retrieve the encrypted blob. This is decrypted locally using password shared from other channel.

## Client-Side Cryptography: 
1. **Key Derivation:** PBKDF2-SHA256 using 200,000 iterations (OWASP aligned) and a 16-byte random salt.
2. **Encryption:** AES-256-GCM using a 12-byte random IV and 16 byte random salt stored as a Blob alongside the ciphertext. Only this blob is stored in S3.

        [16B salt][12B IV][ciphertext] 


## Security Hardening & Troubleshooting
- **Security Group:** Allowed only traffic on ports 22, 80, and 443. For port 22 only my local IP can access it. Initially port 5000 was open for direct communication, but after configuring Nginx the port was closed to ensure threat actors cannot directly target the backend API.
  
- **Rate limiting:** Implemented rate limiting to prevent API abuse via `flask-limiter`. 
   When setting this up, Nginx made every request look like it came from 127.0.0.1. I fixed it by passing the `X-Real-IP` header and using `ProxyFix` so Flask could see the actual client IPs.

- **Security headers:** Added header via Nginx for HSTS, X-Frame-Options, X-Content-Type-Options, and CSP using online tools.
  
- **IAM least-privilege:** Created a scoped `s3-user`, limiting its access to the exact bucket and object ARNs, only allowing Put, Get, List, and Delete operations.

- **File Constraints:** There is a 100MB upload limit (which returns a 413 on exceed), and I enforce `secure_filename()` to protect against path traversal attacks.
  

## Threat Model
| Threat | Mitigation |
|---|---|
| Server compromise | Client-side encryption, server does not see plaintext files or passwords |
| S3 bucket breach | Files encrypted at rest, UUID-based S3 keys prevents PII leak |
| Database Leak | Files remain secure. Account email compromised — documented trade-off  |
| Brute force login | Rate limiting, bcrypt |
| JWT theft | Short expiry, sent via HTTPS only |
| XSS | CSP headers |
| IDOR (accessing others' files) | Ownership check on every file operation |
| Weak passwords | Server-side strength validation |
| Metadata exposure | UUID-based S3 keys, no PII in paths |