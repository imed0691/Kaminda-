/**
 * utils.js - Fonctions utilitaires pour l'application
 */

const Utils = {
    /**
     * Génère un identifiant unique
     * @returns {string} Identifiant unique
     */
    generateUniqueId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /**
     * Formate une date au format local
     * @param {Date|number|string} date - Date à formater
     * @returns {string} Date formatée
     */
    formatDate: function(date) {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    },

    /**
     * Calcule le nombre de jours entre deux dates
     * @param {Date|number|string} date1 - Première date
     * @param {Date|number|string} date2 - Deuxième date
     * @returns {number} Nombre de jours
     */
    daysBetween: function(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1);
        const secondDate = new Date(date2);
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    },

    /**
     * Ajoute un nombre de jours à une date
     * @param {Date|number|string} date - Date de départ
     * @param {number} days - Nombre de jours à ajouter
     * @returns {Date} Nouvelle date
     */
    addDays: function(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    /**
     * Vérifie si une date est aujourd'hui
     * @param {Date|number|string} date - Date à vérifier
     * @returns {boolean} Vrai si la date est aujourd'hui
     */
    isToday: function(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return checkDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
    },

    /**
     * Affiche une notification temporaire
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, error, info)
     * @param {number} duration - Durée d'affichage en ms
     */
    showNotification: function(message, type = 'info', duration = 3000) {
        // Supprime les notifications existantes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        // Crée la notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Ajoute la notification au DOM
        document.body.appendChild(notification);

        // Supprime la notification après la durée spécifiée
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, duration);
    },

    /**
     * Échappe les caractères HTML spéciaux
     * @param {string} text - Texte à échapper
     * @returns {string} Texte échappé
     */
    escapeHtml: function(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    /**
     * Tronque un texte à une longueur maximale
     * @param {string} text - Texte à tronquer
     * @param {number} maxLength - Longueur maximale
     * @returns {string} Texte tronqué
     */
    truncateText: function(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength - 3) + '...';
    },

    /**
     * Vérifie si une chaîne est vide ou ne contient que des espaces
     * @param {string} str - Chaîne à vérifier
     * @returns {boolean} Vrai si la chaîne est vide
     */
    isEmptyString: function(str) {
        return !str || str.trim() === '';
    },

    /**
     * Convertit une chaîne en tableau de mots
     * @param {string} text - Texte à convertir
     * @returns {string[]} Tableau de mots
     */
    textToWordArray: function(text) {
        if (!text) return [];
        return text.split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
    },

    /**
     * Mélange aléatoirement un tableau
     * @param {Array} array - Tableau à mélanger
     * @returns {Array} Tableau mélangé
     */
    shuffleArray: function(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    /**
     * Vérifie si le navigateur prend en charge le stockage local
     * @returns {boolean} Vrai si le stockage local est pris en charge
     */
    isLocalStorageAvailable: function() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Télécharge un fichier
     * @param {string} content - Contenu du fichier
     * @param {string} fileName - Nom du fichier
     * @param {string} contentType - Type de contenu
     */
    downloadFile: function(content, fileName, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    /**
     * Lit un fichier texte
     * @param {File} file - Fichier à lire
     * @returns {Promise<string>} Contenu du fichier
     */
    readTextFile: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target.result);
            reader.onerror = error => reject(error);
            reader.readAsText(file);
        });
    },

    /**
     * Prononce un texte en utilisant l'API Web Speech
     * @param {string} text - Texte à prononcer
     * @param {string} lang - Langue (en-US, fr-FR, etc.)
     */
    speakText: function(text, lang = 'en-US') {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            speechSynthesis.speak(utterance);
        } else {
            console.warn('La synthèse vocale n\'est pas prise en charge par ce navigateur.');
        }
    }
};

// Exporte l'objet Utils pour une utilisation dans d'autres fichiers
window.Utils = Utils;
