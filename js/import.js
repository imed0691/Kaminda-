/**
 * import.js - Gestion de l'import de listes de mots
 */

const Import = {
    /**
     * État actuel de l'import
     */
    currentImport: {
        words: [],
        translations: [],
        isProcessing: false,
        progress: 0
    },
    
    /**
     * Initialise le module d'import
     */
    init: function() {
        // Réinitialise l'état
        this.resetImport();
        
        // Initialise les écouteurs d'événements
        this.initEventListeners();
    },
    
    /**
     * Initialise les écouteurs d'événements
     */
    initEventListeners: function() {
        // Écouteurs pour les options d'import
        const importOptions = document.querySelectorAll('.import-option');
        importOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Supprime la classe active de toutes les options
                importOptions.forEach(opt => opt.classList.remove('active'));
                
                // Ajoute la classe active à l'option cliquée
                option.classList.add('active');
                
                // Affiche le panneau correspondant
                const optionType = option.getAttribute('data-option');
                document.querySelectorAll('.import-panel').forEach(panel => {
                    panel.classList.remove('active');
                });
                document.getElementById(`${optionType}-option`).classList.add('active');
            });
        });
        
        // Écouteur pour l'input de fichier
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }
        
        // Écouteur pour le bouton de traduction
        const importTranslateBtn = document.getElementById('import-translate-btn');
        if (importTranslateBtn) {
            importTranslateBtn.addEventListener('click', this.handleImportTranslate.bind(this));
        }
        
        // Écouteur pour le bouton d'ajout de tous les mots
        const addAllBtn = document.getElementById('add-all-btn');
        if (addAllBtn) {
            addAllBtn.addEventListener('click', this.handleAddAllWords.bind(this));
        }
        
        // Écouteur pour le bouton de modification
        const editListBtn = document.getElementById('edit-list-btn');
        if (editListBtn) {
            editListBtn.addEventListener('click', this.handleEditList.bind(this));
        }
    },
    
    /**
     * Gère la sélection d'un fichier
     * @param {Event} event - Événement de changement
     */
    handleFileSelect: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const fileNameElement = document.querySelector('.file-name');
        if (fileNameElement) {
            fileNameElement.textContent = file.name;
        }
        
        // Lit le contenu du fichier
        Utils.readTextFile(file)
            .then(content => {
                const wordList = document.getElementById('word-list');
                if (wordList) {
                    wordList.value = content;
                }
                
                // Bascule vers l'option de collage
                const pasteOption = document.querySelector('.import-option[data-option="paste"]');
                if (pasteOption) {
                    pasteOption.click();
                }
            })
            .catch(error => {
                console.error('Erreur lors de la lecture du fichier:', error);
                Utils.showNotification('Erreur lors de la lecture du fichier.', 'error');
            });
    },
    
    /**
     * Gère la traduction de la liste importée
     */
    handleImportTranslate: async function() {
        const wordList = document.getElementById('word-list');
        if (!wordList || !wordList.value.trim()) {
            Utils.showNotification('Veuillez entrer une liste de mots.', 'error');
            return;
        }
        
        // Extrait les mots de la liste
        const words = Utils.textToWordArray(wordList.value);
        
        if (words.length === 0) {
            Utils.showNotification('Aucun mot valide trouvé.', 'error');
            return;
        }
        
        // Limite le nombre de mots à 100 pour éviter les problèmes de performance
        const limitedWords = words.slice(0, 100);
        if (words.length > 100) {
            Utils.showNotification('La liste a été limitée à 100 mots.', 'info');
        }
        
        // Met à jour l'état
        this.currentImport.words = limitedWords;
        this.currentImport.isProcessing = true;
        this.currentImport.progress = 0;
        
        // Affiche un indicateur de chargement
        const importTranslateBtn = document.getElementById('import-translate-btn');
        if (importTranslateBtn) {
            importTranslateBtn.disabled = true;
            importTranslateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traduction en cours...';
        }
        
        try {
            // Traduit la liste de mots
            const translations = await Translation.translateList(limitedWords, progress => {
                this.currentImport.progress = progress;
                this.updateProgressUI(progress);
            });
            
            // Met à jour l'état
            this.currentImport.translations = translations;
            this.currentImport.isProcessing = false;
            
            // Affiche les résultats
            this.displayTranslationResults(translations);
            
            Utils.showNotification('Traduction terminée.', 'success');
        } catch (error) {
            console.error('Erreur lors de la traduction de la liste:', error);
            Utils.showNotification('Erreur lors de la traduction de la liste.', 'error');
            
            this.currentImport.isProcessing = false;
        } finally {
            // Réinitialise le bouton
            if (importTranslateBtn) {
                importTranslateBtn.disabled = false;
                importTranslateBtn.innerHTML = 'Traduire la liste';
            }
        }
    },
    
    /**
     * Met à jour l'interface utilisateur avec la progression
     * @param {number} progress - Progression (0-1)
     */
    updateProgressUI: function(progress) {
        const importTranslateBtn = document.getElementById('import-translate-btn');
        if (importTranslateBtn) {
            const percent = Math.round(progress * 100);
            importTranslateBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Traduction en cours... ${percent}%`;
        }
    },
    
    /**
     * Affiche les résultats de traduction
     * @param {Array} translations - Liste des traductions
     */
    displayTranslationResults: function(translations) {
        const resultsBody = document.getElementById('results-body');
        if (!resultsBody) return;
        
        // Vide le tableau
        resultsBody.innerHTML = '';
        
        // Ajoute chaque traduction au tableau
        translations.forEach((item, index) => {
            const row = document.createElement('tr');
            
            // Cellule pour le mot original
            const originalCell = document.createElement('td');
            originalCell.textContent = item.original;
            row.appendChild(originalCell);
            
            // Cellule pour la traduction
            const translationCell = document.createElement('td');
            translationCell.textContent = item.translation;
            row.appendChild(translationCell);
            
            // Cellule pour les actions
            const actionsCell = document.createElement('td');
            actionsCell.className = 'table-actions';
            
            // Bouton d'édition
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.title = 'Modifier';
            editButton.addEventListener('click', () => this.editTranslation(index));
            actionsCell.appendChild(editButton);
            
            // Bouton de suppression
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.title = 'Supprimer';
            deleteButton.addEventListener('click', () => this.deleteTranslation(index));
            actionsCell.appendChild(deleteButton);
            
            row.appendChild(actionsCell);
            
            resultsBody.appendChild(row);
        });
        
        // Affiche la section des résultats
        const importResults = document.querySelector('.import-results');
        if (importResults) {
            importResults.classList.remove('hidden');
        }
    },
    
    /**
     * Édite une traduction
     * @param {number} index - Index de la traduction à éditer
     */
    editTranslation: function(index) {
        const translation = this.currentImport.translations[index];
        if (!translation) return;
        
        // Demande la nouvelle traduction
        const newTranslation = prompt('Modifier la traduction:', translation.translation);
        
        if (newTranslation !== null && newTranslation.trim() !== '') {
            // Met à jour la traduction
            this.currentImport.translations[index].translation = newTranslation.trim();
            
            // Met à jour l'affichage
            this.displayTranslationResults(this.currentImport.translations);
        }
    },
    
    /**
     * Supprime une traduction
     * @param {number} index - Index de la traduction à supprimer
     */
    deleteTranslation: function(index) {
        if (index < 0 || index >= this.currentImport.translations.length) return;
        
        // Supprime la traduction
        this.currentImport.translations.splice(index, 1);
        
        // Met à jour l'affichage
        this.displayTranslationResults(this.currentImport.translations);
        
        // Si la liste est vide, cache la section des résultats
        if (this.currentImport.translations.length === 0) {
            const importResults = document.querySelector('.import-results');
            if (importResults) {
                importResults.classList.add('hidden');
            }
        }
    },
    
    /**
     * Gère l'ajout de tous les mots à la liste d'apprentissage
     */
    handleAddAllWords: function() {
        if (this.currentImport.translations.length === 0) {
            Utils.showNotification('Aucun mot à ajouter.', 'error');
            return;
        }
        
        // Ajoute tous les mots
        const success = Storage.addMultipleWords(this.currentImport.translations);
        
        if (success) {
            // Réinitialise l'import
            this.resetImport();
            
            // Cache la section des résultats
            const importResults = document.querySelector('.import-results');
            if (importResults) {
                importResults.classList.add('hidden');
            }
            
            // Vide la zone de texte
            const wordList = document.getElementById('word-list');
            if (wordList) {
                wordList.value = '';
            }
            
            Utils.showNotification('Tous les mots ont été ajoutés à votre liste d\'apprentissage.', 'success');
        }
    },
    
    /**
     * Gère la modification de la liste
     */
    handleEditList: function() {
        // Bascule vers l'option de collage
        const pasteOption = document.querySelector('.import-option[data-option="paste"]');
        if (pasteOption) {
            pasteOption.click();
        }
        
        // Remplit la zone de texte avec les mots originaux
        const wordList = document.getElementById('word-list');
        if (wordList) {
            wordList.value = this.currentImport.words.join('\n');
        }
        
        // Cache la section des résultats
        const importResults = document.querySelector('.import-results');
        if (importResults) {
            importResults.classList.add('hidden');
        }
    },
    
    /**
     * Réinitialise l'état de l'import
     */
    resetImport: function() {
        this.currentImport = {
            words: [],
            translations: [],
            isProcessing: false,
            progress: 0
        };
    }
};

// Exporte l'objet Import pour une utilisation dans d'autres fichiers
window.Import = Import;
