// ========================================
// AUTH - GOOGLE AUTHENTICATION
// ========================================

const Auth = {
    currentUser: null,

    // Initialize auth state listener
    init() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                
                if (user) {
                    console.log('👤 Usuário logado:', user.displayName);
                    Storage.setUserId(user.uid);
                    this.showApp();
                    this.updateUserInfo(user);
                } else {
                    console.log('👤 Usuário não logado');
                    Storage.setUserId(null);
                    this.showLogin();
                }
                
                resolve(user);
            });
        });
    },

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            console.log('✅ Login realizado:', result.user.displayName);
            return result.user;
        } catch (error) {
            console.error('❌ Erro no login:', error);
            
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Login cancelado pelo usuário');
            } else if (error.code === 'auth/popup-blocked') {
                throw new Error('Pop-up bloqueado pelo navegador. Permita pop-ups para este site.');
            } else {
                throw new Error('Erro ao fazer login. Tente novamente.');
            }
        }
    },

    // Sign out
    async signOut() {
        try {
            await auth.signOut();
            console.log('👋 Logout realizado');
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            throw error;
        }
    },

    // Show login screen
    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContainer').style.display = 'none';
    },

    // Show app
    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').style.display = 'flex';
    },

    // Update user info in UI
    updateUserInfo(user) {
        const userNameEl = document.getElementById('userName');
        const userAvatarEl = document.getElementById('userAvatar');
        const userNameMobileEl = document.getElementById('userNameMobile');
        const userAvatarMobileEl = document.getElementById('userAvatarMobile');
        
        if (userNameEl) {
            userNameEl.textContent = user.displayName?.split(' ')[0] || 'Usuário';
        }
        
        if (userAvatarEl && user.photoURL) {
            userAvatarEl.src = user.photoURL;
            userAvatarEl.style.display = 'block';
        }

        if (userNameMobileEl) {
            userNameMobileEl.textContent = user.displayName?.split(' ')[0] || 'Usuário';
        }
        
        if (userAvatarMobileEl && user.photoURL) {
            userAvatarMobileEl.src = user.photoURL;
            userAvatarMobileEl.style.display = 'block';
        }
    },

    // Get current user
    getUser() {
        return this.currentUser;
    },

    // Check if logged in
    isLoggedIn() {
        return !!this.currentUser;
    }
};

console.log('🔐 Auth module carregado!');
