document.addEventListener('DOMContentLoaded', function () {
    const output = document.getElementById('output');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    
    // Configuration constants
    const CONFIG = {
        DEMO_MODE_DOMAINS: ['.github.io', 'github.io'],
        SEARCH_DEBOUNCE_MS: 300,
        ANIMATION_DURATION_MS: 1000,
        MOBILE_BREAKPOINT: 768
    };
    
    /**
     * Detect if the user is on a mobile device
     * Checks both user agent and screen dimensions
     */
    function detectMobileDevice() {
        const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
        const aspectRatio = window.innerWidth / window.innerHeight;
        
        // Check for mobile aspect ratios in portrait mode (16:9, 18:9, 20:9)
        const isMobileAspectRatio = aspectRatio >= 0.4 && aspectRatio <= 0.6;
        
        if ((isMobileUA || isSmallScreen) && (isMobileAspectRatio || isSmallScreen)) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    }
    
    // Run detection on load and resize with debounce
    let resizeTimeout;
    detectMobileDevice();
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(detectMobileDevice, 100);
    });
    
    /**
     * Determine if the site is in demo mode
     * Demo mode is used for static GitHub Pages deployment
     */
    const hostname = window.location.hostname;
    const isGitHubPages = CONFIG.DEMO_MODE_DOMAINS.some(domain => 
        hostname.endsWith(domain) || hostname === domain.replace('.', '')
    );
    const demoMode = isGitHubPages || (hostname !== 'localhost' && hostname !== '127.0.0.1');
    
    // Demo data for static site deployment (GitHub Pages)
    const demoPapers = [
        {
            id: 1,
            class: "BSc",
            subject: "Physics",
            semester: "III",
            exam_year: "2024",
            exam_type: "End Semester",
            paper_code: "PHY301",
            exam_number: "2024/001",
            medium: "English",
            university: "Demo University",
            time: "3 hours",
            max_marks: "100",
            uploader_name: "Demo Admin",
            upload_date: "2024-01-15",
            filename: "demo_physics_2024.pdf",
            url: "#"
        },
        {
            id: 2,
            class: "BSc",
            subject: "Mathematics",
            semester: "III",
            exam_year: "2023",
            exam_type: "End Semester",
            paper_code: "MATH301",
            exam_number: "2023/002",
            medium: "English",
            university: "Demo University",
            time: "3 hours",
            max_marks: "100",
            uploader_name: "Demo Admin",
            upload_date: "2023-12-10",
            filename: "demo_math_2023.pdf",
            url: "#"
        },
        {
            id: 3,
            class: "BSc",
            subject: "Chemistry",
            semester: "II",
            exam_year: "2024",
            exam_type: "Mid Semester",
            paper_code: "CHEM201",
            exam_number: "2024/003",
            medium: "English",
            university: "Demo University",
            time: "2 hours",
            max_marks: "50",
            uploader_name: "Demo Admin",
            upload_date: "2024-03-20",
            filename: "demo_chemistry_2024.pdf",
            url: "#"
        }
    ];
    
    /**
     * Register service worker for offline support
     * Uses correct path based on environment
     */
    const swPath = window.location.hostname === 'localhost' ? '/static/sw.js' : './static/sw.js';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(swPath)
            .then(registration => console.log('Service Worker registered'))
            .catch(err => console.error('Service Worker registration failed:', err));
    }
    
    /**
     * Global keyboard shortcuts
     * - Ctrl+K / Cmd+K: Open search modal
     * - Escape: Close modals
     * - F: Show uploader details
     */
    document.addEventListener('keydown', (e) => {
        // Open search: Ctrl/Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { 
            e.preventDefault(); 
            openSearchModal();
        }
        
        // Close modals: Escape
        if (e.key === 'Escape') { 
            closeSearchModal();
            closeUploaderDetailsModal();
        }
        
        // Show uploader details: F key
        if (e.key === 'f' || e.key === 'F') {
            const paperLinks = document.querySelectorAll('.paper-link');
            if (paperLinks.length > 0) {
                e.preventDefault();
                showUploaderDetails();
            }
        }
    });

    /**
     * Open search modal with smooth animation
     */
    function openSearchModal() {
        searchModal.classList.remove('hidden');
        // Use requestAnimationFrame for smooth focus
        requestAnimationFrame(() => {
            searchInput.focus();
            searchInput.value = '';
        });
    }

    /**
     * Close search modal
     */
    function closeSearchModal() {
        if (!searchModal.classList.contains('hidden')) {
            searchModal.classList.add('hidden');
        }
    }

    /**
     * Close uploader details modal
     */
    function closeUploaderDetailsModal() {
        const detailsModal = document.getElementById('uploader-details-modal');
        if (detailsModal && !detailsModal.classList.contains('hidden')) {
            detailsModal.classList.add('hidden');
        }
    }

    /**
     * Click outside search box to close
     */
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });

    /**
     * Perform intelligent search with translation
     * Supports shortcuts like "phy" -> "physics", "3rd" -> "III"
     */
    async function performSearch(query) {
        // Sanitize input
        const sanitizedQuery = query.trim();
        
        // Special shortcut: "upload" redirects to admin login
        if (sanitizedQuery.toLowerCase() === 'upload') { 
            handleAdminShortcut(); 
            return; 
        }
        
        if (!sanitizedQuery) {
            addLine('// Please enter a search term.', 'comment');
            return;
        }
        
        addLine(`<span class="prompt">user@archives:~$</span> <span class="command">search --query="${sanitizedQuery}"</span>`);
        await showProgressBar('Searching database...', CONFIG.ANIMATION_DURATION_MS);
        
        try {
            let results;
            
            if (demoMode) {
                // Use demo data for static GitHub Pages deployment
                results = searchDemoPapers(sanitizedQuery);
            } else {
                // Use backend API for local Flask deployment
                const response = await fetch(`/api/papers?q=${encodeURIComponent(sanitizedQuery)}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                results = await response.json();
            }
            
            displaySearchResults(results);
        } catch (error) { 
            addLine('// Error connecting to the search API.', 'comment'); 
            console.error('Search error:', error);
        }
    }
    
    /**
     * Display search results in terminal
     */
    function displaySearchResults(results) {
        if (results.length > 0) {
            addLine(`Found <span class="highlight">${results.length}</span> result(s):`);
            results.forEach(paper => {
                const title = `${paper.class} ${paper.subject} (Sem ${paper.semester}) - ${paper.exam_year}`;
                const resultHTML = `<div class="search-result"><span>[${paper.exam_year}]</span> <a href="${paper.url}" class="paper-link" target="_blank" data-uploader="${paper.uploader_name}" data-date="${paper.upload_date}">${title}</a></div>`;
                addLine(resultHTML);
            });
            addLine(`<br/><span class="desktop-only">// Press F to view uploader details, Ctrl + K to search again.</span>`);
            
            if (demoMode) {
                addLine(`<br/><span class="comment">// Note: This is a demo version. Backend features (upload, login, database) are not available on GitHub Pages.</span>`);
            }
        } else { 
            addLine('No results found for your query.'); 
            addLine(`<br/><span class="desktop-only">// Press Ctrl + K to search again.</span>`);
        }
    }
    
    /**
     * Search demo papers with intelligent translation
     * Used for static site deployment (GitHub Pages)
     */
    function searchDemoPapers(query) {
        if (!query || query.trim() === '') {
            return demoPapers;
        }
        
        const searchTerms = query.toLowerCase().split(/\s+/);
        
        // Translation map for common shortcuts and synonyms
        const TRANSLATION_MAP = {
            '1': 'i', '2': 'ii', '3': 'iii', '4': 'iv', '5': 'v', '6': 'vi', 
            '7': 'vii', '8': 'viii', '9': 'ix', '10': 'x',
            'one': 'i', 'two': 'ii', 'three': 'iii', 'four': 'iv', 'five': 'v', 
            'six': 'vi', 'seven': 'vii', 'eight': 'viii',
            'first': 'i', 'second': 'ii', 'third': 'iii', 'fourth': 'iv', 'fifth': 'v', 
            '3rd': 'iii', '1st': 'i', '2nd': 'ii',
            'sem': 'semester',
            'phy': 'physics', 'pys': 'psychology', 'env': 'environmental', 'sci': 'science',
            'his': 'history', 'eco': 'economics', 'stats': 'statistics', 'biotech': 'biotechnology',
            'cs': 'computer', 'ps': 'political', 'geo': 'geography', 'zoo': 'zoology',
            'bot': 'botany', 'eng': 'english', 'hin': 'hindi', 'chem': 'chemistry', 
            'math': 'mathematics', 'maths': 'mathematics'
        };
        
        const processedTerms = searchTerms.map(term => TRANSLATION_MAP[term] || term);
        
        return demoPapers.filter(paper => {
            const searchableText = [
                paper.class,
                paper.subject,
                paper.semester,
                paper.exam_year,
                paper.exam_type,
                paper.paper_code,
                paper.exam_number,
                paper.medium,
                paper.university,
                paper.uploader_name
            ].join(' ').toLowerCase();
            
            return processedTerms.every(term => searchableText.includes(term));
        });
    }

    /**
     * Helper: Add a line to terminal output with smooth animation
     */
    function addLine(text, className = '') { 
        const line = document.createElement('div'); 
        line.innerHTML = text; 
        line.className = `line ${className}`; 
        output.appendChild(line);
        
        // Smooth scroll to bottom using requestAnimationFrame
        requestAnimationFrame(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
    }
    
    /**
     * Helper: Sleep/delay function
     */
    function sleep(ms) { 
        return new Promise(resolve => setTimeout(resolve, ms)); 
    }
    
    /**
     * Helper: Show animated progress bar
     */
    async function showProgressBar(text, duration) { 
        const line = document.createElement('div'); 
        line.className = 'line progress-bar-container'; 
        line.innerHTML = `<span>${text}</span><div class="progress-bar-wrapper"><div class="progress-bar"></div></div>`; 
        output.appendChild(line); 
        await sleep(duration); 
        line.remove(); 
    }
    
    /**
     * Fetch and display device information
     */
    async function fetchDeviceInfo() { 
        addLine('Device Information:'); 
        const cores = navigator.hardwareConcurrency || 'N/A'; 
        addLine(`  - Logical CPU Cores: <span class="highlight">${cores}</span>`); 
        const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB (browser approx.)` : 'N/A'; 
        addLine(`  - Device Memory (RAM): <span class="highlight">${memory}</span>`); 
        
        if (navigator.storage && navigator.storage.estimate) { 
            try {
                const estimate = await navigator.storage.estimate(); 
                const usageMB = (estimate.usage / 1024 / 1024).toFixed(2); 
                const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2); 
                addLine(`  - Browser Storage Quota: <span class="highlight">${usageMB} MB used / ${quotaMB} MB total</span>`); 
            } catch (error) {
                addLine('  - Browser Storage: Unable to estimate.');
                console.error('Storage estimate error:', error);
            }
        } else { 
            addLine('  - Browser Storage: API not supported.'); 
        }
        
        addLine('// Note: Browser security prevents access to total disk space or system RAM.', 'comment'); 
    }
    
    /**
     * Handle admin upload shortcut
     */
    function handleAdminShortcut() { 
        if (demoMode) {
            addLine('// Redirecting to Admin Login page (UI preview only)...', 'comment');
            addLine('// Note: Backend features are not available in demo mode.', 'comment');
            setTimeout(() => { 
                window.location.href = 'login.html'; 
            }, 1000);
        } else {
            addLine('// Redirecting to Admin Login page...', 'comment'); 
            setTimeout(() => { 
                window.location.href = '/login'; 
            }, 1000); 
        }
    }
    
    /**
     * Show uploader details modal with blur effect
     */
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
        
        // Build details content with XSS protection
        let detailsHTML = '<div class="uploader-details-box"><h3>Paper Upload Details</h3>';
        paperLinks.forEach((link, index) => {
            const uploader = escapeHtml(link.getAttribute('data-uploader') || 'Unknown');
            const uploadDate = link.getAttribute('data-date') || 'Unknown';
            const title = escapeHtml(link.textContent.trim());
            
            // Parse and format date
            let displayDate = 'Unknown';
            if (uploadDate && uploadDate !== 'Unknown') {
                try {
                    const date = new Date(uploadDate);
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    displayDate = `${months[date.getMonth()]} ${date.getFullYear()}`;
                } catch (e) {
                    displayDate = 'Unknown';
                }
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
        detailsHTML += '<p class="modal-hint">Press Esc to close or click outside</p></div>';
        
        detailsModal.innerHTML = detailsHTML;
        detailsModal.classList.remove('hidden');
        
        // Click to close
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) {
                detailsModal.classList.add('hidden');
            }
        });
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Application startup sequence
     */
    async function start() { 
        addLine('// Welcome to the Terminal Archives.', 'comment'); 
        await sleep(500); 
        await showProgressBar('Connecting to archives...', 1500); 
        
        try { 
            let papers;
            if (demoMode) {
                // Use demo data for GitHub Pages
                papers = demoPapers;
                addLine(`// Connected. <span class="highlight">${papers.length}</span> demo papers found in the database.`);
                addLine('// <span class="highlight">Demo Mode:</span> This is a static preview. Backend features are not available.', 'comment');
            } else {
                // Use backend API for local Flask deployment
                const response = await fetch('/api/papers'); 
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                papers = await response.json(); 
                addLine(`// Connected. <span class="highlight">${papers.length}</span> papers found in the database.`);
            }
        } catch (error) { 
            addLine('// Connection to archives failed. Running in demo mode.', 'comment'); 
            addLine(`// Demo Mode: <span class="highlight">${demoPapers.length}</span> demo papers available.`);
            console.error('Connection error:', error); 
        }
        
        await sleep(500); 
        await showProgressBar('Initializing system...', 1000); 
        addLine('<span class="prompt">system@archives:~$</span> <span class="command">fetch --device-info</span>'); 
        await fetchDeviceInfo(); 
        await sleep(500); 
        addLine('<span class="prompt">system@archives:~$</span> <span class="command">ready</span>'); 
        
        // Show appropriate hint based on device type
        if (document.body.classList.contains('mobile-device')) {
            addLine(`System ready. Tap anywhere to search the database.`);
            // Add one-time click handler for mobile to open search
            document.body.addEventListener('click', function mobileSearchTrigger(e) {
                // Don't trigger if clicking on links or inside search modal
                if (e.target.tagName !== 'A' && 
                    !e.target.closest('#search-modal') && 
                    searchModal.classList.contains('hidden')) {
                    openSearchModal();
                }
            }, { once: true });
        } else {
            addLine(`System ready. <span class="desktop-only">Press Ctrl + K to search the database.</span>`);
        }
    }
    
    /**
     * Search input event handler
     */
    searchInput.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            closeSearchModal();
            performSearch(searchInput.value); 
        } 
    });
    
    /**
     * Mobile search button handler
     */
    const mobileSearchButton = document.querySelector('.mobile-search-button');
    if (mobileSearchButton) {
        mobileSearchButton.addEventListener('click', (e) => {
            e.preventDefault();
            openSearchModal();
        });
    }
    
    // Start the application
    start();
});
