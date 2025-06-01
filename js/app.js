/**
 * Module principal de l'application
 */
const App = {
    /**
     * Initialise l'application
     */
    init: function() {
        console.log('Initialisation de l\'application AnkiPro Français');
        
        // Initialiser les modules
        Storage.init();
        Auth.init();
        Lists.init();
        Tests.init();
        Flashcards.init();
        Translation.init();
        
        // Attacher les gestionnaires d'événements
        this.bindEvents();
        
        // Afficher la vue d'accueil par défaut
        this.showView('home-view');
    },
    
    /**
     * Attache les gestionnaires d'événements
     */
    bindEvents: function() {
        // Navigation
        document.getElementById('nav-home').addEventListener('click', () => {
            this.showView('home-view');
            this.updateActiveNavItem('nav-home');
        });
        
        document.getElementById('nav-lists').addEventListener('click', () => {
            Lists.showListsView();
            this.updateActiveNavItem('nav-lists');
        });
        
        document.getElementById('nav-translate').addEventListener('click', () => {
            this.showView('translate-view');
            this.updateActiveNavItem('nav-translate');
        });
        
        document.getElementById('nav-settings').addEventListener('click', () => {
            this.showView('settings-view');
            this.loadSettings();
            this.updateActiveNavItem('nav-settings');
        });
        
        // Boutons de la page d'accueil
        document.getElementById('create-list-btn').addEventListener('click', () => {
            Lists.showCreateListModal();
        });
        
        document.getElementById('view-lists-btn').addEventListener('click', () => {
            Lists.showListsView();
            this.updateActiveNavItem('nav-lists');
        });
        
        // Paramètres
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });
        
        document.getElementById('export-data-btn').addEventListener('click', () => {
            this.exportData();
        });
        
        document.getElementById('import-data-btn').addEventListener('click', () => {
            this.showImportDataModal();
        });
        
        document.getElementById('reset-data-btn').addEventListener('click', () => {
            this.showResetDataModal();
        });
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
    },
    
    /**
     * Met à jour l'élément de navigation actif
     * @param {string} navItemId - ID de l'élément de navigation
     */
    updateActiveNavItem: function(navItemId) {
        // Supprimer la classe active de tous les éléments de navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Ajouter la classe active à l'élément de navigation demandé
        const navItem = document.getElementById(navItemId);
        if (navItem) {
            navItem.classList.add('active');
        }
    },
    
    /**
     * Charge les paramètres
     */
    loadSettings: function() {
        const settings = Storage.getSettings();
        
        // Mettre à jour les champs
        document.getElementById('cards-per-day').value = settings.cardsPerDay || 20;
        document.getElementById('new-cards-per-day').value = settings.newCardsPerDay || 10;
        document.getElementById('theme-select').value = settings.theme || 'light';
    },
    
    /**
     * Enregistre les paramètres
     */
    saveSettings: function() {
        const cardsPerDay = parseInt(document.getElementById('cards-per-day').value);
        const newCardsPerDay = parseInt(document.getElementById('new-cards-per-day').value);
        const theme = document.getElementById('theme-select').value;
        
        // Validation
        if (isNaN(cardsPerDay) || cardsPerDay < 5 || cardsPerDay > 100) {
            Utils.showNotification('Le nombre de cartes par jour doit être compris entre 5 et 100', 'error');
            return;
        }
        
        if (isNaN(newCardsPerDay) || newCardsPerDay < 1 || newCardsPerDay > 50) {
            Utils.showNotification('Le nombre de nouvelles cartes par jour doit être compris entre 1 et 50', 'error');
            return;
        }
        
        // Enregistrer les paramètres
        Storage.updateSettings({
            cardsPerDay: cardsPerDay,
            newCardsPerDay: newCardsPerDay,
            theme: theme
        });
        
        Utils.showNotification('Paramètres enregistrés avec succès', 'success');
    },
    
    /**
     * Exporte les données
     */
    exportData: function() {
        const data = Storage.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'ankipro_data_' + new Date().toISOString().slice(0, 10) + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        Utils.showNotification('Données exportées avec succès', 'success');
    },
    
    /**
     * Affiche la modal d'importation de données
     */
    showImportDataModal: function() {
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('import-data-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'import-data-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Importer des données</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="import-warning">
                            <p><strong>Attention :</strong> L'importation de données remplacera toutes vos données actuelles. Assurez-vous d'avoir exporté vos données actuelles avant de continuer.</p>
                        </div>
                        <div class="form-group">
                            <label for="import-data-file">Fichier de données</label>
                            <input type="file" id="import-data-file" accept=".json">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-import-data-btn">Annuler</button>
                        <button class="btn primary" id="submit-import-data-btn">Importer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-import-data-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('submit-import-data-btn').addEventListener('click', () => {
                this.importData();
            });
        }
        
        // Afficher la modal
        document.getElementById('import-data-modal').classList.add('active');
    },
    
    /**
     * Importe des données
     */
    importData: function() {
        const fileInput = document.getElementById('import-data-file');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            Utils.showNotification('Veuillez sélectionner un fichier', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Vérifier que les données sont valides
                if (!data || !data.lists || !data.statistics || !data.settings) {
                    Utils.showNotification('Le fichier ne contient pas de données valides', 'error');
                    return;
                }
                
                // Importer les données
                const success = Storage.importData(data);
                
                if (success) {
                    Utils.showNotification('Données importées avec succès', 'success');
                    document.getElementById('import-data-modal').classList.remove('active');
                    
                    // Recharger la page pour appliquer les changements
                    window.location.reload();
                } else {
                    Utils.showNotification('Erreur lors de l\'importation des données', 'error');
                }
            } catch (error) {
                console.error('Erreur lors de l\'importation des données', error);
                Utils.showNotification('Erreur lors de l\'importation des données', 'error');
            }
        };
        
        reader.readAsText(file);
    },
    
    /**
     * Affiche la modal de réinitialisation des données
     */
    showResetDataModal: function() {
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('reset-data-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'reset-data-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Réinitialiser les données</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="reset-warning">
                            <p><strong>Attention :</strong> La réinitialisation des données supprimera toutes vos listes et statistiques. Cette action est irréversible.</p>
                        </div>
                        <p>Êtes-vous sûr de vouloir réinitialiser toutes les données ?</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-reset-data-btn">Annuler</button>
                        <button class="btn danger" id="confirm-reset-data-btn">Réinitialiser</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-reset-data-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('confirm-reset-data-btn').addEventListener('click', () => {
                this.resetData();
            });
        }
        
        // Afficher la modal
        document.getElementById('reset-data-modal').classList.add('active');
    },
    
    /**
     * Réinitialise les données
     */
    resetData: function() {
        Storage.resetData();
        
        Utils.showNotification('Données réinitialisées avec succès', 'success');
        document.getElementById('reset-data-modal').classList.remove('active');
        
        // Recharger la page pour appliquer les changements
        window.location.reload();
    }
};

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
