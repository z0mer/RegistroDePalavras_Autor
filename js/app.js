// ========================================
// APP - MAIN APPLICATION LOGIC
// ========================================

const App = {
    // State
    books: [],
    records: [],
    currentBookId: null,
    currentBook: null,
    currentDeleteTarget: null,
    wordsChart: null,
    bookChart: null,
    chartRange: 7,

    // Book detail data
    characters: [],
    scenarios: [],
    chapters: [],

    // ========================================
    // INITIALIZATION
    // ========================================

    async init() {
        console.log('🚀 Inicializando aplicação...');
        
        // Load saved theme first (before auth check)
        this.loadTheme();
        
        // Initialize Lucide icons for login screen
        lucide.createIcons();
        
        // Setup login button
        document.getElementById('btnGoogleLogin')?.addEventListener('click', () => this.handleLogin());
        
        // Wait for auth state
        const user = await Auth.init();
        
        if (!user) {
            console.log('⏳ Aguardando login...');
            return;
        }
        
        // User is logged in, initialize app
        await this.initApp();
    },

    async initApp() {
        console.log('📱 Inicializando interface...');
        
        // Setup theme toggle
        document.getElementById('btnToggleTheme')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('btnToggleThemeMobile')?.addEventListener('click', () => this.toggleTheme());
        
        // Setup logout
        document.getElementById('btnLogout')?.addEventListener('click', () => this.handleLogout());
        
        // Setup app
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupChartFilters();
        this.setupTabs();

        await this.loadData();
        this.initCharts();

        document.getElementById('recordDate').value = Storage.getDateString();
        
        // Initialize Lucide icons
        lucide.createIcons();
        
        console.log('✅ Aplicação inicializada!');
    },

    async handleLogin() {
        const btn = document.getElementById('btnGoogleLogin');
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = '<span class="loading-spinner"></span> Entrando...';
            btn.disabled = true;
            
            await Auth.signInWithGoogle();
            
            // Auth state listener will handle the rest
            await this.initApp();
            
        } catch (error) {
            console.error('Erro no login:', error);
            this.showToast(error.message, 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    async handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            try {
                await Auth.signOut();
                // Auth state listener will show login screen
                window.location.reload();
            } catch (error) {
                this.showToast('Erro ao sair. Tente novamente.', 'error');
            }
        }
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    },
    
    updateThemeIcon(theme) {
        const iconElement = document.querySelector('#btnToggleTheme i');
        const iconElementMobile = document.querySelector('#btnToggleThemeMobile i');
        const iconName = theme === 'dark' ? 'moon' : 'sun';
        
        if (iconElement) {
            iconElement.setAttribute('data-lucide', iconName);
        }
        if (iconElementMobile) {
            iconElementMobile.setAttribute('data-lucide', iconName);
        }
        lucide.createIcons();
    },

    // ========================================
    // DATA LOADING
    // ========================================

    async loadData() {
        try {
            [this.books, this.records] = await Promise.all([
                Storage.getBooks(),
                Storage.getRecords()
            ]);

            this.updateDashboard();
            this.renderBooks();
            this.updateBookSelect();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showToast('Erro ao carregar dados. Verifique sua conexão.', 'error');
        }
    },

    async loadBookDetails(bookId) {
        try {
            [this.characters, this.scenarios, this.chapters] = await Promise.all([
                Storage.getCharactersByBook(bookId),
                Storage.getScenariosByBook(bookId),
                Storage.getChaptersByBook(bookId)
            ]);
        } catch (error) {
            console.error('Erro ao carregar detalhes do livro:', error);
        }
    },

    // ========================================
    // NAVIGATION
    // ========================================

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
        });

        document.querySelectorAll('.mobile-nav-item[data-page]').forEach(btn => {
            btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
        });

        document.getElementById('btnBackToBooks').addEventListener('click', () => {
            this.navigateTo('books');
        });
    },

    navigateTo(page) {
        document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        if (page === 'dashboard') {
            document.getElementById('dashboardPage').classList.add('active');
            this.updateChart();
        } else if (page === 'books') {
            document.getElementById('booksPage').classList.add('active');
        } else if (page === 'bookDetails') {
            document.getElementById('bookDetailsPage').classList.add('active');
        }
    },

    // ========================================
    // TABS
    // ========================================

    setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                btn.classList.add('active');
                const tabId = 'tab' + btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1);
                document.getElementById(tabId).classList.add('active');
            });
        });
    },

    // ========================================
    // DASHBOARD
    // ========================================

    updateDashboard() {
        const totalWords = Storage.calculateTotalWords(this.records);
        const avgWords = Storage.calculateAverageWords(this.records);
        const bestDay = Storage.findBestDay(this.records);

        document.getElementById('totalWords').textContent = Storage.formatWords(totalWords);
        document.getElementById('avgWords').textContent = Storage.formatWords(avgWords);
        document.getElementById('bestDay').textContent = Storage.formatWords(bestDay);

        this.renderRecentRecords();
    },

    renderRecentRecords() {
        const container = document.getElementById('recentRecords');
        const recentRecords = this.records.slice(0, 10);

        if (recentRecords.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text" class="empty-icon"></i>
                    <p>Nenhum registro ainda. Comece a escrever!</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = recentRecords.map(record => {
            const book = this.books.find(b => b.id === record.bookId);
            return `
                <div class="record-item" data-id="${record.id}">
                    <div class="record-info">
                        <div class="record-color" style="background: ${book?.color || '#84b6f4'}"></div>
                        <div class="record-details">
                            <h4>${book?.title || 'Livro removido'}</h4>
                            <p>${Storage.formatDate(record.date)}${record.notes ? ' • ' + record.notes : ''}</p>
                        </div>
                    </div>
                    <div class="record-words">${Storage.formatWords(record.words)}</div>
                    <div class="record-actions">
                        <button class="btn-icon" onclick="App.editRecord('${record.id}')" title="Editar"><i data-lucide="pencil"></i></button>
                        <button class="btn-icon" onclick="App.deleteRecord('${record.id}')" title="Excluir"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
        }).join('');
        lucide.createIcons();
    },

    // ========================================
    // CHARTS
    // ========================================

    setupChartFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.chartRange = btn.dataset.range === 'all' ? 'all' : parseInt(btn.dataset.range);
                this.updateChart();
            });
        });
    },

    initCharts() {
        const ctx = document.getElementById('wordsChart').getContext('2d');
        
        this.wordsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Palavras',
                    data: [],
                    borderColor: '#84b6f4',
                    backgroundColor: 'rgba(132, 182, 244, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#84b6f4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1a2e',
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `${Storage.formatWords(context.raw)} palavras`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: { color: '#64748b', font: { size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                        ticks: { color: '#64748b', font: { size: 11 }, callback: (v) => Storage.formatWords(v) }
                    }
                }
            }
        });

        this.updateChart();
    },

    updateChart() {
        if (!this.wordsChart) return;

        let filteredRecords = [...this.records];
        
        if (this.chartRange !== 'all') {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - this.chartRange);
            filteredRecords = filteredRecords.filter(r => new Date(r.date) >= startDate);
        }

        const dataByDate = {};
        filteredRecords.forEach(record => {
            dataByDate[record.date] = (dataByDate[record.date] || 0) + record.words;
        });

        const sortedDates = Object.keys(dataByDate).sort();
        
        if (this.chartRange !== 'all' && sortedDates.length > 0) {
            const allDates = [];
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - this.chartRange + 1);

            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const dateStr = Storage.getDateString(d);
                allDates.push(dateStr);
                if (!dataByDate[dateStr]) dataByDate[dateStr] = 0;
            }
            
            sortedDates.length = 0;
            sortedDates.push(...allDates);
        }

        const labels = sortedDates.map(date => {
            const d = new Date(date + 'T00:00:00');
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        });

        this.wordsChart.data.labels = labels;
        this.wordsChart.data.datasets[0].data = sortedDates.map(date => dataByDate[date]);
        this.wordsChart.update();
    },

    initBookChart() {
        const ctx = document.getElementById('bookChart').getContext('2d');
        
        if (this.bookChart) this.bookChart.destroy();

        this.bookChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Palavras',
                    data: [],
                    borderColor: '#84b6f4',
                    backgroundColor: 'rgba(132, 182, 244, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#84b6f4',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b' } },
                    y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b', callback: (v) => Storage.formatWords(v) } }
                }
            }
        });
    },

    updateBookChart(bookRecords) {
        if (!this.bookChart) this.initBookChart();

        const sortedRecords = [...bookRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sortedRecords.map(r => {
            const d = new Date(r.date + 'T00:00:00');
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        });

        this.bookChart.data.labels = labels;
        this.bookChart.data.datasets[0].data = sortedRecords.map(r => r.words);
        this.bookChart.update();
    },

    // ========================================
    // BOOKS
    // ========================================

    renderBooks() {
        const container = document.getElementById('booksGrid');

        if (this.books.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="library" class="empty-icon"></i>
                    <p>Nenhum livro cadastrado ainda.</p>
                    <button class="btn-primary" onclick="App.openBookModal()">Criar Primeiro Livro</button>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = this.books.map(book => {
            const bookRecords = this.records.filter(r => r.bookId === book.id);
            const totalWords = Storage.calculateTotalWords(bookRecords);

            return `
                <div class="book-card" onclick="App.openBookDetails('${book.id}')">
                    <div class="book-cover" style="background: linear-gradient(135deg, ${book.color} 0%, ${this.darkenColor(book.color)} 100%)">
                        <span class="book-emoji">${book.emoji || '📖'}</span>
                    </div>
                    <div class="book-card-content">
                        <h3>${this.escapeHtml(book.title)}</h3>
                        <p class="book-author">por ${this.escapeHtml(book.author)}</p>
                        <div class="book-card-stats">
                            <div class="stat">
                                <span>${Storage.formatWords(totalWords)}</span>
                                <span>palavras</span>
                            </div>
                            <div class="stat">
                                <span>${bookRecords.length}</span>
                                <span>registros</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    async openBookDetails(bookId) {
        this.currentBookId = bookId;
        this.currentBook = this.books.find(b => b.id === bookId);
        
        if (!this.currentBook) {
            this.showToast('Livro não encontrado', 'error');
            return;
        }

        // Update header
        document.getElementById('bookDetailTitle').textContent = this.currentBook.title;
        document.getElementById('bookDetailAuthor').textContent = `por ${this.currentBook.author}`;

        // Load book details
        await this.loadBookDetails(bookId);

        // Get book records
        const bookRecords = this.records.filter(r => r.bookId === bookId);
        
        // Count written chapters (status = 'written' or 'revised')
        const writtenChapters = this.chapters.filter(c => c.status === 'written' || c.status === 'revised').length;
        
        // Update stats
        document.getElementById('bookTotalWords').textContent = Storage.formatWords(Storage.calculateTotalWords(bookRecords));
        document.getElementById('bookTotalRecords').textContent = bookRecords.length;
        document.getElementById('bookWrittenChapters').textContent = writtenChapters;

        // Render all tabs
        this.renderBookRecords(bookRecords);
        this.renderCharacters();
        this.renderSummary();
        this.renderScenarios();
        this.renderChapters();

        // Update chart
        this.initBookChart();
        this.updateBookChart(bookRecords);

        // Reset to first tab
        document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
        document.querySelectorAll('.tab-content').forEach((c, i) => c.classList.toggle('active', i === 0));

        this.navigateTo('bookDetails');
        lucide.createIcons();
    },

    renderBookRecords(records) {
        const container = document.getElementById('bookRecordsList');

        if (records.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>Nenhum registro para este livro.</p></div>`;
            return;
        }

        container.innerHTML = records.map(record => {
            // Find chapter name if exists
            let chapterInfo = '';
            if (record.chapterId) {
                const chapter = this.chapters.find(c => c.id === record.chapterId);
                if (chapter) {
                    chapterInfo = Storage.getChapterDisplayName(chapter);
                }
            }
            const subtitle = chapterInfo || record.notes || '';
            
            return `
                <div class="record-item" data-id="${record.id}">
                    <div class="record-info">
                        <div class="record-color" style="background: ${this.currentBook?.color || '#84b6f4'}"></div>
                        <div class="record-details">
                            <h4>${Storage.formatDate(record.date)}</h4>
                            <p>${subtitle || 'Sem capítulo'}</p>
                        </div>
                    </div>
                    <div class="record-words">${Storage.formatWords(record.words)}</div>
                    <div class="record-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); App.editRecord('${record.id}')" title="Editar"><i data-lucide="pencil"></i></button>
                        <button class="btn-icon" onclick="event.stopPropagation(); App.deleteRecord('${record.id}')" title="Excluir"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
        }).join('');
        lucide.createIcons();
    },

    // ========================================
    // CHARACTERS
    // ========================================

    renderCharacters() {
        const container = document.getElementById('charactersGrid');

        if (this.characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="users" class="empty-icon"></i>
                    <p>Nenhum personagem cadastrado.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = this.characters.map(char => `
            <div class="character-card" data-id="${char.id}">
                <div class="character-header">
                    <div class="character-avatar">
                        ${char.emoji || '👤'}
                    </div>
                    <div class="character-info">
                        <h4>${this.escapeHtml(char.name)}</h4>
                        ${char.avatarName ? `<span class="avatar-name">${this.escapeHtml(char.avatarName)}</span>` : ''}
                        ${char.age || char.gender ? `<span>${[char.age, char.gender].filter(Boolean).join(' • ')}</span>` : ''}
                        ${char.profession ? `<span class="profession">${this.escapeHtml(char.profession)}</span>` : ''}
                    </div>
                    <div class="character-actions">
                        <button class="btn-icon" onclick="App.editCharacter('${char.id}')" title="Editar">
                            <i data-lucide="pencil"></i>
                        </button>
                        <button class="btn-icon" onclick="App.deleteCharacter('${char.id}')" title="Excluir">
                            <i data-lucide="trash-2"></i>
                        </button>
                        <button class="btn-icon btn-expand" onclick="App.toggleCharacterExpand('${char.id}')" title="Expandir">
                            <i data-lucide="chevron-down"></i>
                        </button>
                    </div>
                </div>
                <div class="character-traits collapsed">
                    ${char.appearance ? `<div class="trait"><strong>Aparência</strong><p>${this.escapeHtml(char.appearance)}</p></div>` : ''}
                    ${char.personality ? `<div class="trait"><strong>Personalidade</strong><p>${this.escapeHtml(char.personality)}</p></div>` : ''}
                    ${char.qualities ? `<div class="trait"><strong>Qualidades</strong><p>${this.escapeHtml(char.qualities)}</p></div>` : ''}
                    ${char.flaws ? `<div class="trait"><strong>Defeitos</strong><p>${this.escapeHtml(char.flaws)}</p></div>` : ''}
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    },

    // ========================================
    // SUMMARY
    // ========================================

    renderSummary() {
        const container = document.getElementById('summaryContent');
        const btnEdit = document.getElementById('btnEditSummary');

        if (!this.currentBook?.summary) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="file-text" class="empty-icon"></i>
                    <p>Nenhum resumo adicionado.</p>
                    <button class="btn-primary" onclick="App.openSummaryModal()">Adicionar Resumo</button>
                </div>
            `;
            btnEdit.style.display = 'none';
            lucide.createIcons();
            return;
        }

        btnEdit.style.display = 'inline-flex';
        container.innerHTML = `<div class="summary-text">${this.escapeHtml(this.currentBook.summary)}</div>`;
    },

    // ========================================
    // SCENARIOS
    // ========================================

    renderScenarios() {
        const container = document.getElementById('scenariosList');

        if (this.scenarios.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="map-pin" class="empty-icon"></i>
                    <p>Nenhum cenário cadastrado.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = this.scenarios.map(scenario => `
            <div class="scenario-card">
                <div class="scenario-header">
                    <h4><i data-lucide="map-pin"></i> ${this.escapeHtml(scenario.name)}</h4>
                    <div class="character-actions">
                        <button class="btn-icon" onclick="App.editScenario('${scenario.id}')" title="Editar">
                            <i data-lucide="pencil"></i>
                        </button>
                        <button class="btn-icon" onclick="App.deleteScenario('${scenario.id}')" title="Excluir">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                ${scenario.description ? `<p class="scenario-description">${this.escapeHtml(scenario.description)}</p>` : ''}
            </div>
        `).join('');
        lucide.createIcons();
    },

    // ========================================
    // CHAPTERS
    // ========================================

    renderChapters() {
        const tbody = document.getElementById('chaptersBody');
        const emptyState = document.getElementById('chaptersEmpty');
        const table = document.querySelector('.chapters-table');

        if (this.chapters.length === 0) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';

        // Calculate words per chapter from records
        const bookRecords = this.records.filter(r => r.bookId === this.currentBookId);

        tbody.innerHTML = this.chapters.map(chapter => {
            // Sum words for this chapter
            const chapterRecords = bookRecords.filter(r => r.chapterId === chapter.id);
            const chapterWords = chapterRecords.reduce((sum, r) => sum + (r.words || 0), 0);
            
            // Display name based on type
            const displayNumber = Storage.getChapterDisplayNumber(chapter);
            
            return `
                <tr>
                    <td class="chapter-number">${displayNumber}</td>
                    <td class="chapter-title">${chapter.title ? this.escapeHtml(chapter.title) : '-'}</td>
                    <td class="chapter-words">${chapterWords > 0 ? Storage.formatWords(chapterWords) : '-'}</td>
                    <td class="chapter-status">
                        <span class="status-badge status-${chapter.status}">
                            ${Storage.getStatusIcon(chapter.status)} ${Storage.getStatusLabel(chapter.status)}
                        </span>
                    </td>
                    <td class="chapter-actions">
                        <button class="btn-icon" onclick="App.editChapter('${chapter.id}')" title="Editar">
                            <i data-lucide="pencil"></i>
                        </button>
                        <button class="btn-icon" onclick="App.deleteChapter('${chapter.id}')" title="Excluir">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        lucide.createIcons();
    },

    // ========================================
    // MODALS
    // ========================================

    setupModals() {
        // Book
        document.getElementById('btnNewBook').addEventListener('click', () => this.openBookModal());
        document.getElementById('btnNewBookEmpty')?.addEventListener('click', () => this.openBookModal());
        document.getElementById('btnEditBook').addEventListener('click', () => this.openBookModal(this.currentBookId));

        // Record
        document.getElementById('btnNewRecord').addEventListener('click', () => this.openRecordModal());
        document.getElementById('btnNewRecordMobile').addEventListener('click', () => this.openRecordModal());
        document.getElementById('btnNewRecordBook').addEventListener('click', () => this.openRecordModal(this.currentBookId));

        // Character
        document.getElementById('btnAddCharacter').addEventListener('click', () => this.openCharacterModal());

        // Summary
        document.getElementById('btnEditSummary').addEventListener('click', () => this.openSummaryModal());

        // Scenario
        document.getElementById('btnAddScenario').addEventListener('click', () => this.openScenarioModal());

        // Chapter
        document.getElementById('btnAddChapter').addEventListener('click', () => this.openChapterModal());

        // Delete
        document.getElementById('btnDeleteBook').addEventListener('click', () => this.confirmDeleteBook());
        document.getElementById('btnConfirmDelete').addEventListener('click', () => this.executeDelete());

        // Color picker
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const parent = btn.closest('form');
                parent.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                parent.querySelector('input[id$="Color"]').value = btn.dataset.color;
            });
        });

        // Close modals
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', () => this.closeAllModals());
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    },

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    },

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    },

    openBookModal(bookId = null) {
        const form = document.getElementById('formBook');
        const title = document.getElementById('modalBookTitle');

        form.reset();
        document.getElementById('bookId').value = '';

        if (bookId) {
            const book = this.books.find(b => b.id === bookId);
            if (book) {
                title.textContent = 'Editar Livro';
                document.getElementById('bookId').value = book.id;
                document.getElementById('bookTitle').value = book.title;
                document.getElementById('bookAuthor').value = book.author;
                document.getElementById('bookColor').value = book.color;
                document.getElementById('bookEmoji').value = book.emoji || '📖';

                document.querySelectorAll('#formBook .color-option').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.color === book.color);
                });
            }
        } else {
            title.textContent = 'Novo Livro';
            document.querySelectorAll('#formBook .color-option').forEach((btn, i) => btn.classList.toggle('active', i === 0));
            document.getElementById('bookColor').value = '#84b6f4';
            document.getElementById('bookEmoji').value = '📖';
        }

        this.openModal('modalNewBook');
        lucide.createIcons();
    },

    openRecordModal(bookId = null, recordId = null) {
        const form = document.getElementById('formRecord');
        form.reset();
        document.getElementById('recordId').value = '';
        document.getElementById('recordDate').value = Storage.getDateString();

        this.updateBookSelect();

        // Add event listener for book change to update chapters
        document.getElementById('recordBook').onchange = (e) => {
            this.updateChapterSelect(e.target.value);
        };

        if (recordId) {
            // Edit mode
            const record = this.records.find(r => r.id === recordId);
            if (record) {
                document.getElementById('recordId').value = record.id;
                document.getElementById('recordBook').value = record.bookId;
                document.getElementById('recordDate').value = record.date;
                document.getElementById('recordWords').value = record.words;
                document.getElementById('recordNotes').value = record.notes || '';
                
                // Load chapters and set the selected one
                this.updateChapterSelect(record.bookId).then(() => {
                    if (record.chapterId) {
                        document.getElementById('recordChapter').value = record.chapterId;
                    }
                });
            }
        } else if (bookId) {
            document.getElementById('recordBook').value = bookId;
            this.updateChapterSelect(bookId);
        }
        
        this.openModal('modalNewRecord');
    },

    editRecord(recordId) {
        const record = this.records.find(r => r.id === recordId);
        if (record) {
            this.openRecordModal(record.bookId, recordId);
        }
    },

    async updateChapterSelect(bookId) {
        const select = document.getElementById('recordChapter');
        select.innerHTML = '<option value="">Nenhum capítulo específico</option>';
        
        if (!bookId) return;
        
        try {
            const chapters = await Storage.getChaptersByBook(bookId);
            // Sort chapters: prologue, chapters, epilogue, extras
            chapters.sort((a, b) => {
                const order = { prologue: 0, chapter: 1, epilogue: 2, extra: 3 };
                const typeA = order[a.type || 'chapter'];
                const typeB = order[b.type || 'chapter'];
                if (typeA !== typeB) return typeA - typeB;
                return (a.number || 0) - (b.number || 0);
            });
            
            chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter.id;
                option.textContent = Storage.getChapterDisplayName(chapter);
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar capítulos:', error);
        }
    },

    openCharacterModal(characterId = null) {
        const form = document.getElementById('formCharacter');
        const title = document.getElementById('modalCharacterTitle');

        form.reset();
        document.getElementById('characterId').value = '';
        document.getElementById('characterEmoji').value = '👤';

        if (characterId) {
            const char = this.characters.find(c => c.id === characterId);
            if (char) {
                title.textContent = 'Editar Personagem';
                document.getElementById('characterId').value = char.id;
                document.getElementById('characterName').value = char.name;
                document.getElementById('characterAge').value = char.age || '';
                document.getElementById('characterGender').value = char.gender || '';
                document.getElementById('characterProfession').value = char.profession || '';
                document.getElementById('characterAvatarName').value = char.avatarName || '';
                document.getElementById('characterEmoji').value = char.emoji || '👤';
                document.getElementById('characterAppearance').value = char.appearance || '';
                document.getElementById('characterPersonality').value = char.personality || '';
                document.getElementById('characterQualities').value = char.qualities || '';
                document.getElementById('characterFlaws').value = char.flaws || '';
            }
        } else {
            title.textContent = 'Novo Personagem';
        }

        this.openModal('modalCharacter');
        lucide.createIcons();
    },

    openSummaryModal() {
        document.getElementById('summaryText').value = this.currentBook?.summary || '';
        this.openModal('modalSummary');
    },

    openScenarioModal(scenarioId = null) {
        const form = document.getElementById('formScenario');
        const title = document.getElementById('modalScenarioTitle');

        form.reset();
        document.getElementById('scenarioId').value = '';

        if (scenarioId) {
            const scenario = this.scenarios.find(s => s.id === scenarioId);
            if (scenario) {
                title.textContent = 'Editar Cenário';
                document.getElementById('scenarioId').value = scenario.id;
                document.getElementById('scenarioName').value = scenario.name;
                document.getElementById('scenarioDescription').value = scenario.description || '';
            }
        } else {
            title.textContent = 'Novo Cenário';
        }

        this.openModal('modalScenario');
    },

    openChapterModal(chapterId = null) {
        const form = document.getElementById('formChapter');
        const title = document.getElementById('modalChapterTitle');
        const numberRow = document.getElementById('chapterNumberRow');
        const typeSelect = document.getElementById('chapterType');

        form.reset();
        document.getElementById('chapterId').value = '';
        
        // Setup type change handler
        typeSelect.onchange = () => {
            const isChapter = typeSelect.value === 'chapter';
            numberRow.querySelector('div:first-child').style.display = isChapter ? 'block' : 'none';
        };

        if (chapterId) {
            const chapter = this.chapters.find(c => c.id === chapterId);
            if (chapter) {
                title.textContent = 'Editar Capítulo';
                document.getElementById('chapterId').value = chapter.id;
                document.getElementById('chapterType').value = chapter.type || 'chapter';
                document.getElementById('chapterNumber').value = chapter.number || '';
                document.getElementById('chapterTitle').value = chapter.title || '';
                document.getElementById('chapterStatus').value = chapter.status;
                
                // Show/hide number based on type
                const isChapter = (chapter.type || 'chapter') === 'chapter';
                numberRow.querySelector('div:first-child').style.display = isChapter ? 'block' : 'none';
            }
        } else {
            title.textContent = 'Novo Capítulo';
            document.getElementById('chapterType').value = 'chapter';
            // Count existing chapters of type 'chapter' to suggest next number
            const chapterCount = this.chapters.filter(c => !c.type || c.type === 'chapter').length;
            document.getElementById('chapterNumber').value = chapterCount + 1;
            document.getElementById('chapterStatus').value = 'not_written';
            numberRow.querySelector('div:first-child').style.display = 'block';
        }

        this.openModal('modalChapter');
        lucide.createIcons();
    },

    editCharacter(id) { this.openCharacterModal(id); },
    
    toggleCharacterExpand(id) {
        const card = document.querySelector(`.character-card[data-id="${id}"]`);
        if (card) {
            const traits = card.querySelector('.character-traits');
            const expandBtn = card.querySelector('.btn-expand');
            traits.classList.toggle('collapsed');
            
            // Rotate the chevron icon
            if (traits.classList.contains('collapsed')) {
                expandBtn.style.transform = 'rotate(0deg)';
            } else {
                expandBtn.style.transform = 'rotate(180deg)';
            }
        }
    },

    editScenario(id) { this.openScenarioModal(id); },
    editChapter(id) { this.openChapterModal(id); },

    updateBookSelect() {
        const select = document.getElementById('recordBook');
        const currentValue = select.value;

        select.innerHTML = '<option value="">Selecione um livro</option>' +
            this.books.map(book => `<option value="${book.id}">${this.escapeHtml(book.title)}</option>`).join('');

        if (currentValue) select.value = currentValue;
    },

    // ========================================
    // DELETE CONFIRMATIONS
    // ========================================

    confirmDeleteBook() {
        this.currentDeleteTarget = { type: 'book', id: this.currentBookId };
        document.getElementById('confirmMessage').textContent = 
            `Tem certeza que deseja excluir "${this.currentBook?.title}"? Todos os dados serão perdidos.`;
        this.openModal('modalConfirm');
    },

    deleteRecord(recordId) {
        this.currentDeleteTarget = { type: 'record', id: recordId };
        document.getElementById('confirmMessage').textContent = 'Tem certeza que deseja excluir este registro?';
        this.openModal('modalConfirm');
    },

    deleteCharacter(characterId) {
        this.currentDeleteTarget = { type: 'character', id: characterId };
        document.getElementById('confirmMessage').textContent = 'Tem certeza que deseja excluir este personagem?';
        this.openModal('modalConfirm');
    },

    deleteScenario(scenarioId) {
        this.currentDeleteTarget = { type: 'scenario', id: scenarioId };
        document.getElementById('confirmMessage').textContent = 'Tem certeza que deseja excluir este cenário?';
        this.openModal('modalConfirm');
    },

    deleteChapter(chapterId) {
        this.currentDeleteTarget = { type: 'chapter', id: chapterId };
        document.getElementById('confirmMessage').textContent = 'Tem certeza que deseja excluir este capítulo?';
        this.openModal('modalConfirm');
    },

    async executeDelete() {
        if (!this.currentDeleteTarget) return;

        try {
            const { type, id } = this.currentDeleteTarget;

            if (type === 'book') {
                await Storage.deleteBook(id);
                this.showToast('Livro excluído com sucesso!', 'success');
                this.navigateTo('books');
                await this.loadData();
            } else if (type === 'record') {
                await Storage.deleteRecord(id);
                this.showToast('Registro excluído!', 'success');
                await this.loadData();
                if (this.currentBookId) this.openBookDetails(this.currentBookId);
            } else if (type === 'character') {
                await Storage.deleteCharacter(id);
                this.characters = this.characters.filter(c => c.id !== id);
                this.renderCharacters();
                this.showToast('Personagem excluído!', 'success');
            } else if (type === 'scenario') {
                await Storage.deleteScenario(id);
                this.scenarios = this.scenarios.filter(s => s.id !== id);
                this.renderScenarios();
                this.showToast('Cenário excluído!', 'success');
            } else if (type === 'chapter') {
                await Storage.deleteChapter(id);
                this.chapters = this.chapters.filter(c => c.id !== id);
                this.renderChapters();
                this.showToast('Capítulo excluído!', 'success');
            }

        } catch (error) {
            this.showToast('Erro ao excluir. Tente novamente.', 'error');
        }

        this.closeAllModals();
        this.currentDeleteTarget = null;
    },

    // ========================================
    // FORMS
    // ========================================

    setupForms() {
        document.getElementById('formBook').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveBook();
        });

        document.getElementById('formRecord').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveRecord();
        });

        document.getElementById('formCharacter').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCharacter();
        });

        document.getElementById('formSummary').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveSummary();
        });

        document.getElementById('formScenario').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveScenario();
        });

        document.getElementById('formChapter').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveChapter();
        });
    },

    async saveBook() {
        const bookId = document.getElementById('bookId').value;
        const bookData = {
            title: document.getElementById('bookTitle').value.trim(),
            author: document.getElementById('bookAuthor').value.trim(),
            color: document.getElementById('bookColor').value,
            emoji: document.getElementById('bookEmoji').value || '📖'
        };

        try {
            if (bookId) {
                await Storage.updateBook(bookId, bookData);
                this.showToast('Livro atualizado!', 'success');
            } else {
                await Storage.createBook(bookData);
                this.showToast('Livro criado!', 'success');
            }

            this.closeAllModals();
            await this.loadData();
            if (bookId) this.openBookDetails(bookId);
        } catch (error) {
            this.showToast('Erro ao salvar livro.', 'error');
        }
    },

    async saveRecord() {
        const recordId = document.getElementById('recordId').value;
        const recordData = {
            bookId: document.getElementById('recordBook').value,
            date: document.getElementById('recordDate').value,
            words: parseInt(document.getElementById('recordWords').value),
            chapterId: document.getElementById('recordChapter').value || null,
            notes: document.getElementById('recordNotes').value.trim()
        };

        if (!recordData.bookId) {
            this.showToast('Selecione um livro', 'error');
            return;
        }

        try {
            if (recordId) {
                await Storage.updateRecord(recordId, recordData);
                this.showToast('Registro atualizado!', 'success');
            } else {
                await Storage.createRecord(recordData);
                this.showToast('Registro salvo!', 'success');
            }
            this.closeAllModals();
            await this.loadData();
            if (this.currentBookId === recordData.bookId) this.openBookDetails(this.currentBookId);
        } catch (error) {
            this.showToast('Erro ao salvar registro.', 'error');
        }
    },

    async saveCharacter() {
        const characterId = document.getElementById('characterId').value;
        const characterData = {
            bookId: this.currentBookId,
            name: document.getElementById('characterName').value.trim(),
            age: document.getElementById('characterAge').value.trim(),
            gender: document.getElementById('characterGender').value,
            profession: document.getElementById('characterProfession').value.trim(),
            avatarName: document.getElementById('characterAvatarName').value.trim(),
            emoji: document.getElementById('characterEmoji').value || '👤',
            appearance: document.getElementById('characterAppearance').value.trim(),
            personality: document.getElementById('characterPersonality').value.trim(),
            qualities: document.getElementById('characterQualities').value.trim(),
            flaws: document.getElementById('characterFlaws').value.trim()
        };

        try {
            if (characterId) {
                await Storage.updateCharacter(characterId, characterData);
                const index = this.characters.findIndex(c => c.id === characterId);
                if (index !== -1) this.characters[index] = { id: characterId, ...characterData };
                this.showToast('Personagem atualizado!', 'success');
            } else {
                const newChar = await Storage.createCharacter(characterData);
                this.characters.push(newChar);
                this.showToast('Personagem criado!', 'success');
            }

            this.renderCharacters();
            this.closeAllModals();
        } catch (error) {
            this.showToast('Erro ao salvar personagem.', 'error');
        }
    },

    async saveSummary() {
        const summary = document.getElementById('summaryText').value.trim();

        try {
            await Storage.updateBook(this.currentBookId, { summary });
            this.currentBook.summary = summary;
            
            const bookIndex = this.books.findIndex(b => b.id === this.currentBookId);
            if (bookIndex !== -1) this.books[bookIndex].summary = summary;

            this.renderSummary();
            this.closeAllModals();
            this.showToast('Resumo salvo!', 'success');
        } catch (error) {
            this.showToast('Erro ao salvar resumo.', 'error');
        }
    },

    async saveScenario() {
        const scenarioId = document.getElementById('scenarioId').value;
        const scenarioData = {
            bookId: this.currentBookId,
            name: document.getElementById('scenarioName').value.trim(),
            description: document.getElementById('scenarioDescription').value.trim()
        };

        try {
            if (scenarioId) {
                await Storage.updateScenario(scenarioId, scenarioData);
                const index = this.scenarios.findIndex(s => s.id === scenarioId);
                if (index !== -1) this.scenarios[index] = { id: scenarioId, ...scenarioData };
                this.showToast('Cenário atualizado!', 'success');
            } else {
                const newScenario = await Storage.createScenario(scenarioData);
                this.scenarios.push(newScenario);
                this.showToast('Cenário criado!', 'success');
            }

            this.renderScenarios();
            this.closeAllModals();
        } catch (error) {
            this.showToast('Erro ao salvar cenário.', 'error');
        }
    },

    async saveChapter() {
        const chapterId = document.getElementById('chapterId').value;
        const chapterType = document.getElementById('chapterType').value;
        const chapterData = {
            bookId: this.currentBookId,
            type: chapterType,
            number: chapterType === 'chapter' ? parseInt(document.getElementById('chapterNumber').value) || null : null,
            title: document.getElementById('chapterTitle').value.trim(),
            status: document.getElementById('chapterStatus').value
        };

        try {
            if (chapterId) {
                await Storage.updateChapter(chapterId, chapterData);
                const index = this.chapters.findIndex(c => c.id === chapterId);
                if (index !== -1) this.chapters[index] = { id: chapterId, ...chapterData };
                this.showToast('Capítulo atualizado!', 'success');
            } else {
                const newChapter = await Storage.createChapter(chapterData);
                this.chapters.push(newChapter);
                // Sort: prologue first, then chapters by number, then epilogue, then extras
                this.chapters.sort((a, b) => {
                    const order = { prologue: 0, chapter: 1, epilogue: 2, extra: 3 };
                    const typeA = order[a.type || 'chapter'];
                    const typeB = order[b.type || 'chapter'];
                    if (typeA !== typeB) return typeA - typeB;
                    return (a.number || 0) - (b.number || 0);
                });
                this.showToast('Capítulo criado!', 'success');
            }

            this.renderChapters();
            this.closeAllModals();
            
            // Update written chapters count
            const writtenChapters = this.chapters.filter(c => c.status === 'written' || c.status === 'revised').length;
            document.getElementById('bookWrittenChapters').textContent = writtenChapters;
        } catch (error) {
            this.showToast('Erro ao salvar capítulo.', 'error');
        }
    },

    // ========================================
    // UTILITIES
    // ========================================

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    darkenColor(color) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
