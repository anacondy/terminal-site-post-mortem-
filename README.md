# Terminal Archives - Previous Year Papers

A clean, terminal-style web application for storing and searching exam papers with intelligent search functionality and secure admin uploads.

## Project Structure

```
terminal-site-post-mortem-/
├── app.py              # Main Flask application
├── database.py         # Database initialization and helpers
├── create_admin.py     # Script to create admin users
├── requirements.txt    # Python dependencies
├── templates/          # HTML templates
│   ├── index.html      # Main terminal interface
│   ├── upload.html     # Admin multi-file upload page
│   └── login.html      # Admin login page
├── static/             # Static assets
│   ├── style.css       # Main stylesheet
│   ├── script.js       # Terminal UI and search logic
│   └── upload.js       # Upload form logic
└── uploads/            # Directory for uploaded PDFs
```

## Features & Functionality

### Core Functionality
- **SQLite Database Integration** ✅ - Fast, scalable database for storing paper metadata
- **Secure Admin Login (Username/Password)** ✅ - Password-protected admin access with hashed credentials
- **Intelligent Search Engine** ✅ - Smart search with synonym support (sem, phy, 3rd, etc.) and case-insensitive matching
- **Direct PDF Viewing** ✅ - PDFs open directly in the browser

### Admin Page Features  
- **Multi-File Drag & Drop Upload** ✅ - Upload multiple PDFs efficiently at once
- **Form Validation (Required Fields)** ✅ - Prevents uploads with missing required information
- **Duplicate File Handling** ✅ - Automatic file renaming to prevent overwrites
- **Comprehensive Form Fields** ✅ - All necessary fields including time, marks, university, etc.

### UI & UX Features
- **Classic Left-Aligned Terminal UI** ✅ - Clean, effective terminal-style interface
- **Smooth "Marquee" Progress Bar** ✅ - Animated progress indicator
- **Ctrl+K Search Shortcut** ✅ - Quick keyboard access to search
- **Click-Away Search Dismissal** ✅ - Search modal closes when clicking outside
- **"upload" Keyword Shortcut** ✅ - Type "upload" in search to go directly to admin login

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Create Admin User

Run the admin creation script to set up your first admin account:

```bash
python create_admin.py
```

You'll be prompted to enter a username and password.

### 3. Run the Application

```bash
python app.py
```

The application will start on `http://localhost:5000`

### 4. Access the Site

- **Main page**: http://localhost:5000 - View and search papers
- **Admin login**: http://localhost:5000/login - Admin authentication
- **Admin upload**: http://localhost:5000/admin - Upload papers (requires login)

## Usage

### Searching Papers
1. Press `Ctrl+K` on the main page to open the search modal
2. Enter search terms (e.g., "Physics 2024" or "BSc 3rd sem")
3. The intelligent search understands shortcuts like:
   - `phy` = Physics
   - `3` or `3rd` or `III` = Third semester
   - `sem` = semester
4. Click on any result to view the PDF directly in your browser

### Admin Upload Shortcut
- Type "upload" in the search box to be redirected to the admin login page

### Uploading Papers
1. Log in at `/login` with your admin credentials
2. Drag and drop PDF files or click to select files
3. Fill in the required information for each paper:
   - Required: Name, Class, Subject, Semester, Year, Exam Type, Medium
   - Optional: Exam Number, Paper Code, University, Time, Max Marks
4. Click "Upload All Pending Files" to submit

## Technical Details

- **Framework**: Flask 2.3.3
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript, CSS3
- **Security**: Werkzeug password hashing
- **File Handling**: Secure filename generation with unique prefixes
