/**
 * storage.js - Gestion du stockage local des données
 */

const Storage = {
    /**
     * Clés de stockage
     */
    KEYS: {
        WORDS: 'ankipro_words',
        SETTINGS: 'ankipro_settings',
        RECENT_TRANSLATIONS: 'ankipro_recent_translations',
        LAST_STUDY_DATE: 'ankipro_last_study_date'
    },

    /**
     * Statuts possibles pour un mot
     */
    STATUS: {
        NEW: 'new',
        LEARNING: 'learning',
        REVIEW: 'review',
        MASTERED: 'mastered'
    },

    /**
     * Paramètres par défaut
     */
    DEFAULT_SETTINGS: {
        cardsPerDay: 20,
        newCardsPerDay: 10,
        theme: 'light',
        easyInterval: 4,
        goodInterval: 2,
        difficultInterval: 1
    },

    /**
     * Initialise le stockage
     */
    init: function() {
        if (!Utils.isLocalStorageAvailable()) {
            Utils.showNotification('Le stockage local n\'est pas disponible. Certaines fonctionnalités peuvent ne pas fonctionner correctement.', 'error');
            return false;
        }

        // Initialise les paramètres s'ils n'existent pas
        if (!this.getSettings()) {
            this.saveSettings(this.DEFAULT_SETTINGS);
        }

        // Initialise la liste de mots si elle n'existe pas
        if (!this.getWords()) {
            this.saveWords([]);
        }

        // Initialise les traductions récentes si elles n'existent pas
        if (!this.getRecentTranslations()) {
            this.saveRecentTranslations([]);
        }

        return true;
    },

    /**
     * Récupère tous les mots
     * @returns {Array} Liste des mots
     */
    getWords: function() {
        try {
            const words = localStorage.getItem(this.KEYS.WORDS);
            return words ? JSON.parse(words) : [];
        } catch (e) {
            console.error('Erreur lors de la récupération des mots:', e);
            return [];
        }
    },

    /**
     * Sauvegarde la liste des mots
     * @param {Array} words - Liste des mots
     */
    saveWords: function(words) {
        try {
            localStorage.setItem(this.KEYS.WORDS, JSON.stringify(words));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des mots:', e);
            Utils.showNotification('Erreur lors de la sauvegarde des mots.', 'error');
        }
    },

    /**
     * Ajoute un mot à la liste
     * @param {Object} word - Mot à ajouter
     * @returns {boolean} Succès de l'opération
     */
    addWord: function(word) {
        try {
            const words = this.getWords();
            
            // Vérifie si le mot existe déjà
            const existingIndex = words.findIndex(w => w.original.toLowerCase() === word.original.toLowerCase());
            
            if (existingIndex !== -1) {
                // Met à jour le mot existant
                words[existingIndex] = {
                    ...words[existingIndex],
                    translation: word.translation,
                    lastUpdated: new Date().toISOString()
                };
                Utils.showNotification('Mot mis à jour.', 'info');
            } else {
                // Ajoute le nouveau mot
                const newWord = {
                    id: Utils.generateUniqueId(),
                    original: word.original,
                    translation: word.translation,
                    status: this.STATUS.NEW,
                    interval: 0,
                    ease: 2.5,
                    reviews: 0,
                    lastReview: null,
                    nextReview: new Date().toISOString(),
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };
                words.push(newWord);
                Utils.showNotification('Mot ajouté à votre liste.', 'success');
            }
            
            this.saveWords(words);
            return true;
        } catch (e) {
            console.error('Erreur lors de l\'ajout du mot:', e);
            Utils.showNotification('Erreur lors de l\'ajout du mot.', 'error');
            return false;
        }
    },

    /**
     * Ajoute plusieurs mots à la liste
     * @param {Array} wordsList - Liste des mots à ajouter
     * @returns {boolean} Succès de l'opération
     */
    addMultipleWords: function(wordsList) {
        try {
            const words = this.getWords();
            let added = 0;
            let updated = 0;
            
            wordsList.forEach(newWord => {
                // Vérifie si le mot existe déjà
                const existingIndex = words.findIndex(w => w.original.toLowerCase() === newWord.original.toLowerCase());
                
                if (existingIndex !== -1) {
                    // Met à jour le mot existant
                    words[existingIndex] = {
                        ...words[existingIndex],
                        translation: newWord.translation,
                        lastUpdated: new Date().toISOString()
                    };
                    updated++;
                } else {
                    // Ajoute le nouveau mot
                    const wordToAdd = {
                        id: Utils.generateUniqueId(),
                        original: newWord.original,
                        translation: newWord.translation,
                        status: this.STATUS.NEW,
                        interval: 0,
                        ease: 2.5,
                        reviews: 0,
                        lastReview: null,
                        nextReview: new Date().toISOString(),
                        created: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    };
                    words.push(wordToAdd);
                    added++;
                }
            });
            
            this.saveWords(words);
            
            if (added > 0 || updated > 0) {
                const message = `${added} mot(s) ajouté(s) et ${updated} mot(s) mis à jour.`;
                Utils.showNotification(message, 'success');
            }
            
            return true;
        } catch (e) {
            console.error('Erreur lors de l\'ajout des mots:', e);
            Utils.showNotification('Erreur lors de l\'ajout des mots.', 'error');
            return false;
        }
    },

    /**
     * Supprime un mot de la liste
     * @param {string} wordId - ID du mot à supprimer
     * @returns {boolean} Succès de l'opération
     */
    deleteWord: function(wordId) {
        try {
            const words = this.getWords();
            const filteredWords = words.filter(word => word.id !== wordId);
            
            if (filteredWords.length < words.length) {
                this.saveWords(filteredWords);
                Utils.showNotification('Mot supprimé.', 'info');
                return true;
            }
            
            return false;
        } catch (e) {
            console.error('Erreur lors de la suppression du mot:', e);
            Utils.showNotification('Erreur lors de la suppression du mot.', 'error');
            return false;
        }
    },

    /**
     * Met à jour un mot
     * @param {string} wordId - ID du mot à mettre à jour
     * @param {Object} updates - Mises à jour à appliquer
     * @returns {boolean} Succès de l'opération
     */
    updateWord: function(wordId, updates) {
        try {
            const words = this.getWords();
            const wordIndex = words.findIndex(word => word.id === wordId);
            
            if (wordIndex !== -1) {
                words[wordIndex] = {
                    ...words[wordIndex],
                    ...updates,
                    lastUpdated: new Date().toISOString()
                };
                
                this.saveWords(words);
                return true;
            }
            
            return false;
        } catch (e) {
            console.error('Erreur lors de la mise à jour du mot:', e);
            Utils.showNotification('Erreur lors de la mise à jour du mot.', 'error');
            return false;
        }
    },

    /**
     * Récupère les paramètres
     * @returns {Object} Paramètres
     */
    getSettings: function() {
        try {
            const settings = localStorage.getItem(this.KEYS.SETTINGS);
            return settings ? JSON.parse(settings) : null;
        } catch (e) {
            console.error('Erreur lors de la récupération des paramètres:', e);
            return null;
        }
    },

    /**
     * Sauvegarde les paramètres
     * @param {Object} settings - Paramètres à sauvegarder
     */
    saveSettings: function(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des paramètres:', e);
            Utils.showNotification('Erreur lors de la sauvegarde des paramètres.', 'error');
        }
    },

    /**
     * Récupère les traductions récentes
     * @returns {Array} Traductions récentes
     */
    getRecentTranslations: function() {
        try {
            const translations = localStorage.getItem(this.KEYS.RECENT_TRANSLATIONS);
            return translations ? JSON.parse(translations) : [];
        } catch (e) {
            console.error('Erreur lors de la récupération des traductions récentes:', e);
            return [];
        }
    },

    /**
     * Sauvegarde les traductions récentes
     * @param {Array} translations - Traductions à sauvegarder
     */
    saveRecentTranslations: function(translations) {
        try {
            localStorage.setItem(this.KEYS.RECENT_TRANSLATIONS, JSON.stringify(translations));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des traductions récentes:', e);
        }
    },

    /**
     * Ajoute une traduction récente
     * @param {Object} translation - Traduction à ajouter
     */
    addRecentTranslation: function(translation) {
        try {
            const translations = this.getRecentTranslations();
            
            // Vérifie si la traduction existe déjà
            const existingIndex = translations.findIndex(t => t.original.toLowerCase() === translation.original.toLowerCase());
            
            if (existingIndex !== -1) {
                // Supprime l'ancienne traduction
                translations.splice(existingIndex, 1);
            }
            
            // Ajoute la nouvelle traduction au début
            translations.unshift({
                ...translation,
                timestamp: new Date().toISOString()
            });
            
            // Limite à 10 traductions récentes
            const limitedTranslations = translations.slice(0, 10);
            
            this.saveRecentTranslations(limitedTranslations);
        } catch (e) {
            console.error('Erreur lors de l\'ajout de la traduction récente:', e);
        }
    },

    /**
     * Récupère la date de la dernière étude
     * @returns {string|null} Date de la dernière étude
     */
    getLastStudyDate: function() {
        try {
            return localStorage.getItem(this.KEYS.LAST_STUDY_DATE);
        } catch (e) {
            console.error('Erreur lors de la récupération de la date de dernière étude:', e);
            return null;
        }
    },

    /**
     * Sauvegarde la date de la dernière étude
     */
    updateLastStudyDate: function() {
        try {
            localStorage.setItem(this.KEYS.LAST_STUDY_DATE, new Date().toISOString());
        } catch (e) {
            console.error('Erreur lors de la sauvegarde de la date de dernière étude:', e);
        }
    },

    /**
     * Exporte toutes les données
     * @returns {Object} Données exportées
     */
    exportData: function() {
        return {
            words: this.getWords(),
            settings: this.getSettings(),
            recentTranslations: this.getRecentTranslations(),
            lastStudyDate: this.getLastStudyDate(),
            exportDate: new Date().toISOString()
        };
    },

    /**
     * Importe des données
     * @param {Object} data - Données à importer
     * @returns {boolean} Succès de l'opération
     */
    importData: function(data) {
        try {
            if (data.words) this.saveWords(data.words);
            if (data.settings) this.saveSettings(data.settings);
            if (data.recentTranslations) this.saveRecentTranslations(data.recentTranslations);
            if (data.lastStudyDate) localStorage.setItem(this.KEYS.LAST_STUDY_DATE, data.lastStudyDate);
            
            Utils.showNotification('Données importées avec succès.', 'success');
            return true;
        } catch (e) {
            console.error('Erreur lors de l\'importation des données:', e);
            Utils.showNotification('Erreur lors de l\'importation des données.', 'error');
            return false;
        }
    },

    /**
     * Réinitialise toutes les données
     * @returns {boolean} Succès de l'opération
     */
    resetAllData: function() {
        try {
            localStorage.removeItem(this.KEYS.WORDS);
            localStorage.removeItem(this.KEYS.RECENT_TRANSLATIONS);
            localStorage.removeItem(this.KEYS.LAST_STUDY_DATE);
            
            // Conserve les paramètres
            const settings = this.getSettings();
            this.init();
            if (settings) this.saveSettings(settings);
            
            Utils.showNotification('Toutes les données ont été réinitialisées.', 'info');
            return true;
        } catch (e) {
            console.error('Erreur lors de la réinitialisation des données:', e);
            Utils.showNotification('Erreur lors de la réinitialisation des données.', 'error');
            return false;
        }
    }
};

// Exporte l'objet Storage pour une utilisation dans d'autres fichiers
window.Storage = Storage;
