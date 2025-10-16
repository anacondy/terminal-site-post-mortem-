document.addEventListener('DOMContentLoaded', function () {
    const output = document.getElementById('output');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    
    // Ctrl+K to open search, Esc to close, F+S to show uploader details
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { 
            e.preventDefault(); 
            searchModal.classList.remove('hidden'); 
            searchInput.focus(); 
            searchInput.value = ''; 
        }
        if (e.key === 'Escape') { 
            if (!searchModal.classList.contains('hidden')) { 
                searchModal.classList.add('hidden'); 
            }
            // Close uploader details modal if open
            const detailsModal = document.getElementById('uploader-details-modal');
            if (detailsModal && !detailsModal.classList.contains('hidden')) {
                detailsModal.classList.add('hidden');
            }
        }
        // F+S shortcut to show uploader details for paper links
        if (e.key === 'f' || e.key === 'F') {
            const paperLinks = document.querySelectorAll('.paper-link');
            if (paperLinks.length > 0) {
                e.preventDefault();
                showUploaderDetails();
            }
        }
    });

    // Click outside search box to close
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.add('hidden');
        }
    });

    // Perform search with intelligent translation
    async function performSearch(query) {
        // Special shortcut: "upload" redirects to admin login
        if (query.trim().toLowerCase() === 'upload') { 
            handleAdminShortcut(); 
            return; 
        }
        
        addLine(`<span class="prompt">user@archives:~$</span> <span class="command">search --query="${query}"</span>`);
        await showProgressBar('Searching database...', 1000);
        
        try {
            const response = await fetch(`/api/papers?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            
            if (results.length > 0) {
                addLine(`Found <span class="highlight">${results.length}</span> result(s):`);
                results.forEach(paper => {
                    const title = `${paper.class} ${paper.subject} (Sem ${paper.semester}) - ${paper.exam_year}`;
                    const resultHTML = `<div class="search-result"><span>[${paper.exam_year}]</span> <a href="${paper.url}" class="paper-link" target="_blank" data-uploader="${paper.uploader_name}" data-date="${paper.upload_date}">${title}</a></div>`;
                    addLine(resultHTML);
                });
                addLine(`<br/><span class="desktop-only">// Press F to view uploader details, Ctrl + K to search again.</span>`);
            } else { 
                addLine('No results found for your query.'); 
                addLine(`<br/><span class="desktop-only">// Press Ctrl + K to search again.</span>`);
            }
        } catch (error) { 
            addLine('// Error connecting to the search API.', 'comment'); 
            console.error('Fetch error:', error);
        }
    }

    // Helper functions
    function addLine(text, className = '') { 
        const line = document.createElement('div'); 
        line.innerHTML = text; 
        line.className = `line ${className}`; 
        output.appendChild(line); 
        window.scrollTo(0, document.body.scrollHeight); 
    }
    
    function sleep(ms) { 
        return new Promise(resolve => setTimeout(resolve, ms)); 
    }
    
    async function showProgressBar(text, duration) { 
        const line = document.createElement('div'); 
        line.className = 'line progress-bar-container'; 
        line.innerHTML = `<span>${text}</span><div class="progress-bar-wrapper"><div class="progress-bar"></div></div>`; 
        output.appendChild(line); 
        await sleep(duration); 
        line.remove(); 
    }
    
    async function fetchDeviceInfo() { 
        addLine('Device Information:'); 
        const cores = navigator.hardwareConcurrency || 'N/A'; 
        addLine(`  - Logical CPU Cores: <span class="highlight">${cores}</span>`); 
        const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB (browser approx.)` : 'N/A'; 
        addLine(`  - Device Memory (RAM): <span class="highlight">${memory}</span>`); 
        
        if (navigator.storage && navigator.storage.estimate) { 
            const estimate = await navigator.storage.estimate(); 
            const usageMB = (estimate.usage / 1024 / 1024).toFixed(2); 
            const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2); 
            addLine(`  - Browser Storage Quota: <span class="highlight">${usageMB} MB used / ${quotaMB} MB total</span>`); 
        } else { 
            addLine('  - Browser Storage: API not supported.'); 
        }
        
        addLine('// Note: Browser security prevents access to total disk space or system RAM.', 'comment'); 
    }
    
    function handleAdminShortcut() { 
        addLine('// Redirecting to Admin Login page...', 'comment'); 
        setTimeout(() => { 
            window.location.href = '/login'; 
        }, 1000); 
    }
    
    // Show uploader details with blur effect
    function showUploaderDetails() {
        const paperLinks = document.querySelectorAll('.paper-link');
        if (paperLinks.length === 0) return;
        
        // Create modal if it doesn't exist
        let detailsModal = document.getElementById('uploader-details-modal');
        if (!detailsModal) {
            detailsModal = document.createElement('div');
            detailsModal.id = 'uploader-details-modal';
            detailsModal.className = 'hidden';
            document.body.appendChild(detailsModal);
        }
        
        // Build details content
        let detailsHTML = '<div class="uploader-details-box"><h3>Paper Upload Details</h3>';
        paperLinks.forEach((link, index) => {
            const uploader = link.getAttribute('data-uploader') || 'Unknown';
            const uploadDate = link.getAttribute('data-date') || 'Unknown';
            const title = link.textContent.trim();
            
            // Parse date to show month and year
            let displayDate = 'Unknown';
            if (uploadDate && uploadDate !== 'Unknown') {
                const date = new Date(uploadDate);
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                displayDate = `${months[date.getMonth()]} ${date.getFullYear()}`;
            }
            
            detailsHTML += `
                <div class="uploader-detail-item">
                    <div class="detail-title">${title}</div>
                    <div class="detail-info">
                        <span class="detail-uploader">Uploader: <span class="highlight">${uploader}</span></span>
                        <span class="detail-date">Date: <span class="highlight">${displayDate}</span></span>
                    </div>
                </div>
            `;
        });
        detailsHTML += '<p class="modal-hint">Press Esc to close</p></div>';
        
        detailsModal.innerHTML = detailsHTML;
        detailsModal.classList.remove('hidden');
        
        // Click to close
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                detailsModal.classList.add('hidden');
            }
        });
    }
    
    // Startup sequence
    async function start() { 
        addLine('// Welcome to the Terminal Archives.', 'comment'); 
        await sleep(500); 
        await showProgressBar('Connecting to archives...', 1500); 
        
        try { 
            const response = await fetch('/api/papers'); 
            const papers = await response.json(); 
            addLine(`// Connected. <span class="highlight">${papers.length}</span> papers found in the database.`); 
        } catch (error) { 
            addLine('// Connection to archives failed.', 'comment'); 
            console.error('Fetch error:', error); 
        }
        
        await sleep(500); 
        await showProgressBar('Initializing system...', 1000); 
        addLine('<span class="prompt">system@archives:~$</span> <span class="command">fetch --device-info</span>'); 
        await fetchDeviceInfo(); 
        await sleep(500); 
        addLine('<span class="prompt">system@archives:~$</span> <span class="command">ready</span>'); 
        addLine(`System ready. <span class="desktop-only">Press Ctrl + K to search the database.</span>`); 
    }
    
    // Event listeners
    searchInput.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            searchModal.classList.add('hidden'); 
            performSearch(searchInput.value); 
        } 
    });
    
    // Start the application
    start();
});
