import sqlite3
from werkzeug.security import generate_password_hash

def init_db():
    """Initializes the database and creates tables if they don't exist."""
    conn = sqlite3.connect('papers.db')
    cursor = conn.cursor()
    
    # Create the 'papers' table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT, class TEXT NOT NULL, subject TEXT NOT NULL,
            semester TEXT NOT NULL, exam_year TEXT NOT NULL, exam_type TEXT NOT NULL,
            paper_code TEXT, exam_number TEXT, medium TEXT NOT NULL, university TEXT,
            time TEXT, max_marks TEXT, uploader_name TEXT NOT NULL, filename TEXT NOT NULL UNIQUE,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # NEW: Create the 'users' table for storing admin credentials
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

def add_user(username, password):
    """Adds a new user to the database with a hashed password."""
    conn = sqlite3.connect('papers.db')
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", 
                       (username, generate_password_hash(password)))
        conn.commit()
        print(f"User '{username}' created successfully.")
    except sqlite3.IntegrityError:
        print(f"User '{username}' already exists.")
    finally:
        conn.close()
