/**
 * app.js - Point d'entrée principal de l'application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialise l'application
    App.init();
});

const App = {
    /**
     * Initialise l'application
     */
    init: function() {
        console.log('Initialisation de l\'application AnkiPro Français...');
        
        // Initialise le stockage local
        if (!Storage.init()) {
            console.error('Erreur d\'initialisation du stockage local');
        }
        
        // Initialise les modules
        this.initModules();
        
        // Initialise la navigation
        this.initNavigation();
        
        // Initialise les écouteurs d'événements globaux
        this.initEventListeners();
        
        // Initialise les modales
        this.initModals();
        
        // Applique le thème
        this.applyTheme();
        
        console.log('Application initialisée avec succès');
    },
    
    /**
     * Initialise les modules de l'application
     */
    initModules: function() {
        // Initialise le module d'import
        if (typeof Import !== 'undefined') {
            Import.init();
        }
        
        // Initialise d'autres modules si nécessaire
    },
    
    /**
     * Initialise la navigation
     */
    initNavigation: function() {
        // Gestion des liens de navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Récupère la cible
                const target = link.getAttribute('data-target');
                
                // Change de page
                this.navigateTo(target);
                
                // Ferme le menu mobile si ouvert
                const nav = document.querySelector('nav');
                const menuToggle = document.querySelector('.menu-toggle');
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        });
        
        // Gestion du menu mobile
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                const nav = document.querySelector('nav');
                if (nav) {
                    nav.classList.toggle('active');
                    menuToggle.classList.toggle('active');
                }
            });
        }
        
        // Gestion des boutons d'action de la page d'accueil
        const actionButtons = document.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                
                switch (action) {
                    case 'go-translate':
                        this.navigateTo('translate');
                        break;
                    case 'go-import':
                        this.navigateTo('import');
                        break;
                    case 'go-learn':
                        this.navigateTo('learn');
                        break;
                    default:
                        break;
                }
            });
        });
    },
    
    /**
     * Navigue vers une page
     * @param {string} pageId - ID de la page
     */
    navigateTo: function(pageId) {
        // Cache toutes les pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Affiche la page demandée
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Met à jour la navigation
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-target') === pageId) {
                    link.classList.add('active');
                }
            });
            
            // Actions spécifiques à certaines pages
            this.handlePageSpecificActions(pageId);
        }
    },
    
    /**
     * Gère les actions spécifiques à certaines pages
     * @param {string} pageId - ID de la page
     */
    handlePageSpecificActions: function(pageId) {
        switch (pageId) {
            case 'translate':
                // Focus sur le champ de saisie
                const wordInput = document.getElementById('word-input');
                if (wordInput) {
                    setTimeout(() => wordInput.focus(), 100);
                }
                break;
            case 'learn':
                // Initialise la session d'apprentissage
                this.initLearnSession();
                break;
            case 'dashboard':
                // Charge les données du tableau de bord
                this.loadDashboardData();
                break;
            default:
                break;
        }
    },
    
    /**
     * Initialise les écouteurs d'événements globaux
     */
    initEventListeners: function() {
        // Écouteur pour le bouton de traduction
        const translateBtn = document.getElementById('translate-btn');
        if (translateBtn) {
            translateBtn.addEventListener('click', this.handleTranslate.bind(this));
        }
        
        // Écouteur pour la touche Entrée dans le champ de saisie
        const wordInput = document.getElementById('word-input');
        if (wordInput) {
            wordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleTranslate();
                }
            });
        }
        
        // Écouteur pour le bouton d'ajout à la liste
        const addToLearnBtn = document.getElementById('add-to-learn');
        if (addToLearnBtn) {
            addToLearnBtn.addEventListener('click', this.handleAddToLearn.bind(this));
        }
        
        // Écouteur pour le bouton de prononciation
        const pronounceBtn = document.getElementById('pronounce-btn');
        if (pronounceBtn) {
            pronounceBtn.addEventListener('click', this.handlePronounce.bind(this));
        }
        
        // Écouteurs pour les flashcards
        const flashcard = document.querySelector('.flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', this.handleFlipCard.bind(this));
        }
        
        // Écouteurs pour les boutons de difficulté
        const difficultyButtons = document.querySelectorAll('.difficulty');
        difficultyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.id.replace('-btn', '');
                this.handleRateCard(difficulty);
            });
        });
        
        // Écouteur pour le bouton d'ajout de plus de mots
        const addMoreWordsBtn = document.getElementById('add-more-words-btn');
        if (addMoreWordsBtn) {
            addMoreWordsBtn.addEventListener('click', () => {
                this.navigateTo('translate');
            });
        }
        
        // Écouteurs pour le tableau de bord
        const searchWords = document.getElementById('search-words');
        if (searchWords) {
            searchWords.addEventListener('input', this.handleSearchWords.bind(this));
        }
        
        const filterStatus = document.getElementById('filter-status');
        if (filterStatus) {
            filterStatus.addEventListener('change', this.handleFilterWords.bind(this));
        }
        
        // Écouteurs pour les actions du tableau de bord
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', this.handleExportData.bind(this));
        }
        
        const importDataBtn = document.getElementById('import-data-btn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', this.handleImportData.bind(this));
        }
        
        const resetDataBtn = document.getElementById('reset-data-btn');
        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', this.handleResetData.bind(this));
        }
        
        // Écouteurs pour les liens du footer
        const settingsLink = document.getElementById('settings-link');
        if (settingsLink) {
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('settings-modal');
            });
        }
        
        const aboutLink = document.getElementById('about-link');
        if (aboutLink) {
            aboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal('about-modal');
            });
        }
    },
    
    /**
     * Initialise les modales
     */
    initModals: function() {
        // Écouteurs pour les boutons de fermeture
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Fermeture en cliquant en dehors de la modale
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Écouteur pour le bouton de sauvegarde des paramètres
        const saveSettingsBtn = document.getElementById('save-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', this.handleSaveSettings.bind(this));
        }
    },
    
    /**
     * Ouvre une modale
     * @param {string} modalId - ID de la modale
     */
    openModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    /**
     * Ferme une modale
     * @param {string} modalId - ID de la modale
     */
    closeModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    /**
     * Applique le thème
     */
    applyTheme: function() {
        const settings = Storage.getSettings();
        const theme = settings ? settings.theme : 'light';
        
        // Supprime les classes de thème existantes
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        // Ajoute la classe correspondante
        document.body.classList.add(`theme-${theme}`);
    },
    
    /**
     * Gère la traduction d'un mot
     */
    handleTranslate: async function() {
        const wordInput = document.getElementById('word-input');
        if (!wordInput || !wordInput.value.trim()) {
            Utils.showNotification('Veuillez entrer un mot à traduire.', 'error');
            return;
        }
        
        const word = wordInput.value.trim();
        
        // Affiche un indicateur de chargement
        const translateBtn = document.getElementById('translate-btn');
        if (translateBtn) {
            translateBtn.disabled = true;
            translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traduction...';
        }
        
        try {
            // Traduit le mot
            const translation = await Translation.translate(word);
            
            // Vérifie la direction de la traduction
            const result = Translation.ensureEnglishToFrench(word, translation);
            
            // Affiche le résultat
            this.displayTranslationResult(result.original, result.translation);
            
            // Ajoute à l'historique des traductions récentes
            Storage.addRecentTranslation(result);
            
            // Met à jour la liste des traductions récentes
            this.updateRecentTranslations();
        } catch (error) {
            console.error('Erreur lors de la traduction:', error);
            Utils.showNotification('Erreur lors de la traduction.', 'error');
        } finally {
            // Réinitialise le bouton
            if (translateBtn) {
                translateBtn.disabled = false;
                translateBtn.innerHTML = 'Traduire';
            }
        }
    },
    
    /**
     * Affiche le résultat de la traduction
     * @param {string} original - Mot original
     * @param {string} translation - Traduction
     */
    displayTranslationResult: function(original, translation) {
        const originalWord = document.getElementById('original-word');
        const translatedWord = document.getElementById('translated-word');
        const resultCard = document.querySelector('.result-card');
        
        if (originalWord && translatedWord && resultCard) {
            originalWord.textContent = original;
            translatedWord.textContent = translation;
            resultCard.classList.remove('hidden');
        }
    },
    
    /**
     * Met à jour la liste des traductions récentes
     */
    updateRecentTranslations: function() {
        const recentList = document.getElementById('recent-translations-list');
        if (!recentList) return;
        
        // Récupère les traductions récentes
        const recentTranslations = Storage.getRecentTranslations();
        
        // Vide la liste
        recentList.innerHTML = '';
        
        // Ajoute chaque traduction à la liste
        recentTranslations.forEach(item => {
            const recentItem = document.createElement('div');
            recentItem.className = 'recent-item';
            
            const recentItemText = document.createElement('div');
            recentItemText.className = 'recent-item-text';
            
            const recentItemOriginal = document.createElement('div');
            recentItemOriginal.className = 'recent-item-original';
            recentItemOriginal.textContent = item.original;
            recentItemText.appendChild(recentItemOriginal);
            
            const recentItemTranslation = document.createElement('div');
            recentItemTranslation.className = 'recent-item-translation';
            recentItemTranslation.textContent = ` - ${item.translation}`;
            recentItemText.appendChild(recentItemTranslation);
            
            recentItem.appendChild(recentItemText);
            
            const recentItemActions = document.createElement('div');
            recentItemActions.className = 'recent-item-actions';
            
            const useButton = document.createElement('button');
            useButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
            useButton.title = 'Utiliser';
            useButton.addEventListener('click', () => {
                const wordInput = document.getElementById('word-input');
                if (wordInput) {
                    wordInput.value = item.original;
                    this.handleTranslate();
                }
            });
            recentItemActions.appendChild(useButton);
            
            const addButton = document.createElement('button');
            addButton.innerHTML = '<i class="fas fa-plus"></i>';
            addButton.title = 'Ajouter à ma liste';
            addButton.addEventListener('click', () => {
                Storage.addWord({
                    original: item.original,
                    translation: item.translation
                });
            });
            recentItemActions.appendChild(addButton);
            
            recentItem.appendChild(recentItemActions);
            
            recentList.appendChild(recentItem);
        });
        
        // Affiche un message si la liste est vide
        if (recentTranslations.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'Aucune traduction récente';
            recentList.appendChild(emptyMessage);
        }
    },
    
    /**
     * Gère l'ajout d'un mot à la liste d'apprentissage
     */
    handleAddToLearn: function() {
        const originalWord = document.getElementById('original-word');
        const translatedWord = document.getElementById('translated-word');
        
        if (!originalWord || !translatedWord || !originalWord.textContent || !translatedWord.textContent) {
            Utils.showNotification('Aucun mot à ajouter.', 'error');
            return;
        }
        
        // Ajoute le mot
        Storage.addWord({
            original: originalWord.textContent,
            translation: translatedWord.textContent
        });
    },
    
    /**
     * Gère la prononciation d'un mot
     */
    handlePronounce: function() {
        const originalWord = document.getElementById('original-word');
        
        if (!originalWord || !originalWord.textContent) {
            return;
        }
        
        // Prononce le mot
        Utils.speakText(originalWord.textContent, 'en-US');
    },
    
    /**
     * Initialise la session d'apprentissage
     */
    initLearnSession: function() {
        // Initialise la session
        const hasCards = Flashcards.initSession();
        
        // Affiche la première carte ou le message de fin
        if (hasCards) {
            this.displayCurrentCard();
            document.querySelector('.flashcard-container').classList.remove('hidden');
            document.querySelector('.no-cards-message').classList.add('hidden');
        } else {
            document.querySelector('.flashcard-container').classList.add('hidden');
            document.querySelector('.no-cards-message').classList.remove('hidden');
        }
    },
    
    /**
     * Affiche la carte actuelle
     */
    displayCurrentCard: function() {
        const card = Flashcards.getCurrentCard();
        
        if (!card) {
            // Plus de cartes, affiche le message de fin
            document.querySelector('.flashcard-container').classList.add('hidden');
            document.querySelector('.no-cards-message').classList.remove('hidden');
            return;
        }
        
        // Met à jour le contenu de la carte
        const questionElement = document.getElementById('flashcard-question');
        const answerElement = document.getElementById('flashcard-answer');
        
        if (questionElement && answerElement) {
            questionElement.textContent = card.original;
            answerElement.textContent = card.translation;
        }
        
        // Réinitialise l'état de la carte
        const flashcard = document.querySelector('.flashcard');
        if (flashcard) {
            flashcard.classList.remove('flipped');
        }
    },
    
    /**
     * Gère le retournement de la carte
     */
    handleFlipCard: function() {
        const flashcard = document.querySelector('.flashcard');
        if (flashcard) {
            flashcard.classList.toggle('flipped');
            Flashcards.flipCard();
        }
    },
    
    /**
     * Gère l'évaluation d'une carte
     * @param {string} rating - Évaluation ('difficult', 'good', 'easy')
     */
    handleRateCard: function(rating) {
        // Vérifie si la carte a été retournée
        if (!Flashcards.isCardFlipped()) {
            Utils.showNotification('Veuillez retourner la carte avant de l\'évaluer.', 'error');
            return;
        }
        
        // Évalue la carte
        const nextCard = Flashcards.rateCard(rating);
        
        // Affiche la carte suivante ou le message de fin
        if (nextCard) {
            this.displayCurrentCard();
        } else {
            document.querySelector('.flashcard-container').classList.add('hidden');
            document.querySelector('.no-cards-message').classList.remove('hidden');
        }
    },
    
    /**
     * Charge les données du tableau de bord
     */
    loadDashboardData: function() {
        const wordsTableBody = document.getElementById('words-table-body');
        if (!wordsTableBody) return;
        
        // Récupère tous les mots
        const allWords = Storage.getWords();
        
        // Vide le tableau
        wordsTableBody.innerHTML = '';
        
        // Ajoute chaque mot au tableau
        allWords.forEach(word => {
            const row = document.createElement('tr');
            
            // Cellule pour le mot original
            const originalCell = document.createElement('td');
            originalCell.textContent = word.original;
            row.appendChild(originalCell);
            
            // Cellule pour la traduction
            const translationCell = document.createElement('td');
            translationCell.textContent = word.translation;
            row.appendChild(translationCell);
            
            // Cellule pour le statut
            const statusCell = document.createElement('td');
            let statusText = '';
            switch (word.status) {
                case Storage.STATUS.NEW:
                    statusText = 'Nouveau';
                    break;
                case Storage.STATUS.LEARNING:
                    statusText = 'En apprentissage';
                    break;
                case Storage.STATUS.REVIEW:
                    statusText = 'À réviser';
                    break;
                case Storage.STATUS.MASTERED:
                    statusText = 'Maîtrisé';
                    break;
                default:
                    statusText = 'Inconnu';
            }
            statusCell.textContent = statusText;
            row.appendChild(statusCell);
            
            // Cellule pour la prochaine révision
            const nextReviewCell = document.createElement('td');
            if (word.nextReview) {
                const nextReview = new Date(word.nextReview);
                if (Utils.isToday(nextReview)) {
                    nextReviewCell.textContent = 'Aujourd\'hui';
                } else {
                    nextReviewCell.textContent = Utils.formatDate(nextReview);
                }
            } else {
                nextReviewCell.textContent = 'Non programmé';
            }
            row.appendChild(nextReviewCell);
            
            // Cellule pour les actions
            const actionsCell = document.createElement('td');
            actionsCell.className = 'table-actions';
            
            // Bouton d'édition
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.title = 'Modifier';
            editButton.addEventListener('click', () => this.editWord(word.id));
            actionsCell.appendChild(editButton);
            
            // Bouton de suppression
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.title = 'Supprimer';
            deleteButton.addEventListener('click', () => this.deleteWord(word.id));
            actionsCell.appendChild(deleteButton);
            
            row.appendChild(actionsCell);
            
            wordsTableBody.appendChild(row);
        });
        
        // Affiche un message si la liste est vide
        if (allWords.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 5;
            emptyCell.textContent = 'Aucun mot dans votre liste';
            emptyCell.style.textAlign = 'center';
            emptyRow.appendChild(emptyCell);
            wordsTableBody.appendChild(emptyRow);
        }
    },
    
    /**
     * Édite un mot
     * @param {string} wordId - ID du mot à éditer
     */
    editWord: function(wordId) {
        const allWords = Storage.getWords();
        const word = allWords.find(w => w.id === wordId);
        
        if (!word) return;
        
        // Demande la nouvelle traduction
        const newTranslation = prompt('Modifier la traduction:', word.translation);
        
        if (newTranslation !== null && newTranslation.trim() !== '') {
            // Met à jour le mot
            Storage.updateWord(wordId, { translation: newTranslation.trim() });
            
            // Recharge les données du tableau de bord
            this.loadDashboardData();
        }
    },
    
    /**
     * Supprime un mot
     * @param {string} wordId - ID du mot à supprimer
     */
    deleteWord: function(wordId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce mot ?')) {
            // Supprime le mot
            Storage.deleteWord(wordId);
            
            // Recharge les données du tableau de bord
            this.loadDashboardData();
        }
    },
    
    /**
     * Gère la recherche de mots
     */
    handleSearchWords: function() {
        const searchInput = document.getElementById('search-words');
        const filterSelect = document.getElementById('filter-status');
        
        if (!searchInput || !filterSelect) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        
        // Récupère tous les mots
        const allWords = Storage.getWords();
        
        // Filtre les mots
        const filteredWords = allWords.filter(word => {
            // Filtre par terme de recherche
            const matchesSearch = searchTerm === '' || 
                word.original.toLowerCase().includes(searchTerm) || 
                word.translation.toLowerCase().includes(searchTerm);
            
            // Filtre par statut
            const matchesStatus = filterValue === 'all' || word.status === filterValue;
            
            return matchesSearch && matchesStatus;
        });
        
        // Met à jour le tableau
        this.updateDashboardTable(filteredWords);
    },
    
    /**
     * Gère le filtrage des mots
     */
    handleFilterWords: function() {
        // Déclenche la recherche pour appliquer les filtres
        this.handleSearchWords();
    },
    
    /**
     * Met à jour le tableau du tableau de bord
     * @param {Array} words - Liste des mots à afficher
     */
    updateDashboardTable: function(words) {
        const wordsTableBody = document.getElementById('words-table-body');
        if (!wordsTableBody) return;
        
        // Vide le tableau
        wordsTableBody.innerHTML = '';
        
        // Ajoute chaque mot au tableau
        words.forEach(word => {
            const row = document.createElement('tr');
            
            // Cellule pour le mot original
            const originalCell = document.createElement('td');
            originalCell.textContent = word.original;
            row.appendChild(originalCell);
            
            // Cellule pour la traduction
            const translationCell = document.createElement('td');
            translationCell.textContent = word.translation;
            row.appendChild(translationCell);
            
            // Cellule pour le statut
            const statusCell = document.createElement('td');
            let statusText = '';
            switch (word.status) {
                case Storage.STATUS.NEW:
                    statusText = 'Nouveau';
                    break;
                case Storage.STATUS.LEARNING:
                    statusText = 'En apprentissage';
                    break;
                case Storage.STATUS.REVIEW:
                    statusText = 'À réviser';
                    break;
                case Storage.STATUS.MASTERED:
                    statusText = 'Maîtrisé';
                    break;
                default:
                    statusText = 'Inconnu';
            }
            statusCell.textContent = statusText;
            row.appendChild(statusCell);
            
            // Cellule pour la prochaine révision
            const nextReviewCell = document.createElement('td');
            if (word.nextReview) {
                const nextReview = new Date(word.nextReview);
                if (Utils.isToday(nextReview)) {
                    nextReviewCell.textContent = 'Aujourd\'hui';
                } else {
                    nextReviewCell.textContent = Utils.formatDate(nextReview);
                }
            } else {
                nextReviewCell.textContent = 'Non programmé';
            }
            row.appendChild(nextReviewCell);
            
            // Cellule pour les actions
            const actionsCell = document.createElement('td');
            actionsCell.className = 'table-actions';
            
            // Bouton d'édition
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.title = 'Modifier';
            editButton.addEventListener('click', () => this.editWord(word.id));
            actionsCell.appendChild(editButton);
            
            // Bouton de suppression
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.title = 'Supprimer';
            deleteButton.addEventListener('click', () => this.deleteWord(word.id));
            actionsCell.appendChild(deleteButton);
            
            row.appendChild(actionsCell);
            
            wordsTableBody.appendChild(row);
        });
        
        // Affiche un message si la liste est vide
        if (words.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = 5;
            emptyCell.textContent = 'Aucun mot correspondant aux critères';
            emptyCell.style.textAlign = 'center';
            emptyRow.appendChild(emptyCell);
            wordsTableBody.appendChild(emptyRow);
        }
    },
    
    /**
     * Gère l'exportation des données
     */
    handleExportData: function() {
        // Exporte les données
        const data = Storage.exportData();
        
        // Convertit en JSON
        const jsonData = JSON.stringify(data, null, 2);
        
        // Télécharge le fichier
        Utils.downloadFile(jsonData, 'ankipro_francais_export.json', 'application/json');
        
        Utils.showNotification('Données exportées avec succès.', 'success');
    },
    
    /**
     * Gère l'importation des données
     */
    handleImportData: function() {
        // Crée un input de fichier temporaire
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Lit le contenu du fichier
            Utils.readTextFile(file)
                .then(content => {
                    try {
                        const data = JSON.parse(content);
                        Storage.importData(data);
                        
                        // Recharge les données du tableau de bord
                        this.loadDashboardData();
                    } catch (error) {
                        console.error('Erreur lors de l\'importation des données:', error);
                        Utils.showNotification('Erreur lors de l\'importation des données.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la lecture du fichier:', error);
                    Utils.showNotification('Erreur lors de la lecture du fichier.', 'error');
                });
        });
        
        // Déclenche le clic sur l'input
        fileInput.click();
    },
    
    /**
     * Gère la réinitialisation des données
     */
    handleResetData: function() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
            // Réinitialise les données
            Storage.resetAllData();
            
            // Recharge les données du tableau de bord
            this.loadDashboardData();
        }
    },
    
    /**
     * Gère la sauvegarde des paramètres
     */
    handleSaveSettings: function() {
        // Récupère les valeurs des paramètres
        const cardsPerDay = parseInt(document.getElementById('cards-per-day').value) || 20;
        const newCardsPerDay = parseInt(document.getElementById('new-cards-per-day').value) || 10;
        const theme = document.getElementById('theme-select').value;
        
        // Valide les valeurs
        const validatedCardsPerDay = Math.max(5, Math.min(100, cardsPerDay));
        const validatedNewCardsPerDay = Math.max(1, Math.min(50, newCardsPerDay));
        
        // Met à jour les paramètres
        const settings = Storage.getSettings() || {};
        settings.cardsPerDay = validatedCardsPerDay;
        settings.newCardsPerDay = validatedNewCardsPerDay;
        settings.theme = theme;
        
        // Sauvegarde les paramètres
        Storage.saveSettings(settings);
        
        // Applique le thème
        this.applyTheme();
        
        // Ferme la modale
        this.closeModal('settings-modal');
        
        Utils.showNotification('Paramètres enregistrés.', 'success');
    }
};

// Exporte l'objet App pour une utilisation dans d'autres fichiers
window.App = App;
