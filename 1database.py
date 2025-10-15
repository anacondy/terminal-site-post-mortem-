import sqlite3

def init_db():
    """Initializes the database and creates the 'papers' table if it doesn't exist."""
    conn = sqlite3.connect('papers.db')
    cursor = conn.cursor()
    
    # This SQL command creates our table with all the necessary columns
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class TEXT NOT NULL,
            subject TEXT NOT NULL,
            semester TEXT NOT NULL,
            exam_year TEXT NOT NULL,
            exam_type TEXT NOT NULL,
            paper_code TEXT,
            exam_number TEXT,
            medium TEXT NOT NULL,
            university TEXT,
            time TEXT,
            max_marks TEXT,
            uploader_name TEXT NOT NULL,
            filename TEXT NOT NULL UNIQUE,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
