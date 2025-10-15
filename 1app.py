import os
import sqlite3
import database  # NEW: Import our database helper
from flask import Flask, request, render_template, url_for, jsonify, send_from_directory
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# NEW: Initialize the database when the app starts
database.init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def terminal_ui():
    return render_template('index.html')

@app.route('/admin')
def upload_form():
    return render_template('upload.html')

# --- REWRITTEN: Upload logic now saves to the database ---
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "Missing file part", 400
    
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return "Invalid file", 400

    # Get all form data, with defaults for optional fields
    data = {
        "class_name": request.form.get('class', ''),
        "subject": request.form.get('subject', ''),
        "semester": request.form.get('semester', ''),
        "exam_year": request.form.get('exam_year', ''),
        "exam_type": request.form.get('exam_type', ''),
        "paper_code": request.form.get('paper_code', 'N/A'),
        "exam_number": request.form.get('exam_number', 'N/A'),
        "medium": request.form.get('medium', ''),
        "university": request.form.get('university', 'N/A'),
        "time": request.form.get('time', 'N/A'),
        "max_marks": request.form.get('max_marks', 'N/A'),
        "uploader_name": request.form.get('admin_name', 'Unknown')
    }

    # Use a simpler filename now that data is in the DB
    # We add a unique number prefix to prevent overwrites, but can improve this later
    unique_prefix = str(int(os.times().system * 1000))
    filename = secure_filename(f"{unique_prefix}_{file.filename}")
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

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
        print(f"Database Error: {e}")
        # Optionally, delete the saved file if DB insert fails
        os.remove(filepath)
        return "Database error", 500

    return "Success", 200

# --- REWRITTEN: The API now queries the database ---
@app.route('/api/papers')
def get_papers():
    conn = sqlite3.connect('papers.db')
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM papers ORDER BY exam_year DESC')
    papers_rows = cursor.fetchall()
    conn.close()

    papers_list = []
    for row in papers_rows:
        paper = dict(row) # Convert the database row to a dictionary
        # Add the URL for downloading the file
        paper['url'] = url_for('get_uploaded_file', filename=paper['filename'])
        # Create a display title
        paper['original_name'] = f"{paper['subject']} {paper['exam_type']} {paper['exam_year']}"
        papers_list.append(paper)
        
    return jsonify(papers_list)

@app.route('/uploads/<path:filename>')
def get_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
