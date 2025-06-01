/**
 * Module de gestion des listes (version frontend uniquement)
 */
const Lists = {
    /**
     * Initialise le module de listes
     */
    init: function() {
        this.bindEvents();
    },
    
    /**
     * Attache les gestionnaires d'événements
     */
    bindEvents: function() {
        document.addEventListener('click', function(e) {
            // Bouton pour afficher la modal de création de liste
            if (e.target.id === 'create-list-btn' || e.target.closest('#create-list-btn') ||
                e.target.id === 'create-list-from-lists-btn' || e.target.closest('#create-list-from-lists-btn')) {
                this.showCreateListModal();
            }
            
            // Bouton pour soumettre le formulaire de création de liste
            if (e.target.id === 'submit-create-list-btn' || e.target.closest('#submit-create-list-btn')) {
                this.createList();
            }
            
            // Bouton pour ouvrir une liste
            if (e.target.classList.contains('open-list-btn') || e.target.closest('.open-list-btn')) {
                const btn = e.target.classList.contains('open-list-btn') ? e.target : e.target.closest('.open-list-btn');
                const listId = btn.dataset.listId;
                this.openList(listId);
            }
            
            // Bouton pour supprimer une liste
            if (e.target.classList.contains('delete-list-btn') || e.target.closest('.delete-list-btn')) {
                const btn = e.target.classList.contains('delete-list-btn') ? e.target : e.target.closest('.delete-list-btn');
                const listId = btn.dataset.listId;
                this.showDeleteListConfirmModal(listId);
            }
            
            // Bouton pour éditer une liste
            if (e.target.classList.contains('edit-list-btn') || e.target.closest('.edit-list-btn')) {
                const btn = e.target.classList.contains('edit-list-btn') ? e.target : e.target.closest('.edit-list-btn');
                const listId = btn.dataset.listId;
                this.showEditListModal(listId);
            }
            
            // Bouton pour soumettre le formulaire d'édition de liste
            if (e.target.id === 'submit-edit-list-btn' || e.target.closest('#submit-edit-list-btn')) {
                this.updateList();
            }
            
            // Bouton pour confirmer la suppression d'une liste
            if (e.target.id === 'confirm-delete-list-btn' || e.target.closest('#confirm-delete-list-btn')) {
                this.deleteList();
            }
            
            // Bouton pour retourner à la liste des listes
            if (e.target.id === 'back-to-lists-btn' || e.target.closest('#back-to-lists-btn')) {
                this.showListsView();
            }
            
            // Bouton pour ajouter un mot
            if (e.target.id === 'add-word-btn' || e.target.closest('#add-word-btn')) {
                this.addWord();
            }
            
            // Bouton pour supprimer un mot
            if (e.target.classList.contains('delete-word-btn') || e.target.closest('.delete-word-btn')) {
                const btn = e.target.classList.contains('delete-word-btn') ? e.target : e.target.closest('.delete-word-btn');
                const wordId = btn.dataset.wordId;
                const listId = document.querySelector('#list-detail-view').dataset.listId;
                this.deleteWord(listId, wordId);
            }
            
            // Bouton pour éditer un mot
            if (e.target.classList.contains('edit-word-btn') || e.target.closest('.edit-word-btn')) {
                const btn = e.target.classList.contains('edit-word-btn') ? e.target : e.target.closest('.edit-word-btn');
                const wordId = btn.dataset.wordId;
                const listId = document.querySelector('#list-detail-view').dataset.listId;
                this.showEditWordModal(listId, wordId);
            }
            
            // Bouton pour soumettre le formulaire d'édition de mot
            if (e.target.id === 'submit-edit-word-btn' || e.target.closest('#submit-edit-word-btn')) {
                this.updateWord();
            }
            
            // Bouton pour démarrer l'apprentissage
            if (e.target.id === 'start-learning-btn' || e.target.closest('#start-learning-btn')) {
                const listId = document.querySelector('#list-detail-view').dataset.listId;
                const list = Storage.getList(listId);
                if (list) {
                    Flashcards.startSession(list);
                }
            }
            
            // Bouton pour démarrer un test
            if (e.target.classList.contains('start-test-btn') || e.target.closest('.start-test-btn')) {
                const btn = e.target.classList.contains('start-test-btn') ? e.target : e.target.closest('.start-test-btn');
                const listId = document.querySelector('#list-detail-view').dataset.listId;
                const testType = btn.dataset.testType;
                const list = Storage.getList(listId);
                if (list) {
                    Tests.startTest(list, testType);
                }
            }
            
            // Onglets de détail de liste
            if (e.target.classList.contains('list-detail-tab') || e.target.closest('.list-detail-tab')) {
                const tab = e.target.classList.contains('list-detail-tab') ? e.target : e.target.closest('.list-detail-tab');
                const tabId = tab.dataset.tabId;
                this.switchTab(tabId);
            }
        }.bind(this));
    },
    
    /**
     * Charge les listes
     */
    loadLists: function() {
        // Récupérer les listes depuis le stockage local
        const lists = Storage.getLists();
        
        // Afficher les listes
        this.displayLists(lists);
    },
    
    /**
     * Affiche les listes
     * @param {Array} lists - Liste des listes
     */
    displayLists: function(lists) {
        const listsContainer = document.getElementById('lists-container');
        
        if (!listsContainer) {
            return;
        }
        
        // Vider le conteneur
        listsContainer.innerHTML = '';
        
        if (lists.length === 0) {
            // Aucune liste
            listsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list"></i>
                    <h3>Aucune liste</h3>
                    <p>Créez votre première liste pour commencer à apprendre.</p>
                    <button id="create-first-list-btn" class="btn primary">
                        <i class="fas fa-plus"></i> Créer une liste
                    </button>
                </div>
            `;
            
            document.getElementById('create-first-list-btn').addEventListener('click', () => {
                this.showCreateListModal();
            });
            
            return;
        }
        
        // Afficher les listes
        lists.forEach(list => {
            const listCard = document.createElement('div');
            listCard.className = 'list-card';
            
            // Calculer les statistiques
            const totalWords = list.words ? list.words.length : 0;
            const masteredWords = list.words ? list.words.filter(word => word.status === 'mastered').length : 0;
            const learningWords = list.words ? list.words.filter(word => word.status === 'learning' || word.status === 'review').length : 0;
            const newWords = list.words ? list.words.filter(word => word.status === 'new' || !word.status).length : 0;
            
            // Formater la date de mise à jour
            const updatedAt = list.updated_at ? Utils.formatDate(list.updated_at, 'medium') : 'Jamais';
            
            listCard.innerHTML = `
                <div class="list-card-header">
                    <h3 class="list-card-title">${Utils.escapeHtml(list.name)}</h3>
                    <div class="list-card-menu">
                        <button class="list-card-menu-btn">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="list-card-menu-content">
                            <button class="list-card-menu-item edit-list-btn" data-list-id="${list.id}">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                            <button class="list-card-menu-item delete-list-btn" data-list-id="${list.id}">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="list-card-stats">
                    <div class="list-card-stat">
                        <i class="fas fa-book"></i>
                        <span>${totalWords} mot${totalWords !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="list-card-stat">
                        <i class="fas fa-clock"></i>
                        <span>Mise à jour : ${updatedAt}</span>
                    </div>
                </div>
                
                <div class="list-card-description">
                    ${list.description ? Utils.escapeHtml(list.description) : 'Aucune description'}
                </div>
                
                <div class="list-card-actions">
                    <button class="btn primary open-list-btn" data-list-id="${list.id}">
                        <i class="fas fa-arrow-right"></i> Ouvrir
                    </button>
                </div>
            `;
            
            listsContainer.appendChild(listCard);
            
            // Attacher l'événement pour le menu
            const menuBtn = listCard.querySelector('.list-card-menu-btn');
            const menuContent = listCard.querySelector('.list-card-menu-content');
            
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menuContent.classList.toggle('active');
            });
            
            // Fermer le menu au clic en dehors
            document.addEventListener('click', (e) => {
                if (!menuBtn.contains(e.target)) {
                    menuContent.classList.remove('active');
                }
            });
        });
    },
    
    /**
     * Affiche la modal de création de liste
     */
    showCreateListModal: function() {
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('create-list-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'create-list-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Créer une liste</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="create-list-name">Nom de la liste</label>
                            <input type="text" id="create-list-name" placeholder="Nom de la liste" required>
                        </div>
                        <div class="form-group">
                            <label for="create-list-description">Description (optionnelle)</label>
                            <textarea id="create-list-description" placeholder="Description de la liste"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-create-list-btn">Annuler</button>
                        <button class="btn primary" id="submit-create-list-btn">Créer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-create-list-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Réinitialiser le formulaire
        document.getElementById('create-list-name').value = '';
        document.getElementById('create-list-description').value = '';
        
        // Afficher la modal
        document.getElementById('create-list-modal').classList.add('active');
    },
    
    /**
     * Crée une liste
     */
    createList: function() {
        const nameInput = document.getElementById('create-list-name');
        const descriptionInput = document.getElementById('create-list-description');
        
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        
        // Validation
        if (!name) {
            Utils.showNotification('Veuillez entrer un nom pour la liste', 'error');
            return;
        }
        
        // Créer la liste
        const list = {
            id: 'list_' + Date.now(),
            name: name,
            description: description,
            words: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Ajouter la liste au stockage local
        Storage.addList(list);
        
        Utils.showNotification('Liste créée avec succès', 'success');
        
        // Fermer la modal
        document.getElementById('create-list-modal').classList.remove('active');
        
        // Recharger les listes
        this.loadLists();
        
        // Ouvrir la liste créée
        this.openList(list.id);
    },
    
    /**
     * Affiche la modal d'édition de liste
     * @param {string} listId - ID de la liste à éditer
     */
    showEditListModal: function(listId) {
        // Récupérer la liste
        const list = Storage.getList(listId);
        
        if (!list) {
            Utils.showNotification('Liste introuvable', 'error');
            return;
        }
        
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('edit-list-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'edit-list-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Modifier la liste</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="edit-list-id">
                        <div class="form-group">
                            <label for="edit-list-name">Nom de la liste</label>
                            <input type="text" id="edit-list-name" placeholder="Nom de la liste" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-list-description">Description (optionnelle)</label>
                            <textarea id="edit-list-description" placeholder="Description de la liste"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-edit-list-btn">Annuler</button>
                        <button class="btn primary" id="submit-edit-list-btn">Enregistrer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-edit-list-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Remplir le formulaire
        document.getElementById('edit-list-id').value = list.id;
        document.getElementById('edit-list-name').value = list.name;
        document.getElementById('edit-list-description').value = list.description || '';
        
        // Afficher la modal
        document.getElementById('edit-list-modal').classList.add('active');
    },
    
    /**
     * Met à jour une liste
     */
    updateList: function() {
        const listId = document.getElementById('edit-list-id').value;
        const nameInput = document.getElementById('edit-list-name');
        const descriptionInput = document.getElementById('edit-list-description');
        
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        
        // Validation
        if (!name) {
            Utils.showNotification('Veuillez entrer un nom pour la liste', 'error');
            return;
        }
        
        // Mettre à jour la liste
        const updates = {
            name: name,
            description: description,
            updated_at: new Date().toISOString()
        };
        
        Storage.updateList(listId, updates);
        
        Utils.showNotification('Liste mise à jour avec succès', 'success');
        
        // Fermer la modal
        document.getElementById('edit-list-modal').classList.remove('active');
        
        // Recharger les listes
        this.loadLists();
        
        // Si la liste est ouverte, mettre à jour la vue de détail
        const listDetailView = document.getElementById('list-detail-view');
        if (listDetailView && listDetailView.dataset.listId === listId) {
            this.openList(listId);
        }
    },
    
    /**
     * Affiche la modal de confirmation de suppression de liste
     * @param {string} listId - ID de la liste à supprimer
     */
    showDeleteListConfirmModal: function(listId) {
        // Récupérer la liste
        const list = Storage.getList(listId);
        
        if (!list) {
            Utils.showNotification('Liste introuvable', 'error');
            return;
        }
        
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('delete-list-confirm-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'delete-list-confirm-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Supprimer la liste</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="delete-list-id">
                        <p>Êtes-vous sûr de vouloir supprimer la liste <strong id="delete-list-name"></strong> ?</p>
                        <p>Cette action est irréversible et supprimera tous les mots de la liste.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-delete-list-btn">Annuler</button>
                        <button class="btn danger" id="confirm-delete-list-btn">Supprimer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-delete-list-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Remplir le formulaire
        document.getElementById('delete-list-id').value = list.id;
        document.getElementById('delete-list-name').textContent = list.name;
        
        // Afficher la modal
        document.getElementById('delete-list-confirm-modal').classList.add('active');
    },
    
    /**
     * Supprime une liste
     */
    deleteList: function() {
        const listId = document.getElementById('delete-list-id').value;
        
        // Supprimer la liste
        Storage.deleteList(listId);
        
        Utils.showNotification('Liste supprimée avec succès', 'success');
        
        // Fermer la modal
        document.getElementById('delete-list-confirm-modal').classList.remove('active');
        
        // Recharger les listes
        this.loadLists();
        
        // Si la liste est ouverte, revenir à la vue des listes
        const listDetailView = document.getElementById('list-detail-view');
        if (listDetailView && listDetailView.dataset.listId === listId) {
            this.showListsView();
        }
    },
    
    /**
     * Ouvre une liste
     * @param {string} listId - ID de la liste à ouvrir
     */
    openList: function(listId) {
        // Récupérer la liste
        const list = Storage.getList(listId);
        
        if (!list) {
            Utils.showNotification('Liste introuvable', 'error');
            return;
        }
        
        // Créer la vue de détail si elle n'existe pas
        let listDetailView = document.getElementById('list-detail-view');
        
        if (!listDetailView) {
            listDetailView = document.createElement('section');
            listDetailView.id = 'list-detail-view';
            listDetailView.className = 'view';
            document.querySelector('main').appendChild(listDetailView);
        }
        
        // Stocker l'ID de la liste dans la vue
        listDetailView.dataset.listId = list.id;
        
        // Calculer les statistiques
        const totalWords = list.words ? list.words.length : 0;
        const masteredWords = list.words ? list.words.filter(word => word.status === 'mastered').length : 0;
        const learningWords = list.words ? list.words.filter(word => word.status === 'learning' || word.status === 'review').length : 0;
        const newWords = list.words ? list.words.filter(word => word.status === 'new' || !word.status).length : 0;
        
        // Remplir la vue
        listDetailView.innerHTML = `
            <div class="view-header">
                <button id="back-to-lists-btn" class="btn outline">
                    <i class="fas fa-arrow-left"></i> Retour aux listes
                </button>
                <h2>${Utils.escapeHtml(list.name)}</h2>
            </div>
            
            <div class="list-detail-header">
                <p class="list-detail-description">
                    ${list.description ? Utils.escapeHtml(list.description) : 'Aucune description'}
                </p>
                
                <div class="list-detail-stats">
                    <div class="list-detail-stat">
                        <i class="fas fa-book"></i>
                        <span>${totalWords} mot${totalWords !== 1 ? 's' : ''} au total</span>
                    </div>
                    <div class="list-detail-stat">
                        <i class="fas fa-star"></i>
                        <span>${masteredWords} mot${masteredWords !== 1 ? 's' : ''} maîtrisé${masteredWords !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="list-detail-stat">
                        <i class="fas fa-sync-alt"></i>
                        <span>${learningWords} mot${learningWords !== 1 ? 's' : ''} en cours</span>
                    </div>
                    <div class="list-detail-stat">
                        <i class="fas fa-plus"></i>
                        <span>${newWords} nouveau${newWords !== 1 ? 'x' : ''} mot${newWords !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                
                <div class="list-detail-actions">
                    <button id="start-learning-btn" class="btn primary" ${totalWords === 0 ? 'disabled' : ''}>
                        <i class="fas fa-graduation-cap"></i> Apprendre
                    </button>
                    <button class="btn secondary start-test-btn" data-test-type="true-false" ${totalWords === 0 ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Test Vrai/Faux
                    </button>
                    <button class="btn secondary start-test-btn" data-test-type="multiple-choice" ${totalWords === 0 ? 'disabled' : ''}>
                        <i class="fas fa-list"></i> Test QCM
                    </button>
                    <button class="btn secondary start-test-btn" data-test-type="writing" ${totalWords === 0 ? 'disabled' : ''}>
                        <i class="fas fa-pen"></i> Test Écriture
                    </button>
                </div>
            </div>
            
            <div class="list-detail-tabs">
                <button class="list-detail-tab active" data-tab-id="words">
                    <i class="fas fa-book"></i> Mots
                </button>
                <button class="list-detail-tab" data-tab-id="stats">
                    <i class="fas fa-chart-bar"></i> Statistiques
                </button>
            </div>
            
            <div id="words-tab" class="list-detail-tab-content active">
                <div class="add-word-form">
                    <h3>Ajouter un mot</h3>
                    <div class="add-word-inputs">
                        <input type="text" id="add-word-english" placeholder="Mot anglais" required>
                        <input type="text" id="add-word-french" placeholder="Traduction française" required>
                        <button id="add-word-btn" class="btn primary">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>
                    </div>
                </div>
                
                <div class="words-table-container">
                    ${this.generateWordsTable(list)}
                </div>
            </div>
            
            <div id="stats-tab" class="list-detail-tab-content">
                <div class="stats-container">
                    <h3>Statistiques</h3>
                    <div class="stats-content">
                        ${this.generateStatsContent(list)}
                    </div>
                </div>
            </div>
        `;
        
        // Afficher la vue
        this.showView('list-detail-view');
    },
    
    /**
     * Génère le tableau des mots
     * @param {Object} list - Liste
     * @returns {string} HTML du tableau
     */
    generateWordsTable: function(list) {
        if (!list.words || list.words.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h3>Aucun mot</h3>
                    <p>Ajoutez des mots à votre liste pour commencer à apprendre.</p>
                </div>
            `;
        }
        
        return `
            <table class="words-table">
                <thead>
                    <tr>
                        <th>Mot anglais</th>
                        <th>Traduction française</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.words.map(word => `
                        <tr>
                            <td>
                                ${Utils.escapeHtml(word.english)}
                                <button class="icon-btn" onclick="Utils.speakText('${Utils.escapeHtml(word.english)}', 'en-US')">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                            </td>
                            <td>
                                ${Utils.escapeHtml(word.french)}
                                <button class="icon-btn" onclick="Utils.speakText('${Utils.escapeHtml(word.french)}', 'fr-FR')">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                            </td>
                            <td>
                                <span class="word-status ${word.status || 'new'}">
                                    ${this.getStatusLabel(word.status)}
                                </span>
                            </td>
                            <td class="word-actions">
                                <button class="icon-btn edit-word-btn" data-word-id="${word.id}" title="Modifier">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="icon-btn delete-word-btn" data-word-id="${word.id}" title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    /**
     * Génère le contenu des statistiques
     * @param {Object} list - Liste
     * @returns {string} HTML des statistiques
     */
    generateStatsContent: function(list) {
        // Récupérer les statistiques
        const stats = Storage.getListStatistics(list.id);
        
        if (stats.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-chart-bar"></i>
                    <h3>Aucune statistique</h3>
                    <p>Commencez à apprendre et à tester vos connaissances pour voir vos statistiques.</p>
                </div>
            `;
        }
        
        // Trier les statistiques par date (plus récentes en premier)
        stats.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return `
            <div class="stats-summary">
                <div class="stats-card">
                    <h4>Score moyen</h4>
                    <div class="stats-value">
                        ${Math.round(stats.reduce((sum, stat) => sum + stat.score, 0) / stats.length)}%
                    </div>
                </div>
                <div class="stats-card">
                    <h4>Tests effectués</h4>
                    <div class="stats-value">
                        ${stats.length}
                    </div>
                </div>
                <div class="stats-card">
                    <h4>Dernier test</h4>
                    <div class="stats-value">
                        ${Utils.formatDate(stats[0].date, 'medium')}
                    </div>
                </div>
            </div>
            
            <div class="stats-history">
                <h4>Historique des tests</h4>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type de test</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map(stat => `
                            <tr>
                                <td>${Utils.formatDate(stat.date, 'datetime')}</td>
                                <td>${this.getTestTypeLabel(stat.test_type)}</td>
                                <td>${stat.score}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
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
     * Obtient le libellé d'un type de test
     * @param {string} testType - Type de test
     * @returns {string} Libellé
     */
    getTestTypeLabel: function(testType) {
        switch (testType) {
            case 'true-false':
                return 'Vrai/Faux';
            case 'multiple-choice':
                return 'QCM';
            case 'writing':
                return 'Écriture';
            default:
                return 'Inconnu';
        }
    },
    
    /**
     * Change d'onglet
     * @param {string} tabId - ID de l'onglet
     */
    switchTab: function(tabId) {
        // Mettre à jour les onglets
        const tabs = document.querySelectorAll('.list-detail-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tabId === tabId);
        });
        
        // Mettre à jour le contenu des onglets
        const tabContents = document.querySelectorAll('.list-detail-tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId + '-tab');
        });
    },
    
    /**
     * Ajoute un mot
     */
    addWord: function() {
        const listId = document.querySelector('#list-detail-view').dataset.listId;
        const englishInput = document.getElementById('add-word-english');
        const frenchInput = document.getElementById('add-word-french');
        
        const english = englishInput.value.trim();
        const french = frenchInput.value.trim();
        
        // Validation
        if (!english) {
            Utils.showNotification('Veuillez entrer le mot anglais', 'error');
            return;
        }
        
        if (!french) {
            Utils.showNotification('Veuillez entrer la traduction française', 'error');
            return;
        }
        
        // Créer le mot
        const word = {
            id: 'word_' + Date.now(),
            english: english,
            french: french,
            status: 'new',
            created_at: new Date().toISOString()
        };
        
        // Ajouter le mot à la liste
        Storage.addWord(listId, word);
        
        Utils.showNotification('Mot ajouté avec succès', 'success');
        
        // Réinitialiser le formulaire
        englishInput.value = '';
        frenchInput.value = '';
        englishInput.focus();
        
        // Mettre à jour la vue
        this.openList(listId);
    },
    
    /**
     * Affiche la modal d'édition de mot
     * @param {string} listId - ID de la liste
     * @param {string} wordId - ID du mot
     */
    showEditWordModal: function(listId, wordId) {
        // Récupérer la liste et le mot
        const list = Storage.getList(listId);
        
        if (!list || !list.words) {
            Utils.showNotification('Liste introuvable', 'error');
            return;
        }
        
        const word = list.words.find(w => w.id === wordId);
        
        if (!word) {
            Utils.showNotification('Mot introuvable', 'error');
            return;
        }
        
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('edit-word-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'edit-word-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Modifier le mot</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="edit-word-list-id">
                        <input type="hidden" id="edit-word-id">
                        <div class="form-group">
                            <label for="edit-word-english">Mot anglais</label>
                            <input type="text" id="edit-word-english" placeholder="Mot anglais" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-word-french">Traduction française</label>
                            <input type="text" id="edit-word-french" placeholder="Traduction française" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-word-status">Statut</label>
                            <select id="edit-word-status">
                                <option value="new">Nouveau</option>
                                <option value="learning">En cours</option>
                                <option value="review">À réviser</option>
                                <option value="mastered">Maîtrisé</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-edit-word-btn">Annuler</button>
                        <button class="btn primary" id="submit-edit-word-btn">Enregistrer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-edit-word-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Remplir le formulaire
        document.getElementById('edit-word-list-id').value = listId;
        document.getElementById('edit-word-id').value = word.id;
        document.getElementById('edit-word-english').value = word.english;
        document.getElementById('edit-word-french').value = word.french;
        document.getElementById('edit-word-status').value = word.status || 'new';
        
        // Afficher la modal
        document.getElementById('edit-word-modal').classList.add('active');
    },
    
    /**
     * Met à jour un mot
     */
    updateWord: function() {
        const listId = document.getElementById('edit-word-list-id').value;
        const wordId = document.getElementById('edit-word-id').value;
        const englishInput = document.getElementById('edit-word-english');
        const frenchInput = document.getElementById('edit-word-french');
        const statusSelect = document.getElementById('edit-word-status');
        
        const english = englishInput.value.trim();
        const french = frenchInput.value.trim();
        const status = statusSelect.value;
        
        // Validation
        if (!english) {
            Utils.showNotification('Veuillez entrer le mot anglais', 'error');
            return;
        }
        
        if (!french) {
            Utils.showNotification('Veuillez entrer la traduction française', 'error');
            return;
        }
        
        // Mettre à jour le mot
        const updates = {
            english: english,
            french: french,
            status: status,
            updated_at: new Date().toISOString()
        };
        
        Storage.updateWord(listId, wordId, updates);
        
        Utils.showNotification('Mot mis à jour avec succès', 'success');
        
        // Fermer la modal
        document.getElementById('edit-word-modal').classList.remove('active');
        
        // Mettre à jour la vue
        this.openList(listId);
    },
    
    /**
     * Supprime un mot
     * @param {string} listId - ID de la liste
     * @param {string} wordId - ID du mot
     */
    deleteWord: function(listId, wordId) {
        // Supprimer le mot
        Storage.deleteWord(listId, wordId);
        
        Utils.showNotification('Mot supprimé avec succès', 'success');
        
        // Mettre à jour la vue
        this.openList(listId);
    },
    
    /**
     * Affiche la vue des listes
     */
    showListsView: function() {
        App.showView('lists-view');
        App.setActiveNavItem('nav-lists');
        this.loadLists();
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

// Exporter le module Lists pour une utilisation dans d'autres fichiers
window.Lists = Lists;
