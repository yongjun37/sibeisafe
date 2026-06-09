import os
from dotenv import load_dotenv
from psycopg2 import connect, OperationalError

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

def get_db_connection():
    """
    Establishes a connection to the PostgreSQL database using credentials from environment variables.
    
    Returns:
        A psycopg2 connection object if successful, or None if there was an error connecting.
    """
    db_url = os.getenv('DATABASE_URL')
    try:
        connection = connect(db_url)
        return connection
    except OperationalError as e:
        print(f"Error connecting to the database: {e}")
        return None

