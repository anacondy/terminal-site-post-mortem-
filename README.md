# Terminal Archives - Previous Year Papers

🌐 **Live Demo:** [View on GitHub Pages](https://anacondy.github.io/terminal-site-post-mortem-/) *(Configure in repository settings)*

A clean, terminal-style web application for storing and searching exam papers with intelligent search functionality and secure admin uploads.

## 📸 Screenshots

### Desktop View
![Terminal Main Interface](https://github.com/user-attachments/assets/70ee735b-9b91-4936-b975-2ca5107e17b6)

### Search Modal
![Search Interface](https://github.com/user-attachments/assets/cec5c47f-9262-473e-b092-7f45b56c6298)

### Mobile View (16:9 & 20:9 Optimized)
<img src="https://github.com/user-attachments/assets/d8cb0722-84d8-4f04-b779-053622bf573f" width="300" alt="Mobile 16:9 View">

### Offline/Error Page
![Offline Page](https://github.com/user-attachments/assets/09bbc17b-d07b-4953-a020-d4636743ccde)

## 💾 GitHub Storage Information

When hosting this project on GitHub:

- **Repository Size Limit:** 1 GB recommended (soft limit)
- **Individual File Size:** Max 100 MB per file
- **GitHub Pages Bandwidth:** 100 GB per month (soft limit)
- **GitHub Pages Site Size:** 1 GB recommended

**For Document/Paper Storage:**
- Store PDFs in the `uploads/` directory
- Use Git LFS (Large File Storage) for files over 50 MB
- Consider external storage (AWS S3, Google Cloud Storage) for large collections
- Each PDF should ideally be under 10 MB for optimal performance

## 🚀 GitHub Pages Deployment

This repository is configured to deploy automatically to GitHub Pages. The site includes:

- **Static Demo Mode**: When hosted on GitHub Pages, the site runs with demo data since GitHub Pages cannot run the Python Flask backend
- **Automatic Deployment**: Push to the `main` branch triggers automatic deployment via GitHub Actions
- **Configuration**: Ensure GitHub Pages is enabled in repository settings:
  1. Go to **Settings** → **Pages**
  2. Set **Source** to "GitHub Actions"
  3. The workflow will deploy on every push to `main`

**Important Notes:**
- GitHub Pages deployment shows a **demo version** with sample data
- Backend features (upload, login, database) are **not available** in the static GitHub Pages version
- To use full features, deploy the Flask application to a server that supports Python (e.g., Heroku, PythonAnywhere, AWS, etc.)

## Project Structure

```
terminal-site-post-mortem-/
├── index.html           # Static homepage for GitHub Pages
├── offline.html         # Static offline page
├── app.py              # Main Flask application (for server deployment)
├── database.py         # Database initialization and helpers
├── create_admin.py     # Script to create admin users
├── requirements.txt    # Python dependencies
├── .github/            # GitHub Actions workflows
│   └── workflows/
│       └── deploy-pages.yml  # Auto-deploy to GitHub Pages
├── templates/          # Flask HTML templates
│   ├── index.html      # Main terminal interface (Flask version)
│   ├── upload.html     # Admin multi-file upload page
│   ├── login.html      # Admin login page
│   └── offline.html    # Offline/error fallback page (Flask version)
├── static/             # Static assets
│   ├── style.css       # Main stylesheet with mobile optimizations
│   ├── script.js       # Terminal UI and search logic (works in both modes)
│   ├── upload.js       # Upload form logic
│   ├── sw.js           # Service Worker for offline support
│   └── images/         # Image assets
│       └── offline.jpg # Offline page illustration
└── uploads/            # Directory for uploaded PDFs (server deployment only)
```

## Features & Functionality

### Core Functionality
- **SQLite Database Integration** ✅ - Fast, scalable database for storing paper metadata
- **Secure Admin Login (Username/Password)** ✅ - Password-protected admin access with hashed credentials
- **Intelligent Search Engine** ✅ - Smart search with synonym support (sem, phy, 3rd, etc.) and case-insensitive matching
- **Direct PDF Viewing** ✅ - PDFs open directly in the browser
- **Offline Support** ✅ - Service Worker enables offline functionality with custom error page

### Admin Page Features  
- **Multi-File Drag & Drop Upload** ✅ - Upload multiple PDFs efficiently at once
- **Form Validation (Required Fields)** ✅ - Prevents uploads with missing required information
- **Duplicate File Handling** ✅ - Automatic file renaming to prevent overwrites
- **Comprehensive Form Fields** ✅ - All necessary fields including time, marks, university, etc.

### UI & UX Features
- **Classic Left-Aligned Terminal UI** ✅ - Clean, effective terminal-style interface
- **Smooth Animations & Transitions** ✅ - Fade-in effects, smooth scrolling, and polished interactions
- **Mobile Optimized** ✅ - Fully responsive for 16:9 and 20:9 phone screens
- **Performance Optimized** ✅ - Hardware acceleration, efficient rendering, minimal lag
- **Smooth "Marquee" Progress Bar** ✅ - Animated progress indicator
- **Ctrl+K Search Shortcut** ✅ - Quick keyboard access to search
- **Click-Away Search Dismissal** ✅ - Search modal closes when clicking outside
- **"upload" Keyword Shortcut** ✅ - Type "upload" in search to go directly to admin login
- **Custom Offline Page** ✅ - Beautiful error page for offline/disconnection scenarios

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
- **PWA Features**: Service Worker for offline support
- **Performance**: Hardware-accelerated animations, optimized rendering
- **Responsive Design**: Mobile-first approach with 16:9 and 20:9 screen optimizations

### Mobile Optimizations
- Responsive viewport configuration for all screen sizes
- Touch-friendly UI elements (44px minimum touch targets)
- Optimized font sizes and spacing for mobile readability
- Smooth scrolling and animations without lag
- Backdrop blur effects on supported devices
- High DPI screen support for crisp rendering

Made with <3 and a twist by Puppy pilot and @anacondy - for those who read between the logs.

