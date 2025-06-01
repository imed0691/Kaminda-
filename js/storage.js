/**
 * Module de stockage (version frontend uniquement)
 */
const Storage = {
    // Clés de stockage
    LISTS_KEY: 'ankipro_lists',
    STATS_KEY: 'ankipro_stats',
    SETTINGS_KEY: 'ankipro_settings',
    
    /**
     * Initialise le module de stockage
     */
    init: function() {
        // Vérifier si le stockage local est disponible
        if (!this.isLocalStorageAvailable()) {
            console.error('Le stockage local n\'est pas disponible');
            alert('Votre navigateur ne supporte pas le stockage local. L\'application ne fonctionnera pas correctement.');
        }
        
        // Initialiser les données si nécessaire
        if (!localStorage.getItem(this.LISTS_KEY)) {
            localStorage.setItem(this.LISTS_KEY, JSON.stringify([]));
        }
        
        if (!localStorage.getItem(this.STATS_KEY)) {
            localStorage.setItem(this.STATS_KEY, JSON.stringify({}));
        }
        
        if (!localStorage.getItem(this.SETTINGS_KEY)) {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({
                cardsPerDay: 20,
                newCardsPerDay: 10,
                theme: 'light'
            }));
        }
        
        // Appliquer le thème
        this.applyTheme(this.getSettings().theme || 'light');
    },
    
    /**
     * Vérifie si le stockage local est disponible
     * @returns {boolean} Vrai si le stockage local est disponible
     */
    isLocalStorageAvailable: function() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Obtient les listes
     * @returns {Array} Liste des listes
     */
    getLists: function() {
        const listsJson = localStorage.getItem(this.LISTS_KEY);
        return listsJson ? JSON.parse(listsJson) : [];
    },
    
    /**
     * Obtient une liste par son ID
     * @param {string} listId - ID de la liste
     * @returns {Object|null} Liste ou null si non trouvée
     */
    getList: function(listId) {
        const lists = this.getLists();
        return lists.find(list => list.id === listId) || null;
    },
    
    /**
     * Ajoute une liste
     * @param {Object} list - Liste à ajouter
     */
    addList: function(list) {
        const lists = this.getLists();
        lists.push(list);
        localStorage.setItem(this.LISTS_KEY, JSON.stringify(lists));
    },
    
    /**
     * Met à jour une liste
     * @param {string} listId - ID de la liste
     * @param {Object} updates - Mises à jour à appliquer
     */
    updateList: function(listId, updates) {
        const lists = this.getLists();
        const index = lists.findIndex(list => list.id === listId);
        
        if (index !== -1) {
            // Fusionner les mises à jour avec la liste existante
            lists[index] = { ...lists[index], ...updates };
            localStorage.setItem(this.LISTS_KEY, JSON.stringify(lists));
        }
    },
    
    /**
     * Supprime une liste
     * @param {string} listId - ID de la liste
     */
    deleteList: function(listId) {
        const lists = this.getLists();
        const filteredLists = lists.filter(list => list.id !== listId);
        localStorage.setItem(this.LISTS_KEY, JSON.stringify(filteredLists));
        
        // Supprimer également les statistiques associées
        this.deleteListStatistics(listId);
    },
    
    /**
     * Ajoute un mot à une liste
     * @param {string} listId - ID de la liste
     * @param {Object} word - Mot à ajouter
     */
    addWord: function(listId, word) {
        const lists = this.getLists();
        const index = lists.findIndex(list => list.id === listId);
        
        if (index !== -1) {
            // Initialiser le tableau de mots s'il n'existe pas
            if (!lists[index].words) {
                lists[index].words = [];
            }
            
            // Ajouter le mot
            lists[index].words.push(word);
            
            // Mettre à jour la date de modification
            lists[index].updated_at = new Date().toISOString();
            
            localStorage.setItem(this.LISTS_KEY, JSON.stringify(lists));
        }
    },
    
    /**
     * Ajoute plusieurs mots à une liste
     * @param {string} listId - ID de la liste
     * @param {Array} words - Mots à ajouter
     */
    addWords: function(listId, words) {
        const lists = this.getLists();
        const index = lists.findIndex(list => list.id === listId);
        
        if (index !== -1) {
            // Initialiser le tableau de mots s'il n'existe pas
            if (!lists[index].words) {
                lists[index].words = [];
            }
            
            // Ajouter les mots
            lists[index].words = [...lists[index].words, ...words];
            
            // Mettre à jour la date de modification
            lists[index].updated_at = new Date().toISOString();
            
            localStorage.setItem(this.LISTS_KEY, JSON.stringify(lists));
        }
    },
    
    /**
     * Met à jour un mot
     * @param {string} listId - ID de la liste
     * @param {string} wordId - ID du mot
     * @param {Object} updates - Mises à jour à appliquer
     */
    updateWord: function(listId, wordId, updates) {
        const lists = this.getLists();
        const listIndex = lists.findIndex(list => list.id === listId);
        
        if (listIndex !== -1 && lists[listIndex].words) {
            const wordIndex = lists[listIndex].words.findIndex(word => word.id === wordId);
            
            if (wordIndex !== -1) {
                // Fusionner les mises à jour avec le mot existant
                lists[listIndex].words[wordIndex] = { ...lists[listIndex].words[wordIndex], ...updates };
                
                // Mettre à jour la date de modification de la liste
                lists[listIndex].updated_at = new Date().toISOString();
                
                localStorage.setItem(this.LISTS_KEY, JSON.stringify(lists));
            }
        }
    },
    
    /**
     * Supprime un mot
     * @param {string} listId - ID de la liste
     * @param {string} wordId - ID du mot
     */
    deleteWord: function(listId, wordId) {
        const lists = this.getLists();
        const listIndex = lists.findIndex(list => list.id === listId);
        
        if (listIndex !== -1 && lists[listIndex].words) {
            // Filtrer le mot à supprimer
            lists[listIndex].words = lists[listIndex].words.filter(word => word.id !== wordId);
            
            // Mettre à jour la date de modification
            lists[listIndex].updated_at = new Date().toISOString();
            
            localStorage.setItem(this.LISTS_KEY, JSON.stringify(lists));
        }
    },
    
    /**
     * Obtient les statistiques d'une liste
     * @param {string} listId - ID de la liste
     * @returns {Array} Statistiques de la liste
     */
    getListStatistics: function(listId) {
        const statsJson = localStorage.getItem(this.STATS_KEY);
        const stats = statsJson ? JSON.parse(statsJson) : {};
        
        return stats[listId] || [];
    },
    
    /**
     * Ajoute une statistique à une liste
     * @param {string} listId - ID de la liste
     * @param {Object} stat - Statistique à ajouter
     */
    addListStatistic: function(listId, stat) {
        const statsJson = localStorage.getItem(this.STATS_KEY);
        const stats = statsJson ? JSON.parse(statsJson) : {};
        
        // Initialiser le tableau de statistiques s'il n'existe pas
        if (!stats[listId]) {
            stats[listId] = [];
        }
        
        // Ajouter la statistique
        stats[listId].push(stat);
        
        localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    },
    
    /**
     * Supprime les statistiques d'une liste
     * @param {string} listId - ID de la liste
     */
    deleteListStatistics: function(listId) {
        const statsJson = localStorage.getItem(this.STATS_KEY);
        const stats = statsJson ? JSON.parse(statsJson) : {};
        
        // Supprimer les statistiques de la liste
        delete stats[listId];
        
        localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    },
    
    /**
     * Obtient les statistiques
     * @returns {Object} Statistiques
     */
    getStatistics: function() {
        const statsJson = localStorage.getItem(this.STATS_KEY);
        return statsJson ? JSON.parse(statsJson) : {};
    },
    
    /**
     * Obtient les paramètres
     * @returns {Object} Paramètres
     */
    getSettings: function() {
        const settingsJson = localStorage.getItem(this.SETTINGS_KEY);
        return settingsJson ? JSON.parse(settingsJson) : {
            cardsPerDay: 20,
            newCardsPerDay: 10,
            theme: 'light'
        };
    },
    
    /**
     * Met à jour les paramètres
     * @param {Object} updates - Mises à jour à appliquer
     */
    updateSettings: function(updates) {
        const settings = this.getSettings();
        const updatedSettings = { ...settings, ...updates };
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
        
        // Appliquer le thème si nécessaire
        if (updates.theme) {
            this.applyTheme(updates.theme);
        }
    },
    
    /**
     * Applique un thème
     * @param {string} theme - Thème à appliquer (light, dark, auto)
     */
    applyTheme: function(theme) {
        const body = document.body;
        
        // Supprimer les classes de thème existantes
        body.classList.remove('theme-light', 'theme-dark');
        
        // Appliquer le thème
        if (theme === 'auto') {
            // Détecter le thème du système
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            body.classList.add(`theme-${theme}`);
        }
    },
    
    /**
     * Exporte les données
     * @returns {Object} Données exportées
     */
    exportData: function() {
        return {
            lists: this.getLists(),
            statistics: this.getStatistics(),
            settings: this.getSettings(),
            version: '1.0.0',
            exportDate: new Date().toISOString()
        };
    },
    
    /**
     * Importe des données
     * @param {Object} data - Données à importer
     * @returns {boolean} Vrai si l'importation a réussi
     */
    importData: function(data) {
        // Vérifier que les données sont valides
        if (!data || !data.lists || !data.statistics || !data.settings) {
            return false;
        }
        
        // Importer les données
        localStorage.setItem(this.LISTS_KEY, JSON.stringify(data.lists));
        localStorage.setItem(this.STATS_KEY, JSON.stringify(data.statistics));
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));
        
        // Appliquer le thème
        this.applyTheme(data.settings.theme || 'light');
        
        return true;
    },
    
    /**
     * Réinitialise les données
     */
    resetData: function() {
        // Sauvegarder les paramètres
        const settings = this.getSettings();
        
        // Réinitialiser les données
        localStorage.setItem(this.LISTS_KEY, JSON.stringify([]));
        localStorage.setItem(this.STATS_KEY, JSON.stringify({}));
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    }
};

// Exporter le module Storage pour une utilisation dans d'autres fichiers
window.Storage = Storage;
