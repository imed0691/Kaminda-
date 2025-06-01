/**
 * Module utilitaire
 */
const Utils = {
    /**
     * Affiche une notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, error, info)
     */
    showNotification: function(message, type = 'info') {
        // Créer l'élément de notification s'il n'existe pas
        let notificationContainer = document.getElementById('notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Ajouter l'icône en fonction du type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        // Ajouter le contenu
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${this.escapeHtml(message)}</div>
            <button class="notification-close">&times;</button>
        `;
        
        // Ajouter la notification au conteneur
        notificationContainer.appendChild(notification);
        
        // Attacher l'événement pour fermer la notification
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Fermer automatiquement après 5 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('closing');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    },
    
    /**
     * Échappe les caractères HTML
     * @param {string} text - Texte à échapper
     * @returns {string} Texte échappé
     */
    escapeHtml: function(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    },
    
    /**
     * Mélange un tableau
     * @param {Array} array - Tableau à mélanger
     */
    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    },
    
    /**
     * Formate une date
     * @param {string} dateString - Chaîne de date ISO
     * @param {string} format - Format (short, medium, long, datetime)
     * @returns {string} Date formatée
     */
    formatDate: function(dateString, format = 'short') {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Date invalide';
        }
        
        switch (format) {
            case 'short':
                return date.toLocaleDateString();
            case 'medium':
                return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            case 'long':
                return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            case 'datetime':
                return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + 
                       date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            default:
                return date.toLocaleDateString();
        }
    },
    
    /**
     * Génère un ID unique
     * @returns {string} ID unique
     */
    generateId: function() {
        return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    },
    
    /**
     * Lit un texte à haute voix
     * @param {string} text - Texte à lire
     * @param {string} lang - Langue (en-US, fr-FR, etc.)
     */
    speakText: function(text, lang = 'en-US') {
        if (!('speechSynthesis' in window)) {
            console.error('La synthèse vocale n\'est pas supportée par ce navigateur');
            return;
        }
        
        // Arrêter toute lecture en cours
        window.speechSynthesis.cancel();
        
        // Créer un nouvel objet de synthèse vocale
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        
        // Lire le texte
        window.speechSynthesis.speak(utterance);
    }
};

// Exporter le module Utils pour une utilisation dans d'autres fichiers
window.Utils = Utils;
