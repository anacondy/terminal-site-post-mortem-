document.addEventListener('DOMContentLoaded', function () {
    const output = document.getElementById('output');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const mobileSearchInput = document.getElementById('mobile-search-input');
    
    // --- Key Press Logic for F+S ---
    const keysPressed = {};
    let pressTimer = null;

    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        keysPressed[key] = true;
        if (keysPressed['f'] && keysPressed['s']) {
            if (!pressTimer) {
                pressTimer = setTimeout(showUploaderInfo, 1000);
            }
        }
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
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        keysPressed[key] = false;
        clearTimeout(pressTimer);
        pressTimer = null;
    });

    function showUploaderInfo() {
        const paperResults = document.querySelectorAll('.search-result');
        if (paperResults.length === 0) return;

        // Apply blur effect to the parent container
        const terminal = document.getElementById('terminal');
        terminal.classList.add('blur-effect');

        paperResults.forEach(result => {
            const link = result.querySelector('.paper-link');
            if (link && !result.classList.contains('info-overlay-active')) {
                // Trigger the animations
                result.classList.add('info-overlay-active');
                link.classList.add('struck-through');
                
                // Create and add the uploader info element
                const uploader = link.dataset.uploader;
                const date = new Date(link.dataset.date);
                const formattedDate = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                const infoSpan = document.createElement('span');
                infoSpan.className = 'uploader-info';
                infoSpan.textContent = `${uploader} ${formattedDate}`;
                result.appendChild(infoSpan);
            }
        });
    }

    // --- REWRITTEN: performSearch now formats results correctly on one line ---
    async function performSearch(query) {
        if (query.trim().toLowerCase() === 'upload') { handleAdminShortcut(); return; }
        addLine(`<span class="prompt">user@archives:~$</span> <span class="command">search --query="${query}"</span>`);
        await showProgressBar('Searching database...', 1000);
        try {
            const response = await fetch(`/api/papers?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            if (results.length > 0) {
                addLine(`Found <span class="highlight">${results.length}</span> result(s):`);
                results.forEach(paper => {
                    const title = `${paper.class} ${paper.subject} (Sem ${paper.semester}) - ${paper.exam_year}`;
                    // This new structure keeps everything on one line
                    const resultHTML = `
                        <div class="search-result">
                            <span>[${paper.exam_year}]</span> 
                            <a href="${paper.url}" class="paper-link" target="_blank" 
                               data-uploader="${paper.uploader_name}" 
                               data-date="${paper.upload_date}">
                               ${title}
                            </a>
                        </div>
                    `;
                    addLine(resultHTML);
                });
            } else { addLine('No results found for your query.'); }
        } catch (error) { addLine('// Error connecting to the search API.', 'comment'); }
        addLine(`<br/><span class="desktop-only">// Press Ctrl + K to search again.</span>`);
    }

    // --- All other functions and listeners are unchanged ---
    function addLine(text, className = '') { const line = document.createElement('div'); line.innerHTML = text; line.className = `line ${className}`; output.appendChild(line); window.scrollTo(0, document.body.scrollHeight); }
    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    async function showProgressBar(text, duration) { const line = document.createElement('div'); line.className = 'line progress-bar-container'; line.innerHTML = `<span>${text}</span><div class="progress-bar-wrapper"><div class="progress-bar"></div></div>`; output.appendChild(line); await sleep(duration); line.remove(); }
    async function fetchDeviceInfo() { addLine('Device Information:'); const cores = navigator.hardwareConcurrency || 'N/A'; addLine(`  - Logical CPU Cores: <span class="highlight">${cores}</span>`); const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB (browser approx.)` : 'N/A'; addLine(`  - Device Memory (RAM): <span class="highlight">${memory}</span>`); if (navigator.storage && navigator.storage.estimate) { const estimate = await navigator.storage.estimate(); const usageMB = (estimate.usage / 1024 / 1024).toFixed(2); const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2); addLine(`  - Browser Storage Quota: <span class="highlight">${usageMB} MB used / ${quotaMB} MB total</span>`); } else { addLine('  - Browser Storage: API not supported.'); } addLine('// Note: Browser security prevents access to total disk space or system RAM.', 'comment'); }
    function handleAdminShortcut() { addLine('// Redirecting to Admin Login page...', 'comment'); setTimeout(() => { window.location.href = '/login'; }, 1000); }
    async function start() { addLine('// Welcome to the Terminal Archives.', 'comment'); await sleep(500); await showProgressBar('Connecting to archives...', 1500); try { const response = await fetch('/api/papers'); const papers = await response.json(); addLine(`// Connected. <span class="highlight">${papers.length}</span> papers found in the database.`); } catch (error) { addLine('// Connection to archives failed.', 'comment'); console.error('Fetch error:', error); } await sleep(500); await showProgressBar('Initializing system...', 1000); addLine('<span class="prompt">system@archives:~$</span> <span class="command">fetch --device-info</span>'); await fetchDeviceInfo(); await sleep(500); addLine('<span class="prompt">system@archives:~$</span> <span class="command">ready</span>'); addLine(`System ready. <span class="desktop-only">Press Ctrl + K to search the database.</span>`); }
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchModal.classList.add('hidden'); performSearch(searchInput.value); } });
    mobileSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { performSearch(mobileSearchInput.value); mobileSearchInput.value = ''; mobileSearchInput.blur(); } });
    start();
});
