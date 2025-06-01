/**
 * Module de flashcards pour l'apprentissage (version frontend uniquement)
 */
const Flashcards = {
    /**
     * Liste en cours d'apprentissage
     */
    currentList: null,
    
    /**
     * Mots à apprendre dans la session actuelle
     */
    sessionWords: [],
    
    /**
     * Index du mot actuel
     */
    currentWordIndex: 0,
    
    /**
     * État de la carte (recto ou verso)
     */
    cardState: 'front',
    
    /**
     * Initialise le module de flashcards
     */
    init: function() {
        this.bindEvents();
    },
    
    /**
     * Attache les gestionnaires d'événements
     */
    bindEvents: function() {
        document.addEventListener('click', function(e) {
            // Bouton pour retourner la carte
            if (e.target.id === 'flip-card-btn' || e.target.closest('#flip-card-btn')) {
                this.flipCard();
            }
            
            // Bouton pour marquer comme connu
            if (e.target.id === 'mark-known-btn' || e.target.closest('#mark-known-btn')) {
                this.markAsKnown();
            }
            
            // Bouton pour marquer comme à revoir
            if (e.target.id === 'mark-review-btn' || e.target.closest('#mark-review-btn')) {
                this.markAsReview();
            }
            
            // Bouton pour terminer la session
            if (e.target.id === 'finish-session-btn' || e.target.closest('#finish-session-btn')) {
                this.finishSession();
            }
            
            // Bouton pour revenir à la liste
            if (e.target.id === 'back-to-list-from-flashcards-btn' || e.target.closest('#back-to-list-from-flashcards-btn')) {
                this.backToList();
            }
        }.bind(this));
        
        // Événement pour les touches du clavier
        document.addEventListener('keydown', function(e) {
            // Si on est dans une session de flashcards
            if (this.currentList && document.getElementById('flashcards-view') && !document.getElementById('flashcards-view').classList.contains('hidden')) {
                // Espace pour retourner la carte
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.flipCard();
                }
                
                // Flèche droite pour marquer comme connu
                if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    if (this.cardState === 'back') {
                        this.markAsKnown();
                    }
                }
                
                // Flèche gauche pour marquer comme à revoir
                if (e.code === 'ArrowLeft') {
                    e.preventDefault();
                    if (this.cardState === 'back') {
                        this.markAsReview();
                    }
                }
            }
        }.bind(this));
    },
    
    /**
     * Démarre une session d'apprentissage
     * @param {Object} list - Liste à apprendre
     */
    startSession: function(list) {
        // Vérifier que la liste contient des mots
        if (!list.words || list.words.length === 0) {
            Utils.showNotification('La liste ne contient aucun mot', 'error');
            return;
        }
        
        // Stocker la liste
        this.currentList = list;
        
        // Sélectionner les mots pour la session
        this.selectSessionWords();
        
        // Réinitialiser l'index et l'état de la carte
        this.currentWordIndex = 0;
        this.cardState = 'front';
        
        // Créer la vue de flashcards si elle n'existe pas
        let flashcardsView = document.getElementById('flashcards-view');
        
        if (!flashcardsView) {
            flashcardsView = document.createElement('section');
            flashcardsView.id = 'flashcards-view';
            flashcardsView.className = 'view';
            document.querySelector('main').appendChild(flashcardsView);
        }
        
        // Afficher la vue de flashcards
        this.showView('flashcards-view');
        
        // Afficher la première carte
        this.displayCurrentCard();
    },
    
    /**
     * Sélectionne les mots pour la session
     */
    selectSessionWords: function() {
        // Récupérer les paramètres
        const settings = Storage.getSettings();
        const cardsPerDay = settings.cardsPerDay || 20;
        const newCardsPerDay = settings.newCardsPerDay || 10;
        
        // Copier les mots
        const words = [...this.currentList.words];
        
        // Séparer les mots par statut
        const newWords = words.filter(word => word.status === 'new' || !word.status);
        const reviewWords = words.filter(word => word.status === 'review');
        const learningWords = words.filter(word => word.status === 'learning');
        
        // Mélanger les mots
        Utils.shuffleArray(newWords);
        Utils.shuffleArray(reviewWords);
        Utils.shuffleArray(learningWords);
        
        // Sélectionner les mots pour la session
        const selectedNewWords = newWords.slice(0, newCardsPerDay);
        const remainingCards = cardsPerDay - selectedNewWords.length;
        const selectedReviewWords = reviewWords.slice(0, remainingCards);
        const remainingCardsAfterReview = remainingCards - selectedReviewWords.length;
        const selectedLearningWords = learningWords.slice(0, remainingCardsAfterReview);
        
        // Combiner les mots sélectionnés
        this.sessionWords = [
            ...selectedNewWords,
            ...selectedReviewWords,
            ...selectedLearningWords
        ];
        
        // Mélanger les mots de la session
        Utils.shuffleArray(this.sessionWords);
    },
    
    /**
     * Affiche la carte actuelle
     */
    displayCurrentCard: function() {
        // Vérifier s'il reste des mots
        if (this.sessionWords.length === 0) {
            this.displaySessionComplete();
            return;
        }
        
        // Vérifier si on a atteint la fin de la session
        if (this.currentWordIndex >= this.sessionWords.length) {
            this.displaySessionComplete();
            return;
        }
        
        const word = this.sessionWords[this.currentWordIndex];
        const flashcardsView = document.getElementById('flashcards-view');
        
        // Construire le contenu
        const content = `
            <div class="view-header">
                <button id="back-to-list-from-flashcards-btn" class="btn outline">
                    <i class="fas fa-arrow-left"></i> Retour à la liste
                </button>
                <h2>Apprendre - ${Utils.escapeHtml(this.currentList.name)}</h2>
            </div>
            
            <div class="flashcards-container">
                <div class="flashcards-progress">
                    <div class="flashcards-progress-text">
                        Carte ${this.currentWordIndex + 1}/${this.sessionWords.length}
                    </div>
                    <div class="flashcards-progress-bar">
                        <div class="flashcards-progress-fill" style="width: ${(this.currentWordIndex / this.sessionWords.length) * 100}%"></div>
                    </div>
                </div>
                
                <div class="flashcard ${this.cardState === 'back' ? 'flipped' : ''}">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <div class="flashcard-content">
                                <div class="flashcard-word">${Utils.escapeHtml(word.english)}</div>
                                <div class="flashcard-status ${word.status || 'new'}">${this.getStatusLabel(word.status)}</div>
                                <button class="icon-btn flashcard-speak-btn" onclick="Utils.speakText('${Utils.escapeHtml(word.english)}', 'en-US')">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                            </div>
                            <button id="flip-card-btn" class="btn primary flashcard-flip-btn">
                                <i class="fas fa-sync-alt"></i> Retourner
                            </button>
                        </div>
                        <div class="flashcard-back">
                            <div class="flashcard-content">
                                <div class="flashcard-word">${Utils.escapeHtml(word.french)}</div>
                                <button class="icon-btn flashcard-speak-btn" onclick="Utils.speakText('${Utils.escapeHtml(word.french)}', 'fr-FR')">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                            </div>
                            <div class="flashcard-actions">
                                <button id="mark-review-btn" class="btn secondary">
                                    <i class="fas fa-sync-alt"></i> À revoir
                                </button>
                                <button id="mark-known-btn" class="btn primary">
                                    <i class="fas fa-check"></i> Je connais
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flashcards-keyboard-shortcuts">
                    <div class="flashcards-keyboard-shortcut">
                        <div class="flashcards-keyboard-key">Espace</div>
                        <div class="flashcards-keyboard-action">Retourner la carte</div>
                    </div>
                    <div class="flashcards-keyboard-shortcut">
                        <div class="flashcards-keyboard-key">←</div>
                        <div class="flashcards-keyboard-action">À revoir</div>
                    </div>
                    <div class="flashcards-keyboard-shortcut">
                        <div class="flashcards-keyboard-key">→</div>
                        <div class="flashcards-keyboard-action">Je connais</div>
                    </div>
                </div>
            </div>
        `;
        
        // Mettre à jour la vue
        flashcardsView.innerHTML = content;
    },
    
    /**
     * Affiche l'écran de fin de session
     */
    displaySessionComplete: function() {
        const flashcardsView = document.getElementById('flashcards-view');
        
        // Construire le contenu
        const content = `
            <div class="view-header">
                <h2>Session terminée</h2>
            </div>
            
            <div class="flashcards-complete-container">
                <div class="flashcards-complete-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="flashcards-complete-message">
                    <h3>Félicitations !</h3>
                    <p>Vous avez terminé votre session d'apprentissage.</p>
                </div>
                <div class="flashcards-complete-stats">
                    <div class="flashcards-complete-stat">
                        <div class="flashcards-complete-stat-value">${this.sessionWords.length}</div>
                        <div class="flashcards-complete-stat-label">Cartes étudiées</div>
                    </div>
                </div>
                <div class="flashcards-complete-actions">
                    <button id="finish-session-btn" class="btn primary">
                        <i class="fas fa-arrow-left"></i> Retour à la liste
                    </button>
                </div>
            </div>
        `;
        
        // Mettre à jour la vue
        flashcardsView.innerHTML = content;
    },
    
    /**
     * Retourne la carte
     */
    flipCard: function() {
        // Changer l'état de la carte
        this.cardState = this.cardState === 'front' ? 'back' : 'front';
        
        // Mettre à jour l'affichage
        const flashcard = document.querySelector('.flashcard');
        if (flashcard) {
            flashcard.classList.toggle('flipped', this.cardState === 'back');
        }
    },
    
    /**
     * Marque le mot actuel comme connu
     */
    markAsKnown: function() {
        // Vérifier que la carte est retournée
        if (this.cardState !== 'back') {
            return;
        }
        
        // Récupérer le mot actuel
        const word = this.sessionWords[this.currentWordIndex];
        
        // Mettre à jour le statut du mot
        let newStatus = 'learning';
        
        switch (word.status) {
            case 'new':
                newStatus = 'learning';
                break;
            case 'learning':
                newStatus = 'review';
                break;
            case 'review':
                newStatus = 'mastered';
                break;
            case 'mastered':
                newStatus = 'mastered';
                break;
            default:
                newStatus = 'learning';
        }
        
        // Mettre à jour le mot dans la liste
        Storage.updateWord(this.currentList.id, word.id, {
            status: newStatus,
            last_reviewed: new Date().toISOString()
        });
        
        // Mettre à jour le mot dans la session
        word.status = newStatus;
        
        // Passer au mot suivant
        this.nextCard();
    },
    
    /**
     * Marque le mot actuel comme à revoir
     */
    markAsReview: function() {
        // Vérifier que la carte est retournée
        if (this.cardState !== 'back') {
            return;
        }
        
        // Récupérer le mot actuel
        const word = this.sessionWords[this.currentWordIndex];
        
        // Mettre à jour le statut du mot
        let newStatus = 'new';
        
        switch (word.status) {
            case 'mastered':
                newStatus = 'review';
                break;
            case 'review':
                newStatus = 'learning';
                break;
            case 'learning':
            case 'new':
            default:
                newStatus = 'new';
        }
        
        // Mettre à jour le mot dans la liste
        Storage.updateWord(this.currentList.id, word.id, {
            status: newStatus,
            last_reviewed: new Date().toISOString()
        });
        
        // Mettre à jour le mot dans la session
        word.status = newStatus;
        
        // Passer au mot suivant
        this.nextCard();
    },
    
    /**
     * Passe à la carte suivante
     */
    nextCard: function() {
        // Incrémenter l'index
        this.currentWordIndex++;
        
        // Réinitialiser l'état de la carte
        this.cardState = 'front';
        
        // Afficher la carte suivante
        this.displayCurrentCard();
    },
    
    /**
     * Termine la session
     */
    finishSession: function() {
        // Réinitialiser les variables
        this.currentList = null;
        this.sessionWords = [];
        this.currentWordIndex = 0;
        this.cardState = 'front';
        
        // Revenir à la vue de la liste
        Lists.showListsView();
    },
    
    /**
     * Retourne à la liste
     */
    backToList: function() {
        // Demander confirmation si la session n'est pas terminée
        if (this.currentWordIndex < this.sessionWords.length) {
            if (!confirm('Êtes-vous sûr de vouloir quitter la session ? Votre progression sera sauvegardée.')) {
                return;
            }
        }
        
        // Terminer la session
        this.finishSession();
    },
    
    /**
     * Obtient le libellé d'un statut
     * @param {string} status - Statut
     * @returns {string} Libellé
     */
    getStatusLabel: function(status) {
        switch (status) {
            case 'mastered':
                return 'Maîtrisé';
            case 'review':
                return 'À réviser';
            case 'learning':
                return 'En cours';
            case 'new':
            default:
                return 'Nouveau';
        }
    },
    
    /**
     * Affiche une vue
     * @param {string} viewId - ID de la vue
     */
    showView: function(viewId) {
        // Masquer toutes les vues
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            view.classList.add('hidden');
        });
        
        // Afficher la vue demandée
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.remove('hidden');
        }
    }
};

// Exporter le module Flashcards pour une utilisation dans d'autres fichiers
window.Flashcards = Flashcards;
