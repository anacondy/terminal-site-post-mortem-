document.addEventListener('DOMContentLoaded', function () {
    const output = document.getElementById('output');
    const searchModal = document.getElementById('search-modal');
    // ... (rest of the variable declarations are the same)
    const mobileSearchInput = document.getElementById('mobile-search-input');
    let livePapersDB = [];

    // --- MODIFIED: The admin shortcut now redirects to the login page ---
    function handleAdminShortcut() {
        addLine('// Redirecting to Admin Login page...', 'comment');
        setTimeout(() => {
            window.location.href = '/login'; // Simply go to the login page
        }, 1000);
    }
    
    // ... (All other functions and event listeners are unchanged)
    // You can copy the rest of the script.js file content from our previous conversation
    function addLine(text, className = '') { const line = document.createElement('div'); line.innerHTML = text; line.className = `line ${className}`; output.appendChild(line); window.scrollTo(0, document.body.scrollHeight); }
    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    async function showProgressBar(text, duration) { const line = document.createElement('div'); line.className = 'line progress-bar-container'; line.innerHTML = `<span>${text}</span><div class="progress-bar-wrapper"><div class="progress-bar"></div></div>`; output.appendChild(line); await sleep(duration); line.remove(); }
    async function fetchDeviceInfo() { addLine('Device Information:'); const cores = navigator.hardwareConcurrency || 'N/A'; addLine(`  - Logical CPU Cores: <span class="highlight">${cores}</span>`); const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB (browser approx.)` : 'N/A'; addLine(`  - Device Memory (RAM): <span class="highlight">${memory}</span>`); if (navigator.storage && navigator.storage.estimate) { const estimate = await navigator.storage.estimate(); const usageMB = (estimate.usage / 1024 / 1024).toFixed(2); const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2); addLine(`  - Browser Storage Quota: <span class="highlight">${usageMB} MB used / ${quotaMB} MB total</span>`); } else { addLine('  - Browser Storage: API not supported.'); } addLine('// Note: Browser security prevents access to total disk space or system RAM.', 'comment'); }
    async function performSearch(query) { if (query.trim().toLowerCase() === 'upload') { handleAdminShortcut(); return; } addLine(`<span class="prompt">user@archives:~$</span> <span class="command">search --query="${query}"</span>`); await showProgressBar('Searching database...', 1000); try { const response = await fetch(`/api/papers?q=${encodeURIComponent(query)}`); const results = await response.json(); if (results.length > 0) { addLine(`Found <span class="highlight">${results.length}</span> result(s):`); results.forEach(paper => { const title = `${paper.class} ${paper.subject} (Sem ${paper.semester}) - ${paper.exam_year}`; addLine(`  <div class="search-result">[${paper.exam_year}] <a href="${paper.url}" target="_blank">${title}</a></div>`); }); } else { addLine('No results found for your query.'); } } catch (error) { addLine('// Error connecting to the search API.', 'comment'); } addLine(`<br/><span class="desktop-only">// Press Ctrl + K to search again.</span>`); }
    async function start() { addLine('// Welcome to the Terminal Archives.', 'comment'); await sleep(500); await showProgressBar('Connecting to archives...', 1500); try { const response = await fetch('/api/papers'); const papers = await response.json(); addLine(`// Connected. <span class="highlight">${papers.length}</span> papers found in the database.`); } catch (error) { addLine('// Connection to archives failed.', 'comment'); console.error('Fetch error:', error); } await sleep(500); await showProgressBar('Initializing system...', 1000); addLine('<span class="prompt">system@archives:~$</span> <span class="command">fetch --device-info</span>'); await fetchDeviceInfo(); await sleep(500); addLine('<span class="prompt">system@archives:~$</span> <span class="command">ready</span>'); addLine(`System ready. <span class="desktop-only">Press Ctrl + K to search the database.</span>`); }
    const searchInput = document.getElementById('search-input');
    window.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchModal.classList.remove('hidden'); searchInput.focus(); searchInput.value = ''; } if (e.key === 'Escape') { if (!searchModal.classList.contains('hidden')) { searchModal.classList.add('hidden'); } } });
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); searchModal.classList.add('hidden'); performSearch(searchInput.value); } });
    mobileSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { performSearch(mobileSearchInput.value); mobileSearchInput.value = ''; mobileSearchInput.blur(); } });
    start();
});
