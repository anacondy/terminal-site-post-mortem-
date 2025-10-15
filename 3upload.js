document.addEventListener('DOMContentLoaded', function () {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const formsWrapper = document.getElementById('forms-wrapper');
    const uploadAllBtn = document.getElementById('upload-all-btn');
    
    let addedFiles = new Map(); // Use a Map to store file and its card element

    // --- Drag & Drop and File Input Event Listeners ---
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('drag-over'); });
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); });

    // --- Main File Handling Function ---
    function handleFiles(files) {
        for (const file of files) {
            const fileIdentifier = `${file.name}-${file.size}`;
            if (file.type !== 'application/pdf') { alert(`'${file.name}' is not a PDF and will be ignored.`); continue; }
            if (addedFiles.has(fileIdentifier)) { alert(`'${file.name}' has already been added.`); continue; }

            const card = createFormCard(file);
            formsWrapper.appendChild(card);
            addedFiles.set(fileIdentifier, { file: file, card: card, uploaded: false });
        }
    }

    // --- Function to Create a Form Card ---
    function createFormCard(file) {
        const card = document.createElement('div');
        card.className = 'form-card';
        // IMPORTANT: All inputs have simple names like "class", "subject".
        // The server will process them one at a time.
        card.innerHTML = `
            <h3 title="${file.name}">${file.name}</h3>
            <div class="status-indicator">Pending</div>
            
            <label>Your Name:</label> <input type="text" name="admin_name" placeholder="e.g., Alvido" required>
            <label>Class:</label> <select name="class" required> <option value="" disabled selected>Select a Class</option> <option value="BA">BA</option> <option value="BSc">BSc</option> <option value="BA/BSc">BA/BSc</option> <option value="BSc Hons">BSc Hons</option> <option value="BBA">BBA</option> <option value="BCA">BCA</option> <option value="MCA">MCA</option> </select>
            <label>Subject:</label> <select name="subject" required> <option value="" disabled selected>Select a Subject</option> <option value="Maths">Maths</option> <option value="Physics">Physics</option> <option value="Chemistry">Chemistry</option> <option value="Hindi">Hindi</option> <option value="English">English</option> <option value="Biology">Biology</option> <option value="Psychology">Psychology</option> <option value="Zoology">Zoology</option> <option value="Computer Science">Computer Science</option> <option value="Political Science">Political Science</option> <option value="Statistics">Statistics</option> <option value="Geography">Geography</option> <option value="Biotechnology">Biotechnology</option> <option value="Microbiology">Microbiology</option> <option value="Environmental Science">Environmental Science</option> <option value="History">History</option> <option value="Economics">Economics</option> </select>
            <label>Semester:</label> <select name="semester" required> <option value="" disabled selected>Select a Semester</option> <option value="I">I (1)</option> <option value="II">II (2)</option> <option value="III">III (3)</option> <option value="IV">IV (4)</option> <option value="V">V (5)</option> <option value="VI">VI (6)</option> <option value="VII">VII (7)</option> <option value="VIII">VIII (8)</option> <option value="IX">IX (9)</option> <option value="X">X (10)</option> <option value="All Semesters">All Semesters</option> </select>
            <label>Exam Year:</label> <input list="years" name="exam_year" placeholder="e.g., 2025" required>
            <label>Exam Type:</label> <select name="exam_type" required> <option value="" disabled selected>Select an Exam Type</option> <option value="Main Semester">Main Semester</option> <option value="CIA">CIA</option> <option value="Half Yearly">Half Yearly</option> <option value="Class Test">Class Test</option> <option value="Yearly">Yearly</option> </select>
            <label>Medium:</label> <select name="medium" required> <option value="" disabled selected>Select a Medium</option> <option value="English Medium">English Medium</option> <option value="Hindi Medium">Hindi Medium</option> <option value="Hinglish">Hinglish</option> </select>
            <label>Time (Optional):</label> <input list="times" name="time" placeholder="e.g., 3 hr">
            <label>Max Marks (Optional):</label> <input list="marks" name="max_marks" placeholder="e.g., 100">
        `;
        return card;
    }

    // --- NEW: "Upload All" Button Logic ---
    uploadAllBtn.addEventListener('click', async () => {
        for (const [identifier, data] of addedFiles.entries()) {
            if (!data.uploaded) {
                await uploadFile(data);
            }
        }
    });

    // --- NEW: Asynchronous Upload Function for a single file ---
    async function uploadFile(data) {
        const { file, card } = data;
        const statusIndicator = card.querySelector('.status-indicator');
        
        statusIndicator.textContent = 'Uploading...';
        statusIndicator.style.backgroundColor = '#f0ad4e'; // Orange

        const formData = new FormData();
        formData.append('file', file);

        // Get all input values from this specific card
        const inputs = card.querySelectorAll('input, select');
        for (const input of inputs) {
            formData.append(input.name, input.value);
        }

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                statusIndicator.textContent = '✅ Uploaded';
                statusIndicator.style.backgroundColor = '#5cb85c'; // Green
                data.uploaded = true;
            } else {
                statusIndicator.textContent = '❌ Failed';
                statusIndicator.style.backgroundColor = '#d9534f'; // Red
            }
        } catch (error) {
            console.error('Upload error:', error);
            statusIndicator.textContent = '❌ Network Error';
            statusIndicator.style.backgroundColor = '#d9534f';
        }
    }

    // --- NEW: Keyboard Navigation for Left/Right Arrows ---
    document.addEventListener('keydown', (e) => {
        // We only want this to work if the user is not typing in an input field
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT') {
            return;
        }

        const scrollAmount = 420; // Width of a card + gap
        if (e.key === 'ArrowRight') {
            formsWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else if (e.key === 'ArrowLeft') {
            formsWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    });
});
