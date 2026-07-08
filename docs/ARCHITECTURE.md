# System Architecture
### Traffic Flow
    Browser → Nginx → Flask (Gunicorn) → PostgreSQL & AWS S3

1. **Browser → Nginx:** The client’s browser will send a HTTPS request to `sibeisafe.xyz`, which is intercepted by Nginx:
   - Requests to `/*` serve the static React `dist/` build
   - Requests to `/api/*` are reverse proxied via HTTP to the internal Flask server

2. **Nginx → Flask:** Flask receives the HTTP requests from Nginx. Utilizing 4 worker processes, Flask (Gunicorn) is able to manage concurrent API requests efficiently.
   
3. **Flask → PostgreSQL & AWS S3:** Depending on the request, user and file metadata are stored, updated, and deleted locally via PostgreSQL while the actual encrypted file blobs are managed within S3 Buckets.



### Infrastructure & Deployment
- **Domain & DNS:** Got a cheap domain `sibeisafe.xyz` off Namecheap and linked the DNS A record to the EC2 instance's public IP

- **Hosting:** Used an AWS EC2 t3.micro instance as the server.

- **Routing:** Configured Nginx with static serving and the `/api/` proxy, with a `try_files` fallback for React Router

- **SSL:** HTTPS via Certbot, auto-renewal verified with `--dry-run`

- **API Application:** Used systemd & Gunicorn (4 workers, `Restart=always`), replacing my earlier `tmux` approach allowing for backend to auto-boot on restart.

- **Database:** Self-host PostgreSQL on the EC2 instance and configured a scoped `db_user`, and used connection pooling via `psycopg2.ThreadedConnectionPool`

- **Object Storage:** Integrated AWS S3 for encrypted file storage. Attached an IAM user with access keys stored in the .env file in the EC2 instance instead of my root user account.