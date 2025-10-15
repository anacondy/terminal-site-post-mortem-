document.addEventListener('DOMContentLoaded', function () {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const formsWrapper = document.getElementById('forms-wrapper');
    
    let addedFiles = new Set(); // To track added files and prevent duplicates
    let formCounter = 0; // To give each form input a unique name

    // --- Drag & Drop Event Listeners ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
    
    // --- "Select Files" Button Listener ---
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // --- Main File Handling Function ---
    function handleFiles(files) {
        for (const file of files) {
            const fileIdentifier = `${file.name}-${file.size}`;

            // Check 1: Is it a PDF?
            if (file.type !== 'application/pdf') {
                alert(`'${file.name}' is not a PDF and will be ignored.`);
                continue;
            }

            // Check 2: Is it a duplicate?
            if (addedFiles.has(fileIdentifier)) {
                alert(`'${file.name}' has already been added.`);
                continue;
            }

            // If it's a valid, new PDF, create a form for it
            createFormCard(file);
            addedFiles.add(fileIdentifier);
        }
    }

    // --- Function to Create a Form Card ---
    function createFormCard(file) {
        const formId = formCounter++;
        const card = document.createElement('div');
        card.className = 'form-card';
        card.innerHTML = `
            <h3>${file.name}</h3>
            
            <label for="admin_name_${formId}">Your Name:</label>
            <input type="text" name="admin_name_${formId}" id="admin_name_${formId}" placeholder="e.g., Alvido" required>
            
            <label for="class_${formId}">Class:</label>
            <select name="class_${formId}" id="class_${formId}" required>
                <option value="" disabled selected>Select a Class</option>
                <option value="BA">BA</option> <option value="BSc">BSc</option> <option value="BA/BSc">BA/BSc</option> <option value="BSc Hons">BSc Hons</option> <option value="BBA">BBA</option> <option value="BCA">BCA</option> <option value="MCA">MCA</option>
            </select>
            
            <label for="subject_${formId}">Subject:</label>
            <select name="subject_${formId}" id="subject_${formId}" required>
                <option value="" disabled selected>Select a Subject</option>
                <option value="Maths">Maths</option> <option value="Physics">Physics</option> <option value="Chemistry">Chemistry</option> <option value="Hindi">Hindi</option> <option value="English">English</option> <option value="Biology">Biology</option> <option value="Psychology">Psychology</option> <option value="Zoology">Zoology</option> <option value="Computer Science">Computer Science</option> <option value="Political Science">Political Science</option> <option value="Statistics">Statistics</option> <option value="Geography">Geography</option> <option value="Biotechnology">Biotechnology</option> <option value="Microbiology">Microbiology</option> <option value="Environmental Science">Environmental Science</option> <option value="History">History</option> <option value="Economics">Economics</option>
            </select>
            
            <label for="semester_${formId}">Semester:</label>
            <select name="semester_${formId}" id="semester_${formId}" required>
                <option value="" disabled selected>Select a Semester</option>
                <option value="I">I (1)</option> <option value="II">II (2)</option> <option value="III">III (3)</option> <option value="IV">IV (4)</option> <option value="V">V (5)</option> <option value="VI">VI (6)</option> <option value="VII">VII (7)</option> <option value="VIII">VIII (8)</option> <option value="IX">IX (9)</option> <option value="X">X (10)</option>
                <option value="All Semesters">All Semesters</option>
            </select>

            <label for="exam_year_${formId}">Exam Year:</label>
            <input list="years" name="exam_year_${formId}" id="exam_year_${formId}" placeholder="e.g., 2025 or type custom year" required>
            
            <label for="exam_type_${formId}">Exam Type:</label>
            <select name="exam_type_${formId}" id="exam_type_${formId}" required>
                <option value="" disabled selected>Select an Exam Type</option>
                <option value="Main Semester">Main Semester</option> <option value="CIA">CIA</option> <option value="Half Yearly">Half Yearly</option> <option value="Class Test">Class Test</option> <option value="Yearly">Yearly</option>
            </select>
            
            <label for="medium_${formId}">Medium:</label>
            <select name="medium_${formId}" id="medium_${formId}" required>
                <option value="" disabled selected>Select a Medium</option>
                <option value="English Medium">English Medium</option>
                <option value="Hindi Medium">Hindi Medium</option>
                <option value="Hinglish">Hinglish</option>
            </select>
            
            <label for="time_${formId}">Time (Optional):</label>
            <input list="times" name="time_${formId}" id="time_${formId}" placeholder="e.g., 3 hr">
            
            <label for="max_marks_${formId}">Max Marks (Optional):</label>
            <input list="marks" name="max_marks_${formId}" id="max_marks_${formId}" placeholder="e.g., 100">
        `;
        formsWrapper.appendChild(card);
    }
});
