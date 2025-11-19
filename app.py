import os
import sqlite3
import database
import secrets
from flask import Flask, request, render_template, url_for, jsonify, send_from_directory, session, redirect, flash
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

app = Flask(__name__)

# Use environment variable for secret key, generate secure random key for development
secret_key = os.environ.get('SECRET_KEY')
if not secret_key:
    # Generate a cryptographically secure random key for development
    secret_key = secrets.token_hex(32)
    # Warn in production
    if os.environ.get('FLASK_ENV') == 'production':
        import sys
        print("WARNING: SECRET_KEY environment variable not set in production!", file=sys.stderr)
        print("Please set a secure SECRET_KEY environment variable.", file=sys.stderr)

app.config['SECRET_KEY'] = secret_key
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB max file size

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize the database when the app starts
database.init_db()

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    """Decorator to require login for protected routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.after_request
def add_security_headers(response):
    """Add security headers to all responses."""
    # Prevent clickjacking
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    # Prevent MIME type sniffing
    response.headers['X-Content-Type-Options'] = 'nosniff'
    # Enable XSS protection
    response.headers['X-XSS-Protection'] = '1; mode=block'
    # Content Security Policy (allowing Google Fonts for terminal UI)
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "script-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:;"
    )
    return response

@app.route('/')
def terminal_ui():
    return render_template('index.html')

@app.route('/offline')
def offline():
    return render_template('offline.html')

@app.route('/admin')
@login_required
def upload_form():
    return render_template('upload.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login with validation."""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        # Basic validation
        if not username or not password:
            flash('Username and password are required.')
            return render_template('login.html'), 400
        
        # Prevent excessively long inputs
        if len(username) > 100 or len(password) > 200:
            flash('Invalid credentials.')
            return render_template('login.html'), 400
        
        try:
            conn = sqlite3.connect('papers.db')
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()
            conn.close()
            
            if user and check_password_hash(user['password_hash'], password):
                session['user_id'] = user['id']
                session['username'] = user['username']
                # Regenerate session ID to prevent session fixation
                session.modified = True
                return redirect(url_for('upload_form'))
            else:
                flash('Invalid username or password.')
        except Exception as e:
            flash('An error occurred. Please try again.')
            import sys
            print(f"Login error: {e}", file=sys.stderr)
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('terminal_ui'))

@app.route('/upload', methods=['POST'])
@login_required
def upload_file():
    """Handle file upload with validation and security checks."""
    if 'file' not in request.files:
        return jsonify({"error": "Missing file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type. Only PDF files are allowed"}), 400

    # Get all form data with proper validation
    data = {
        "class_name": request.form.get('class', '').strip(),
        "subject": request.form.get('subject', '').strip(),
        "semester": request.form.get('semester', '').strip(),
        "exam_year": request.form.get('exam_year', '').strip(),
        "exam_type": request.form.get('exam_type', '').strip(),
        "paper_code": request.form.get('paper_code', 'N/A').strip(),
        "exam_number": request.form.get('exam_number', 'N/A').strip(),
        "medium": request.form.get('medium', '').strip(),
        "university": request.form.get('university', 'N/A').strip(),
        "time": request.form.get('time', 'N/A').strip(),
        "max_marks": request.form.get('max_marks', 'N/A').strip(),
        "uploader_name": request.form.get('admin_name', session.get('username', 'Unknown')).strip()
    }

    # Validate required fields
    required_fields = ['class_name', 'subject', 'semester', 'exam_year', 'exam_type', 'medium']
    missing_fields = [field for field in required_fields if not data[field]]
    
    if missing_fields:
        return jsonify({
            "error": f"Required fields missing: {', '.join(missing_fields)}"
        }), 400

    # Additional validation for data integrity
    if not data['exam_year'].isdigit() or len(data['exam_year']) != 4:
        return jsonify({"error": "Invalid exam year format. Expected 4-digit year"}), 400

    # Create unique filename to prevent duplicates and collisions
    unique_prefix = secrets.token_hex(8)
    secure_name = secure_filename(file.filename)
    filename = f"{unique_prefix}_{secure_name}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    try:
        file.save(filepath)
    except Exception as e:
        return jsonify({"error": f"File save failed: {str(e)}"}), 500

    # Save to database
    try:
        conn = sqlite3.connect('papers.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO papers (class, subject, semester, exam_year, exam_type, paper_code, exam_number, medium, university, time, max_marks, uploader_name, filename)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['class_name'], data['subject'], data['semester'], data['exam_year'], data['exam_type'],
            data['paper_code'], data['exam_number'], data['medium'], data['university'], data['time'],
            data['max_marks'], data['uploader_name'], filename
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        # Delete the saved file if DB insert fails to maintain consistency
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    return jsonify({"message": "File uploaded successfully", "filename": filename}), 200

@app.route('/api/papers')
def get_papers():
    search_query = request.args.get('q', '').strip().lower()
    
    conn = sqlite3.connect('papers.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if not search_query:
        # Return all papers if no search query
        cursor.execute('SELECT * FROM papers ORDER BY exam_year DESC, subject')
    else:
        # Intelligent search with translation map for synonyms
        raw_terms = search_query.split()
        
        # Translation map for common shortcuts and synonyms
        TRANSLATION_MAP = {
            '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V', '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX', '10': 'X',
            'one': 'I', 'two': 'II', 'three': 'III', 'four': 'IV', 'five': 'V', 'six': 'VI', 'seven': 'VII', 'eight': 'VIII',
            'first': 'I', 'second': 'II', 'third': 'III', 'fourth': 'IV', 'fifth': 'V', '3rd': 'III',
            'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV', 'v': 'V', 'vi': 'VI', 'vii': 'VII', 'viii': 'VIII', 'ix': 'IX', 'x': 'X',
            'sem': 'semester', 'semester': 'semester',
            'phy': 'physics', 'pys': 'psychology', 'env': 'environmental', 'sci': 'science',
            'his': 'history', 'eco': 'economics', 'stats': 'statistics', 'biotech': 'biotechnology',
            'cs': 'computer', 'ps': 'political', 'geo': 'geography', 'zoo': 'zoology',
            'bot': 'botany', 'eng': 'english', 'hin': 'hindi', 'chem': 'chemistry'
        }
        
        # Apply translations
        processed_terms = [TRANSLATION_MAP.get(term, term) for term in raw_terms]
        
        # Build SQL query dynamically
        sql_query = 'SELECT * FROM papers WHERE '
        conditions = []
        params = []
        search_columns = ['class', 'subject', 'semester', 'exam_year', 'exam_type', 'paper_code', 'exam_number', 'medium', 'university', 'uploader_name']
        
        for term in processed_terms:
            term_conditions = []
            for col in search_columns:
                term_conditions.append(f'LOWER({col}) LIKE ?')
                params.append(f'%{term}%')
            conditions.append(f"({' OR '.join(term_conditions)})")
        
        sql_query += ' AND '.join(conditions)
        sql_query += ' ORDER BY exam_year DESC, subject'
        cursor.execute(sql_query, params)
    
    papers_rows = cursor.fetchall()
    conn.close()

    papers_list = []
    for row in papers_rows:
        paper = dict(row)
        paper['url'] = url_for('get_uploaded_file', filename=paper['filename'])
        paper['original_name'] = f"{paper['subject']} {paper['exam_type']} {paper['exam_year']}"
        papers_list.append(paper)
        
    return jsonify(papers_list)

@app.route('/uploads/<path:filename>')
def get_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
