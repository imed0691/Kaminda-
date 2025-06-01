/**
 * Module d'authentification (version frontend uniquement)
 */
const Auth = {
    /**
     * État de connexion
     */
    loggedIn: false,
    
    /**
     * Informations de l'utilisateur connecté
     */
    currentUser: null,
    
    /**
     * Initialise le module d'authentification
     */
    init: function() {
        this.bindEvents();
        this.checkLoginStatus();
    },
    
    /**
     * Attache les gestionnaires d'événements
     */
    bindEvents: function() {
        // Événements pour l'inscription et la connexion
        document.addEventListener('click', function(e) {
            // Bouton d'inscription
            if (e.target.id === 'register-btn' || e.target.closest('#register-btn')) {
                this.showRegisterModal();
            }
            
            // Bouton de connexion
            if (e.target.id === 'login-btn' || e.target.closest('#login-btn')) {
                this.showLoginModal();
            }
            
            // Bouton de déconnexion
            if (e.target.id === 'logout-btn' || e.target.closest('#logout-btn')) {
                this.logout();
            }
            
            // Bouton de profil
            if (e.target.id === 'profile-btn' || e.target.closest('#profile-btn')) {
                this.showProfileModal();
            }
            
            // Bouton de soumission du formulaire d'inscription
            if (e.target.id === 'submit-register-btn' || e.target.closest('#submit-register-btn')) {
                this.register();
            }
            
            // Bouton de soumission du formulaire de connexion
            if (e.target.id === 'submit-login-btn' || e.target.closest('#submit-login-btn')) {
                this.login();
            }
        }.bind(this));
    },
    
    /**
     * Vérifie si l'utilisateur est connecté
     */
    checkLoginStatus: function() {
        // Vérifier si l'utilisateur est connecté via le stockage local
        const userJson = localStorage.getItem('ankipro_user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                this.loggedIn = true;
                this.currentUser = user;
                this.updateAuthUI();
            } catch (e) {
                console.error('Erreur lors de la lecture des données utilisateur:', e);
                this.loggedIn = false;
                this.currentUser = null;
                this.updateAuthUI();
            }
        } else {
            this.loggedIn = false;
            this.currentUser = null;
            this.updateAuthUI();
        }
    },
    
    /**
     * Met à jour l'interface utilisateur en fonction de l'état de connexion
     */
    updateAuthUI: function() {
        const authContainer = document.getElementById('auth-container');
        
        if (!authContainer) {
            // Créer le conteneur d'authentification s'il n'existe pas
            const header = document.querySelector('header');
            const authDiv = document.createElement('div');
            authDiv.id = 'auth-container';
            authDiv.className = 'auth-container';
            header.appendChild(authDiv);
        }
        
        // Mettre à jour le contenu
        document.getElementById('auth-container').innerHTML = this.loggedIn
            ? `
                <div class="user-info">
                    <span>Bonjour, ${Utils.escapeHtml(this.currentUser.name || this.currentUser.email)}</span>
                    <div class="auth-buttons">
                        <button id="profile-btn" class="btn outline small">
                            <i class="fas fa-user"></i> Profil
                        </button>
                        <button id="logout-btn" class="btn outline small">
                            <i class="fas fa-sign-out-alt"></i> Déconnexion
                        </button>
                    </div>
                </div>
            `
            : `
                <div class="auth-buttons">
                    <button id="login-btn" class="btn outline small">
                        <i class="fas fa-sign-in-alt"></i> Connexion
                    </button>
                    <button id="register-btn" class="btn primary small">
                        <i class="fas fa-user-plus"></i> Inscription
                    </button>
                </div>
            `;
    },
    
    /**
     * Affiche la modal d'inscription
     */
    showRegisterModal: function() {
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('register-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'register-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Inscription</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="register-name">Nom (optionnel)</label>
                            <input type="text" id="register-name" placeholder="Votre nom">
                        </div>
                        <div class="form-group">
                            <label for="register-email">Email</label>
                            <input type="email" id="register-email" placeholder="votre@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="register-password">Mot de passe</label>
                            <input type="password" id="register-password" placeholder="Mot de passe" required>
                        </div>
                        <div class="form-group">
                            <label for="register-password-confirm">Confirmer le mot de passe</label>
                            <input type="password" id="register-password-confirm" placeholder="Confirmer le mot de passe" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-register-btn">Annuler</button>
                        <button class="btn primary" id="submit-register-btn">S'inscrire</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-register-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Réinitialiser le formulaire
        document.getElementById('register-name').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-password-confirm').value = '';
        
        // Afficher la modal
        document.getElementById('register-modal').classList.add('active');
    },
    
    /**
     * Affiche la modal de connexion
     */
    showLoginModal: function() {
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('login-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'login-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Connexion</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" placeholder="votre@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Mot de passe</label>
                            <input type="password" id="login-password" placeholder="Mot de passe" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-login-btn">Annuler</button>
                        <button class="btn primary" id="submit-login-btn">Se connecter</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-login-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Réinitialiser le formulaire
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        
        // Afficher la modal
        document.getElementById('login-modal').classList.add('active');
    },
    
    /**
     * Affiche la modal de profil
     */
    showProfileModal: function() {
        if (!this.loggedIn) {
            return;
        }
        
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('profile-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'profile-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Profil utilisateur</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="profile-info">
                            <div class="profile-field">
                                <label>Nom</label>
                                <p id="profile-name"></p>
                            </div>
                            <div class="profile-field">
                                <label>Email</label>
                                <p id="profile-email"></p>
                            </div>
                            <div class="profile-field">
                                <label>Membre depuis</label>
                                <p id="profile-created"></p>
                            </div>
                            <div class="profile-field">
                                <label>Dernière connexion</label>
                                <p id="profile-last-login"></p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn primary" id="close-profile-btn">Fermer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('close-profile-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Remplir les informations du profil
        document.getElementById('profile-name').textContent = this.currentUser.name || '(Non spécifié)';
        document.getElementById('profile-email').textContent = this.currentUser.email;
        
        // Formater les dates
        const createdDate = new Date(this.currentUser.created_at);
        const lastLoginDate = this.currentUser.last_login ? new Date(this.currentUser.last_login) : null;
        
        document.getElementById('profile-created').textContent = createdDate.toLocaleDateString('fr-FR');
        document.getElementById('profile-last-login').textContent = lastLoginDate 
            ? lastLoginDate.toLocaleDateString('fr-FR') + ' à ' + lastLoginDate.toLocaleTimeString('fr-FR')
            : '(Jamais)';
        
        // Afficher la modal
        document.getElementById('profile-modal').classList.add('active');
    },
    
    /**
     * Inscrit un nouvel utilisateur
     */
    register: function() {
        const nameInput = document.getElementById('register-name');
        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const passwordConfirmInput = document.getElementById('register-password-confirm');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;
        
        // Validation
        if (!email) {
            Utils.showNotification('Veuillez entrer votre email', 'error');
            return;
        }
        
        if (!password) {
            Utils.showNotification('Veuillez entrer un mot de passe', 'error');
            return;
        }
        
        if (password !== passwordConfirm) {
            Utils.showNotification('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        
        // Vérifier si l'email est déjà utilisé
        const users = this.getUsers();
        if (users.some(user => user.email === email)) {
            Utils.showNotification('Cet email est déjà utilisé', 'error');
            return;
        }
        
        // Créer l'utilisateur
        const user = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            password: this.hashPassword(password), // Dans une vraie application, utiliser une fonction de hachage sécurisée
            created_at: new Date().toISOString(),
            last_login: null
        };
        
        // Ajouter l'utilisateur
        this.addUser(user);
        
        Utils.showNotification('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success');
        
        // Fermer la modal d'inscription
        document.getElementById('register-modal').classList.remove('active');
        
        // Ouvrir la modal de connexion
        setTimeout(() => {
            this.showLoginModal();
            
            // Pré-remplir l'email
            document.getElementById('login-email').value = email;
        }, 1000);
    },
    
    /**
     * Connecte un utilisateur
     */
    login: function() {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validation
        if (!email) {
            Utils.showNotification('Veuillez entrer votre email', 'error');
            return;
        }
        
        if (!password) {
            Utils.showNotification('Veuillez entrer votre mot de passe', 'error');
            return;
        }
        
        // Vérifier les identifiants
        const users = this.getUsers();
        const user = users.find(user => user.email === email && user.password === this.hashPassword(password));
        
        if (!user) {
            Utils.showNotification('Email ou mot de passe incorrect', 'error');
            return;
        }
        
        // Mettre à jour la date de dernière connexion
        user.last_login = new Date().toISOString();
        this.updateUser(user);
        
        // Connecter l'utilisateur
        this.loggedIn = true;
        this.currentUser = user;
        localStorage.setItem('ankipro_user', JSON.stringify(user));
        
        Utils.showNotification('Connexion réussie !', 'success');
        
        // Fermer la modal de connexion
        document.getElementById('login-modal').classList.remove('active');
        
        // Mettre à jour l'interface utilisateur
        this.updateAuthUI();
        
        // Recharger les listes
        if (window.Lists) {
            Lists.loadLists();
        }
    },
    
    /**
     * Déconnecte l'utilisateur
     */
    logout: function() {
        // Déconnecter l'utilisateur
        this.loggedIn = false;
        this.currentUser = null;
        localStorage.removeItem('ankipro_user');
        
        Utils.showNotification('Déconnexion réussie', 'success');
        
        // Mettre à jour l'interface utilisateur
        this.updateAuthUI();
        
        // Recharger les listes
        if (window.Lists) {
            Lists.loadLists();
        }
    },
    
    /**
     * Obtient la liste des utilisateurs
     * @returns {Array} Liste des utilisateurs
     */
    getUsers: function() {
        const usersJson = localStorage.getItem('ankipro_users');
        return usersJson ? JSON.parse(usersJson) : [];
    },
    
    /**
     * Ajoute un utilisateur
     * @param {Object} user - Utilisateur à ajouter
     */
    addUser: function(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('ankipro_users', JSON.stringify(users));
    },
    
    /**
     * Met à jour un utilisateur
     * @param {Object} user - Utilisateur à mettre à jour
     */
    updateUser: function(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem('ankipro_users', JSON.stringify(users));
            
            // Mettre à jour l'utilisateur courant si c'est le même
            if (this.loggedIn && this.currentUser && this.currentUser.id === user.id) {
                this.currentUser = user;
                localStorage.setItem('ankipro_user', JSON.stringify(user));
            }
        }
    },
    
    /**
     * Hache un mot de passe (simulation)
     * @param {string} password - Mot de passe à hacher
     * @returns {string} Mot de passe haché
     */
    hashPassword: function(password) {
        // Dans une vraie application, utiliser une fonction de hachage sécurisée
        // Ceci est une simulation très basique et non sécurisée
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir en entier 32 bits
        }
        return hash.toString(16);
    },
    
    /**
     * Vérifie si l'utilisateur est connecté
     * @returns {boolean} Vrai si l'utilisateur est connecté
     */
    isLoggedIn: function() {
        return this.loggedIn;
    },
    
    /**
     * Obtient l'utilisateur actuel
     * @returns {Object|null} Utilisateur actuel ou null si non connecté
     */
    getCurrentUser: function() {
        return this.currentUser;
    }
};

// Exporter le module Auth pour une utilisation dans d'autres fichiers
window.Auth = Auth;
