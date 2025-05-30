/**
 * flashcards.js - Gestion du système de flashcards et de répétition espacée
 */

const Flashcards = {
    /**
     * État actuel de la session d'apprentissage
     */
    currentSession: {
        cards: [],
        currentIndex: 0,
        isFlipped: false,
        todayLearned: 0
    },
    
    /**
     * Initialise une session d'apprentissage
     */
    initSession: function() {
        // Récupère les paramètres
        const settings = Storage.getSettings();
        const cardsPerDay = settings ? settings.cardsPerDay : 20;
        const newCardsPerDay = settings ? settings.newCardsPerDay : 10;
        
        // Récupère tous les mots
        const allWords = Storage.getWords();
        
        // Met à jour la date de dernière étude
        Storage.updateLastStudyDate();
        
        // Filtre les mots à réviser aujourd'hui
        const today = new Date();
        const reviewCards = allWords.filter(word => {
            if (word.status === Storage.STATUS.NEW) {
                return true;
            }
            
            if (!word.nextReview) {
                return true;
            }
            
            const nextReview = new Date(word.nextReview);
            return nextReview <= today;
        });
        
        // Sépare les nouveaux mots et les mots à réviser
        const newCards = reviewCards.filter(word => word.status === Storage.STATUS.NEW);
        const reviewDueCards = reviewCards.filter(word => word.status !== Storage.STATUS.NEW);
        
        // Limite le nombre de nouveaux mots
        const limitedNewCards = Utils.shuffleArray(newCards).slice(0, newCardsPerDay);
        
        // Combine les cartes à réviser et les nouveaux mots
        let sessionCards = [...reviewDueCards];
        
        // Ajoute les nouveaux mots si nécessaire
        if (sessionCards.length < cardsPerDay) {
            sessionCards = [...sessionCards, ...limitedNewCards.slice(0, cardsPerDay - sessionCards.length)];
        } else {
            sessionCards = sessionCards.slice(0, cardsPerDay);
        }
        
        // Mélange les cartes
        this.currentSession.cards = Utils.shuffleArray(sessionCards);
        this.currentSession.currentIndex = 0;
        this.currentSession.isFlipped = false;
        this.currentSession.todayLearned = 0;
        
        // Met à jour les statistiques
        this.updateStats();
        
        return this.currentSession.cards.length > 0;
    },
    
    /**
     * Obtient la carte actuelle
     * @returns {Object|null} Carte actuelle
     */
    getCurrentCard: function() {
        if (this.currentSession.cards.length === 0 || 
            this.currentSession.currentIndex >= this.currentSession.cards.length) {
            return null;
        }
        
        return this.currentSession.cards[this.currentSession.currentIndex];
    },
    
    /**
     * Retourne la carte actuelle
     */
    flipCard: function() {
        this.currentSession.isFlipped = !this.currentSession.isFlipped;
        return this.currentSession.isFlipped;
    },
    
    /**
     * Réinitialise l'état de la carte
     */
    resetCardFlip: function() {
        this.currentSession.isFlipped = false;
    },
    
    /**
     * Vérifie si la carte est retournée
     * @returns {boolean} État de la carte
     */
    isCardFlipped: function() {
        return this.currentSession.isFlipped;
    },
    
    /**
     * Passe à la carte suivante
     * @returns {Object|null} Carte suivante ou null si fin de session
     */
    nextCard: function() {
        this.currentSession.currentIndex++;
        this.resetCardFlip();
        
        return this.getCurrentCard();
    },
    
    /**
     * Évalue la carte actuelle
     * @param {string} rating - Évaluation ('difficult', 'good', 'easy')
     * @returns {Object|null} Carte suivante ou null si fin de session
     */
    rateCard: function(rating) {
        const currentCard = this.getCurrentCard();
        
        if (!currentCard) {
            return null;
        }
        
        // Récupère les paramètres
        const settings = Storage.getSettings();
        const difficultInterval = settings ? settings.difficultInterval : 1;
        const goodInterval = settings ? settings.goodInterval : 2;
        const easyInterval = settings ? settings.easyInterval : 4;
        
        // Calcule le nouvel intervalle en fonction de l'évaluation
        let newInterval;
        let newEase = currentCard.ease || 2.5;
        let newStatus = currentCard.status;
        
        switch (rating) {
            case 'difficult':
                newInterval = difficultInterval;
                newEase = Math.max(1.3, newEase - 0.2);
                newStatus = Storage.STATUS.LEARNING;
                break;
            case 'good':
                newInterval = goodInterval;
                if (currentCard.status === Storage.STATUS.NEW) {
                    newStatus = Storage.STATUS.LEARNING;
                } else if (currentCard.status === Storage.STATUS.LEARNING && currentCard.interval >= 1) {
                    newStatus = Storage.STATUS.REVIEW;
                }
                break;
            case 'easy':
                newInterval = easyInterval;
                newEase = Math.min(3.0, newEase + 0.1);
                if (currentCard.status === Storage.STATUS.NEW) {
                    newStatus = Storage.STATUS.REVIEW;
                } else if (currentCard.status === Storage.STATUS.LEARNING) {
                    newStatus = Storage.STATUS.REVIEW;
                } else if (currentCard.status === Storage.STATUS.REVIEW && currentCard.interval >= 7) {
                    newStatus = Storage.STATUS.MASTERED;
                }
                break;
            default:
                newInterval = goodInterval;
                newStatus = currentCard.status === Storage.STATUS.NEW ? Storage.STATUS.LEARNING : currentCard.status;
        }
        
        // Si la carte est déjà en révision, multiplie l'intervalle par l'ease factor
        if (currentCard.status === Storage.STATUS.REVIEW || currentCard.status === Storage.STATUS.MASTERED) {
            newInterval = Math.round(newInterval * newEase);
        }
        
        // Met à jour la carte
        const now = new Date();
        const nextReview = Utils.addDays(now, newInterval);
        
        const updates = {
            status: newStatus,
            interval: newInterval,
            ease: newEase,
            reviews: (currentCard.reviews || 0) + 1,
            lastReview: now.toISOString(),
            nextReview: nextReview.toISOString()
        };
        
        // Sauvegarde les modifications
        Storage.updateWord(currentCard.id, updates);
        
        // Incrémente le compteur de mots appris aujourd'hui
        this.currentSession.todayLearned++;
        
        // Met à jour les statistiques
        this.updateStats();
        
        // Passe à la carte suivante
        return this.nextCard();
    },
    
    /**
     * Met à jour les statistiques d'apprentissage
     */
    updateStats: function() {
        const allWords = Storage.getWords();
        const today = new Date();
        
        // Compte les mots restants à réviser aujourd'hui
        const remainingCount = allWords.filter(word => {
            if (!word.nextReview) return true;
            const nextReview = new Date(word.nextReview);
            return nextReview <= today;
        }).length;
        
        // Compte les mots maîtrisés
        const masteredCount = allWords.filter(word => word.status === Storage.STATUS.MASTERED).length;
        
        // Met à jour les éléments HTML
        const remainingCountElement = document.getElementById('remaining-count');
        const learnedTodayElement = document.getElementById('learned-today');
        const masteredCountElement = document.getElementById('mastered-count');
        
        if (remainingCountElement) {
            remainingCountElement.textContent = remainingCount;
        }
        
        if (learnedTodayElement) {
            learnedTodayElement.textContent = this.currentSession.todayLearned;
        }
        
        if (masteredCountElement) {
            masteredCountElement.textContent = masteredCount;
        }
        
        return {
            remainingCount,
            learnedToday: this.currentSession.todayLearned,
            masteredCount
        };
    },
    
    /**
     * Vérifie s'il reste des cartes dans la session
     * @returns {boolean} Vrai s'il reste des cartes
     */
    hasRemainingCards: function() {
        return this.currentSession.currentIndex < this.currentSession.cards.length;
    },
    
    /**
     * Obtient le nombre de cartes restantes dans la session
     * @returns {number} Nombre de cartes restantes
     */
    getRemainingCardsCount: function() {
        return this.currentSession.cards.length - this.currentSession.currentIndex;
    },
    
    /**
     * Obtient le nombre total de cartes dans la session
     * @returns {number} Nombre total de cartes
     */
    getTotalCardsCount: function() {
        return this.currentSession.cards.length;
    }
};

// Exporte l'objet Flashcards pour une utilisation dans d'autres fichiers
window.Flashcards = Flashcards;
