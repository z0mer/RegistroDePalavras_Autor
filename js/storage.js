// ========================================
// STORAGE - FIRESTORE CRUD OPERATIONS
// ========================================

const Storage = {
    // Current user ID
    userId: null,

    setUserId(userId) {
        this.userId = userId;
    },

    // ========================================
    // BOOKS COLLECTION
    // ========================================

    async getBooks() {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const snapshot = await db.collection('books')
                .where('userId', '==', this.userId)
                .get();
            const books = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return books.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
            throw error;
        }
    },

    async getBook(bookId) {
        try {
            const doc = await db.collection('books').doc(bookId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar livro:', error);
            throw error;
        }
    },

    async createBook(bookData) {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const docRef = await db.collection('books').add({
                ...bookData,
                userId: this.userId,
                summary: '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...bookData };
        } catch (error) {
            console.error('Erro ao criar livro:', error);
            throw error;
        }
    },

    async updateBook(bookId, bookData) {
        try {
            await db.collection('books').doc(bookId).update({
                ...bookData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: bookId, ...bookData };
        } catch (error) {
            console.error('Erro ao atualizar livro:', error);
            throw error;
        }
    },

    async deleteBook(bookId) {
        try {
            const batch = db.batch();
            
            // Delete all records
            const recordsSnapshot = await db.collection('records')
                .where('bookId', '==', bookId).get();
            recordsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            
            // Delete all characters
            const charactersSnapshot = await db.collection('characters')
                .where('bookId', '==', bookId).get();
            charactersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            
            // Delete all scenarios
            const scenariosSnapshot = await db.collection('scenarios')
                .where('bookId', '==', bookId).get();
            scenariosSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            
            // Delete all chapters
            const chaptersSnapshot = await db.collection('chapters')
                .where('bookId', '==', bookId).get();
            chaptersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            
            // Delete all royalties
            const royaltiesSnapshot = await db.collection('royalties')
                .where('bookId', '==', bookId).get();
            royaltiesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            
            // Delete all expenses
            const expensesSnapshot = await db.collection('expenses')
                .where('bookId', '==', bookId).get();
            expensesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            
            // Delete the book
            batch.delete(db.collection('books').doc(bookId));
            
            await batch.commit();
            return true;
        } catch (error) {
            console.error('Erro ao excluir livro:', error);
            throw error;
        }
    },

    // ========================================
    // RECORDS COLLECTION
    // ========================================

    async getRecords() {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const snapshot = await db.collection('records')
                .where('userId', '==', this.userId)
                .get();
            const records = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort by date descending, then by createdAt descending (most recent first)
            return records.sort((a, b) => {
                const dateCompare = new Date(b.date) - new Date(a.date);
                if (dateCompare !== 0) return dateCompare;
                // If same date, sort by createdAt (most recent first)
                const createdAtA = a.createdAt?.toDate?.() || new Date(0);
                const createdAtB = b.createdAt?.toDate?.() || new Date(0);
                return createdAtB - createdAtA;
            });
        } catch (error) {
            console.error('Erro ao buscar registros:', error);
            throw error;
        }
    },

    async getRecordsByBook(bookId) {
        try {
            const snapshot = await db.collection('records')
                .where('bookId', '==', bookId)
                .orderBy('date', 'desc')
                .get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erro ao buscar registros do livro:', error);
            throw error;
        }
    },

    async createRecord(recordData) {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const docRef = await db.collection('records').add({
                ...recordData,
                userId: this.userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...recordData };
        } catch (error) {
            console.error('Erro ao criar registro:', error);
            throw error;
        }
    },

    async deleteRecord(recordId) {
        try {
            await db.collection('records').doc(recordId).delete();
            return true;
        } catch (error) {
            console.error('Erro ao excluir registro:', error);
            throw error;
        }
    },

    async updateRecord(recordId, recordData) {
        try {
            await db.collection('records').doc(recordId).update({
                ...recordData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: recordId, ...recordData };
        } catch (error) {
            console.error('Erro ao atualizar registro:', error);
            throw error;
        }
    },

    // ========================================
    // CHARACTERS COLLECTION
    // ========================================

    async getCharactersByBook(bookId) {
        try {
            const snapshot = await db.collection('characters')
                .where('bookId', '==', bookId)
                .get();
            const characters = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return characters.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateA - dateB;
            });
        } catch (error) {
            console.error('Erro ao buscar personagens:', error);
            throw error;
        }
    },

    async createCharacter(characterData) {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const docRef = await db.collection('characters').add({
                ...characterData,
                userId: this.userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...characterData };
        } catch (error) {
            console.error('Erro ao criar personagem:', error);
            throw error;
        }
    },

    async updateCharacter(characterId, characterData) {
        try {
            await db.collection('characters').doc(characterId).update({
                ...characterData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: characterId, ...characterData };
        } catch (error) {
            console.error('Erro ao atualizar personagem:', error);
            throw error;
        }
    },

    async deleteCharacter(characterId) {
        try {
            await db.collection('characters').doc(characterId).delete();
            return true;
        } catch (error) {
            console.error('Erro ao excluir personagem:', error);
            throw error;
        }
    },

    // ========================================
    // SCENARIOS COLLECTION
    // ========================================

    async getScenariosByBook(bookId) {
        try {
            const snapshot = await db.collection('scenarios')
                .where('bookId', '==', bookId)
                .get();
            const scenarios = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return scenarios.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateA - dateB;
            });
        } catch (error) {
            console.error('Erro ao buscar cenários:', error);
            throw error;
        }
    },

    async createScenario(scenarioData) {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const docRef = await db.collection('scenarios').add({
                ...scenarioData,
                userId: this.userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...scenarioData };
        } catch (error) {
            console.error('Erro ao criar cenário:', error);
            throw error;
        }
    },

    async updateScenario(scenarioId, scenarioData) {
        try {
            await db.collection('scenarios').doc(scenarioId).update({
                ...scenarioData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: scenarioId, ...scenarioData };
        } catch (error) {
            console.error('Erro ao atualizar cenário:', error);
            throw error;
        }
    },

    async deleteScenario(scenarioId) {
        try {
            await db.collection('scenarios').doc(scenarioId).delete();
            return true;
        } catch (error) {
            console.error('Erro ao excluir cenário:', error);
            throw error;
        }
    },

    // ========================================
    // CHAPTERS COLLECTION
    // ========================================

    async getChaptersByBook(bookId) {
        try {
            const snapshot = await db.collection('chapters')
                .where('bookId', '==', bookId)
                .get();
            const chapters = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return chapters.sort((a, b) => {
                // Sort by type first (prologue, chapters, epilogue, extra)
                const typeOrder = { 'prologue': 0, 'chapter': 1, 'epilogue': 2, 'extra': 3 };
                const typeA = typeOrder[a.type || 'chapter'] || 1;
                const typeB = typeOrder[b.type || 'chapter'] || 1;
                if (typeA !== typeB) return typeA - typeB;
                return (a.number || 0) - (b.number || 0);
            });
        } catch (error) {
            console.error('Erro ao buscar capítulos:', error);
            throw error;
        }
    },

    async createChapter(chapterData) {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const docRef = await db.collection('chapters').add({
                ...chapterData,
                userId: this.userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...chapterData };
        } catch (error) {
            console.error('Erro ao criar capítulo:', error);
            throw error;
        }
    },

    async updateChapter(chapterId, chapterData) {
        try {
            await db.collection('chapters').doc(chapterId).update({
                ...chapterData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: chapterId, ...chapterData };
        } catch (error) {
            console.error('Erro ao atualizar capítulo:', error);
            throw error;
        }
    },

    async deleteChapter(chapterId) {
        try {
            await db.collection('chapters').doc(chapterId).delete();
            return true;
        } catch (error) {
            console.error('Erro ao excluir capítulo:', error);
            throw error;
        }
    },

    // ========================================
    // ROYALTIES COLLECTION
    // ========================================

    async getRoyaltiesByBook(bookId) {
        try {
            const snapshot = await db.collection('royalties')
                .where('bookId', '==', bookId)
                .get();
            const royalties = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return royalties.sort((a, b) => {
                // Sort by date descending (most recent first)
                return new Date(b.date) - new Date(a.date);
            });
        } catch (error) {
            console.error('Erro ao buscar royalties:', error);
            throw error;
        }
    },

    async createRoyalty(royaltyData) {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const docRef = await db.collection('royalties').add({
                ...royaltyData,
                userId: this.userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...royaltyData };
        } catch (error) {
            console.error('Erro ao criar royalty:', error);
            throw error;
        }
    },

    async updateRoyalty(royaltyId, royaltyData) {
        try {
            await db.collection('royalties').doc(royaltyId).update({
                ...royaltyData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: royaltyId, ...royaltyData };
        } catch (error) {
            console.error('Erro ao atualizar royalty:', error);
            throw error;
        }
    },

    async deleteRoyalty(royaltyId) {
        try {
            await db.collection('royalties').doc(royaltyId).delete();
            return true;
        } catch (error) {
            console.error('Erro ao excluir royalty:', error);
            throw error;
        }
    },

    // ========================================
    // EXPENSES COLLECTION
    // ========================================

    async getExpensesByBook(bookId) {
        try {
            const snapshot = await db.collection('expenses')
                .where('bookId', '==', bookId)
                .get();
            const expenses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return expenses.sort((a, b) => {
                // Sort by createdAt descending (most recent first)
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Erro ao buscar gastos:', error);
            throw error;
        }
    },

    async createExpense(expenseData) {
        if (!this.userId) throw new Error('Usuário não autenticado');
        try {
            const docRef = await db.collection('expenses').add({
                ...expenseData,
                userId: this.userId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, ...expenseData };
        } catch (error) {
            console.error('Erro ao criar gasto:', error);
            throw error;
        }
    },

    async updateExpense(expenseId, expenseData) {
        try {
            await db.collection('expenses').doc(expenseId).update({
                ...expenseData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: expenseId, ...expenseData };
        } catch (error) {
            console.error('Erro ao atualizar gasto:', error);
            throw error;
        }
    },

    async deleteExpense(expenseId) {
        try {
            await db.collection('expenses').doc(expenseId).delete();
            return true;
        } catch (error) {
            console.error('Erro ao excluir gasto:', error);
            throw error;
        }
    },

    // Expense type colors helper
    getExpenseTypeColor(type) {
        const colors = {
            'Ilustração': '#e91e63',
            'Revisão': '#9c27b0',
            'Diagramação': '#3f51b5',
            'Capa': '#00bcd4',
            'Publicidade': '#ff9800',
            'Divulgação': '#4caf50',
            'Feed': '#607d8b'
        };
        return colors[type] || '#888888';
    },

    // ========================================
    // STATISTICS HELPERS
    // ========================================

    calculateTotalWords(records) {
        return records.reduce((total, record) => total + (record.words || 0), 0);
    },

    calculateAverageWords(records) {
        if (records.length === 0) return 0;
        const total = this.calculateTotalWords(records);
        return Math.round(total / records.length);
    },

    findBestDay(records) {
        if (records.length === 0) return 0;
        return Math.max(...records.map(r => r.words || 0));
    },

    calculateStreak(records) {
        if (records.length === 0) return 0;

        const sortedRecords = [...records].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        const dates = [...new Set(sortedRecords.map(r => r.date))];
        
        if (dates.length === 0) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const mostRecentDate = new Date(dates[0]);
        mostRecentDate.setHours(0, 0, 0, 0);

        if (mostRecentDate < yesterday) {
            return 0;
        }

        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const currentDate = new Date(dates[i - 1]);
            const previousDate = new Date(dates[i]);
            currentDate.setHours(0, 0, 0, 0);
            previousDate.setHours(0, 0, 0, 0);

            const diffDays = Math.round((currentDate - previousDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    },

    formatWords(words) {
        if (words >= 1000) {
            return (words / 1000).toFixed(1).replace('.0', '') + 'k';
        }
        return words.toString();
    },

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    getDateString(date = new Date()) {
        return date.toISOString().split('T')[0];
    },

    // Chapter status helpers
    getStatusLabel(status) {
        const labels = {
            'not_written': 'Não Escrito',
            'writing': 'Escrevendo',
            'written': 'Escrito',
            'revised': 'Revisado',
            'rewrite': 'Reescrever'
        };
        return labels[status] || status;
    },

    getStatusIcon(status) {
        return '';
    },
    
    getChapterTypeLabel(type) {
        const labels = {
            'chapter': 'Capítulo',
            'prologue': 'Prólogo',
            'epilogue': 'Epílogo',
            'extra': 'Cena Extra'
        };
        return labels[type] || 'Capítulo';
    },
    
    getChapterDisplayNumber(chapter) {
        const type = chapter.type || 'chapter';
        if (type === 'prologue') return 'P';
        if (type === 'epilogue') return 'E';
        if (type === 'extra') return '★';
        return chapter.number || '-';
    },
    
    getChapterDisplayName(chapter) {
        const type = chapter.type || 'chapter';
        if (type === 'prologue') return chapter.title ? `Prólogo: ${chapter.title}` : 'Prólogo';
        if (type === 'epilogue') return chapter.title ? `Epílogo: ${chapter.title}` : 'Epílogo';
        if (type === 'extra') return chapter.title ? `Extra: ${chapter.title}` : 'Cena Extra';
        return chapter.title ? `Cap. ${chapter.number}: ${chapter.title}` : `Capítulo ${chapter.number}`;
    }
};

console.log('📦 Storage module carregado!');
