import os
from dotenv import load_dotenv
from flask import request
from psycopg2 import pool, OperationalError
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask_limiter.util import get_remote_address


load_dotenv()

def is_strong_password(password):
    """
    Validates that a password meets strict security requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    """
    if len(password) < 8:
        return False
    if not any(c.isupper() for c in password):
        return False
    if not any(c.islower() for c in password):
        return False
    if not any(c.isdigit() for c in password):
        return False
    if not any(c in '!@#$%^&*()_+-=[]}{|;:,.<>?/' for c in password):
        return False
    return True

try:
    db_pool = pool.ThreadedConnectionPool(
        minconn=1,
        maxconn=10,
        dsn=os.getenv('DATABASE_URL')
    )
except OperationalError as e:
    print(f"FATAL: Error creating connection pool: {e}")
    db_pool = None

def get_db_connection():
    # Borrows a connection from the pool.
    if db_pool:
        try:
            return db_pool.getconn()
        except Exception as e:
            print(f"Unable to get connection from pool: {e}")
            return None

def release_db_connection(connection):
    # Returns the connection to the pool so others can use it.
    if db_pool and connection:
        db_pool.putconn(connection)
        
        
def rate_limit_by_user():
    try:
        # Check if the request has a valid JWT
        verify_jwt_in_request()
        return get_jwt_identity() # Returns their email (e.g., test@example.com)
    except:
        # If no JWT (like on the /login or /register route), fallback to IP
        return request.headers.get('X-Real-IP', request.remote_addr)