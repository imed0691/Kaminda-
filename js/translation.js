/**
 * Module de traduction (version frontend uniquement)
 */
const Translation = {
    /**
     * Initialise le module de traduction
     */
    init: function() {
        this.bindEvents();
    },
    
    /**
     * Attache les gestionnaires d'événements
     */
    bindEvents: function() {
        document.addEventListener('click', function(e) {
            // Bouton pour traduire un texte
            if (e.target.id === 'translate-text-btn' || e.target.closest('#translate-text-btn')) {
                this.translateText();
            }
            
            // Bouton pour créer une liste à partir d'une traduction
            if (e.target.id === 'create-list-from-translation-btn' || e.target.closest('#create-list-from-translation-btn')) {
                this.showCreateListFromTranslationModal();
            }
            
            // Bouton pour soumettre le formulaire de création de liste à partir d'une traduction
            if (e.target.id === 'submit-create-list-from-translation-btn' || e.target.closest('#submit-create-list-from-translation-btn')) {
                this.createListFromTranslation();
            }
            
            // Bouton pour inverser les langues
            if (e.target.id === 'swap-languages-btn' || e.target.closest('#swap-languages-btn')) {
                this.swapLanguages();
            }
        }.bind(this));
        
        // Événement pour la touche Entrée dans le champ de texte
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.id === 'translate-input') {
                e.preventDefault();
                this.translateText();
            }
        }.bind(this));
    },
    
    /**
     * Traduit un texte
     */
    translateText: function() {
        const inputElement = document.getElementById('translate-input');
        const outputElement = document.getElementById('translate-output');
        const sourceLanguage = document.getElementById('source-language').value;
        const targetLanguage = document.getElementById('target-language').value;
        
        if (!inputElement || !outputElement) {
            return;
        }
        
        const text = inputElement.value.trim();
        
        if (!text) {
            Utils.showNotification('Veuillez entrer un texte à traduire', 'error');
            return;
        }
        
        // Afficher un indicateur de chargement
        outputElement.value = 'Traduction en cours...';
        
        // Simuler une traduction (dans une vraie application, on utiliserait une API de traduction)
        setTimeout(() => {
            let translatedText = '';
            
            // Traduction simplifiée pour la démo
            if (sourceLanguage === 'en' && targetLanguage === 'fr') {
                translatedText = this.translateEnglishToFrench(text);
            } else if (sourceLanguage === 'fr' && targetLanguage === 'en') {
                translatedText = this.translateFrenchToEnglish(text);
            } else {
                translatedText = text; // Même texte si les langues ne sont pas supportées
            }
            
            outputElement.value = translatedText;
            
            // Activer le bouton pour créer une liste
            const createListBtn = document.getElementById('create-list-from-translation-btn');
            if (createListBtn) {
                createListBtn.disabled = false;
            }
        }, 500);
    },
    
    /**
     * Traduit de l'anglais vers le français (simulation)
     * @param {string} text - Texte à traduire
     * @returns {string} Texte traduit
     */
    translateEnglishToFrench: function(text) {
        // Dictionnaire simplifié pour la démo
        const dictionary = {
            'hello': 'bonjour',
            'world': 'monde',
            'good': 'bon',
            'morning': 'matin',
            'evening': 'soir',
            'night': 'nuit',
            'thank you': 'merci',
            'please': 's\'il vous plaît',
            'yes': 'oui',
            'no': 'non',
            'cat': 'chat',
            'dog': 'chien',
            'house': 'maison',
            'car': 'voiture',
            'book': 'livre',
            'computer': 'ordinateur',
            'phone': 'téléphone',
            'food': 'nourriture',
            'water': 'eau',
            'friend': 'ami',
            'family': 'famille',
            'love': 'amour',
            'time': 'temps',
            'day': 'jour',
            'week': 'semaine',
            'month': 'mois',
            'year': 'année',
            'today': 'aujourd\'hui',
            'tomorrow': 'demain',
            'yesterday': 'hier',
            'language': 'langue',
            'translation': 'traduction',
            'word': 'mot',
            'sentence': 'phrase',
            'text': 'texte',
            'learn': 'apprendre',
            'study': 'étudier',
            'practice': 'pratiquer',
            'memory': 'mémoire',
            'remember': 'se souvenir',
            'forget': 'oublier',
            'test': 'test',
            'quiz': 'quiz',
            'question': 'question',
            'answer': 'réponse',
            'correct': 'correct',
            'incorrect': 'incorrect',
            'error': 'erreur',
            'success': 'succès',
            'progress': 'progrès',
            'level': 'niveau',
            'beginner': 'débutant',
            'intermediate': 'intermédiaire',
            'advanced': 'avancé',
            'expert': 'expert',
            'easy': 'facile',
            'difficult': 'difficile',
            'hard': 'dur',
            'simple': 'simple',
            'complex': 'complexe'
        };
        
        // Diviser le texte en mots
        const words = text.toLowerCase().split(/\s+/);
        
        // Traduire chaque mot
        const translatedWords = words.map(word => {
            // Nettoyer le mot (enlever la ponctuation)
            const cleanWord = word.replace(/[.,;:!?'"()[\]{}]/g, '');
            
            // Vérifier si le mot est dans le dictionnaire
            if (dictionary[cleanWord]) {
                // Préserver la ponctuation
                return word.replace(cleanWord, dictionary[cleanWord]);
            }
            
            // Si le mot n'est pas dans le dictionnaire, le laisser tel quel
            return word;
        });
        
        // Rejoindre les mots traduits
        return translatedWords.join(' ');
    },
    
    /**
     * Traduit du français vers l'anglais (simulation)
     * @param {string} text - Texte à traduire
     * @returns {string} Texte traduit
     */
    translateFrenchToEnglish: function(text) {
        // Dictionnaire simplifié pour la démo (inverse du dictionnaire anglais-français)
        const dictionary = {
            'bonjour': 'hello',
            'monde': 'world',
            'bon': 'good',
            'matin': 'morning',
            'soir': 'evening',
            'nuit': 'night',
            'merci': 'thank you',
            's\'il vous plaît': 'please',
            'oui': 'yes',
            'non': 'no',
            'chat': 'cat',
            'chien': 'dog',
            'maison': 'house',
            'voiture': 'car',
            'livre': 'book',
            'ordinateur': 'computer',
            'téléphone': 'phone',
            'nourriture': 'food',
            'eau': 'water',
            'ami': 'friend',
            'famille': 'family',
            'amour': 'love',
            'temps': 'time',
            'jour': 'day',
            'semaine': 'week',
            'mois': 'month',
            'année': 'year',
            'aujourd\'hui': 'today',
            'demain': 'tomorrow',
            'hier': 'yesterday',
            'langue': 'language',
            'traduction': 'translation',
            'mot': 'word',
            'phrase': 'sentence',
            'texte': 'text',
            'apprendre': 'learn',
            'étudier': 'study',
            'pratiquer': 'practice',
            'mémoire': 'memory',
            'se souvenir': 'remember',
            'oublier': 'forget',
            'test': 'test',
            'quiz': 'quiz',
            'question': 'question',
            'réponse': 'answer',
            'correct': 'correct',
            'incorrect': 'incorrect',
            'erreur': 'error',
            'succès': 'success',
            'progrès': 'progress',
            'niveau': 'level',
            'débutant': 'beginner',
            'intermédiaire': 'intermediate',
            'avancé': 'advanced',
            'expert': 'expert',
            'facile': 'easy',
            'difficile': 'difficult',
            'dur': 'hard',
            'simple': 'simple',
            'complexe': 'complex'
        };
        
        // Diviser le texte en mots
        const words = text.toLowerCase().split(/\s+/);
        
        // Traduire chaque mot
        const translatedWords = words.map(word => {
            // Nettoyer le mot (enlever la ponctuation)
            const cleanWord = word.replace(/[.,;:!?'"()[\]{}]/g, '');
            
            // Vérifier si le mot est dans le dictionnaire
            if (dictionary[cleanWord]) {
                // Préserver la ponctuation
                return word.replace(cleanWord, dictionary[cleanWord]);
            }
            
            // Si le mot n'est pas dans le dictionnaire, le laisser tel quel
            return word;
        });
        
        // Rejoindre les mots traduits
        return translatedWords.join(' ');
    },
    
    /**
     * Inverse les langues source et cible
     */
    swapLanguages: function() {
        const sourceLanguage = document.getElementById('source-language');
        const targetLanguage = document.getElementById('target-language');
        const inputElement = document.getElementById('translate-input');
        const outputElement = document.getElementById('translate-output');
        
        if (!sourceLanguage || !targetLanguage || !inputElement || !outputElement) {
            return;
        }
        
        // Échanger les langues
        const tempLanguage = sourceLanguage.value;
        sourceLanguage.value = targetLanguage.value;
        targetLanguage.value = tempLanguage;
        
        // Échanger les textes
        const tempText = inputElement.value;
        inputElement.value = outputElement.value;
        outputElement.value = tempText;
    },
    
    /**
     * Affiche la modal de création de liste à partir d'une traduction
     */
    showCreateListFromTranslationModal: function() {
        const inputElement = document.getElementById('translate-input');
        const outputElement = document.getElementById('translate-output');
        const sourceLanguage = document.getElementById('source-language').value;
        const targetLanguage = document.getElementById('target-language').value;
        
        if (!inputElement || !outputElement) {
            return;
        }
        
        const sourceText = inputElement.value.trim();
        const targetText = outputElement.value.trim();
        
        if (!sourceText || !targetText) {
            Utils.showNotification('Veuillez d\'abord traduire un texte', 'error');
            return;
        }
        
        // Extraire les paires de mots
        const wordPairs = this.extractWordPairs(sourceText, targetText, sourceLanguage, targetLanguage);
        
        if (wordPairs.length === 0) {
            Utils.showNotification('Impossible d\'extraire des paires de mots', 'error');
            return;
        }
        
        // Créer la modal si elle n'existe pas
        if (!document.getElementById('create-list-from-translation-modal')) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'create-list-from-translation-modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Créer une liste à partir de la traduction</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="translation-list-name">Nom de la liste</label>
                            <input type="text" id="translation-list-name" placeholder="Nom de la liste" required>
                        </div>
                        <div class="form-group">
                            <label for="translation-list-description">Description (optionnelle)</label>
                            <textarea id="translation-list-description" placeholder="Description de la liste"></textarea>
                        </div>
                        <div class="translation-word-pairs">
                            <h4>Paires de mots</h4>
                            <div id="translation-word-pairs-container"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn secondary" id="cancel-create-list-from-translation-btn">Annuler</button>
                        <button class="btn primary" id="submit-create-list-from-translation-btn">Créer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Attacher les événements
            modal.querySelector('.close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            document.getElementById('cancel-create-list-from-translation-btn').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        // Remplir le conteneur de paires de mots
        const container = document.getElementById('translation-word-pairs-container');
        container.innerHTML = '';
        
        wordPairs.forEach((pair, index) => {
            const pairElement = document.createElement('div');
            pairElement.className = 'translation-word-pair';
            
            pairElement.innerHTML = `
                <div class="translation-word-pair-inputs">
                    <input type="text" class="translation-word-english" value="${Utils.escapeHtml(pair.english)}" data-index="${index}">
                    <input type="text" class="translation-word-french" value="${Utils.escapeHtml(pair.french)}" data-index="${index}">
                </div>
                <button class="icon-btn translation-word-pair-remove" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(pairElement);
            
            // Attacher l'événement pour supprimer la paire
            pairElement.querySelector('.translation-word-pair-remove').addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                pairElement.remove();
                
                // Mettre à jour les indices
                const pairs = container.querySelectorAll('.translation-word-pair');
                pairs.forEach((pair, newIndex) => {
                    pair.querySelector('.translation-word-english').dataset.index = newIndex;
                    pair.querySelector('.translation-word-french').dataset.index = newIndex;
                    pair.querySelector('.translation-word-pair-remove').dataset.index = newIndex;
                });
            });
        });
        
        // Afficher la modal
        document.getElementById('create-list-from-translation-modal').classList.add('active');
    },
    
    /**
     * Extrait les paires de mots à partir des textes source et cible
     * @param {string} sourceText - Texte source
     * @param {string} targetText - Texte cible
     * @param {string} sourceLanguage - Langue source
     * @param {string} targetLanguage - Langue cible
     * @returns {Array} Paires de mots
     */
    extractWordPairs: function(sourceText, targetText, sourceLanguage, targetLanguage) {
        // Diviser les textes en mots
        const sourceWords = sourceText.split(/\s+/);
        const targetWords = targetText.split(/\s+/);
        
        // Si les nombres de mots sont très différents, utiliser une approche simplifiée
        if (Math.abs(sourceWords.length - targetWords.length) > 5) {
            return this.extractWordPairsSimple(sourceText, targetText, sourceLanguage, targetLanguage);
        }
        
        // Créer les paires de mots
        const pairs = [];
        
        // Limiter au plus petit nombre de mots
        const minLength = Math.min(sourceWords.length, targetWords.length);
        
        for (let i = 0; i < minLength; i++) {
            // Nettoyer les mots (enlever la ponctuation)
            const sourceWord = sourceWords[i].replace(/[.,;:!?'"()[\]{}]/g, '');
            const targetWord = targetWords[i].replace(/[.,;:!?'"()[\]{}]/g, '');
            
            // Ignorer les mots vides
            if (sourceWord && targetWord) {
                const pair = {
                    english: sourceLanguage === 'en' ? sourceWord : targetWord,
                    french: sourceLanguage === 'fr' ? sourceWord : targetWord
                };
                
                pairs.push(pair);
            }
        }
        
        return pairs;
    },
    
    /**
     * Extrait les paires de mots à partir des textes source et cible (approche simplifiée)
     * @param {string} sourceText - Texte source
     * @param {string} targetText - Texte cible
     * @param {string} sourceLanguage - Langue source
     * @param {string} targetLanguage - Langue cible
     * @returns {Array} Paires de mots
     */
    extractWordPairsSimple: function(sourceText, targetText, sourceLanguage, targetLanguage) {
        // Utiliser le dictionnaire pour extraire les paires de mots
        const dictionary = sourceLanguage === 'en' ? {
            'hello': 'bonjour',
            'world': 'monde',
            'good': 'bon',
            'morning': 'matin',
            'evening': 'soir',
            'night': 'nuit',
            'thank you': 'merci',
            'please': 's\'il vous plaît',
            'yes': 'oui',
            'no': 'non',
            'cat': 'chat',
            'dog': 'chien',
            'house': 'maison',
            'car': 'voiture',
            'book': 'livre',
            'computer': 'ordinateur',
            'phone': 'téléphone',
            'food': 'nourriture',
            'water': 'eau',
            'friend': 'ami',
            'family': 'famille',
            'love': 'amour',
            'time': 'temps',
            'day': 'jour',
            'week': 'semaine',
            'month': 'mois',
            'year': 'année',
            'today': 'aujourd\'hui',
            'tomorrow': 'demain',
            'yesterday': 'hier',
            'language': 'langue',
            'translation': 'traduction',
            'word': 'mot',
            'sentence': 'phrase',
            'text': 'texte',
            'learn': 'apprendre',
            'study': 'étudier',
            'practice': 'pratiquer',
            'memory': 'mémoire',
            'remember': 'se souvenir',
            'forget': 'oublier',
            'test': 'test',
            'quiz': 'quiz',
            'question': 'question',
            'answer': 'réponse',
            'correct': 'correct',
            'incorrect': 'incorrect',
            'error': 'erreur',
            'success': 'succès',
            'progress': 'progrès',
            'level': 'niveau',
            'beginner': 'débutant',
            'intermediate': 'intermédiaire',
            'advanced': 'avancé',
            'expert': 'expert',
            'easy': 'facile',
            'difficult': 'difficile',
            'hard': 'dur',
            'simple': 'simple',
            'complex': 'complexe'
        } : {
            'bonjour': 'hello',
            'monde': 'world',
            'bon': 'good',
            'matin': 'morning',
            'soir': 'evening',
            'nuit': 'night',
            'merci': 'thank you',
            's\'il vous plaît': 'please',
            'oui': 'yes',
            'non': 'no',
            'chat': 'cat',
            'chien': 'dog',
            'maison': 'house',
            'voiture': 'car',
            'livre': 'book',
            'ordinateur': 'computer',
            'téléphone': 'phone',
            'nourriture': 'food',
            'eau': 'water',
            'ami': 'friend',
            'famille': 'family',
            'amour': 'love',
            'temps': 'time',
            'jour': 'day',
            'semaine': 'week',
            'mois': 'month',
            'année': 'year',
            'aujourd\'hui': 'today',
            'demain': 'tomorrow',
            'hier': 'yesterday',
            'langue': 'language',
            'traduction': 'translation',
            'mot': 'word',
            'phrase': 'sentence',
            'texte': 'text',
            'apprendre': 'learn',
            'étudier': 'study',
            'pratiquer': 'practice',
            'mémoire': 'memory',
            'se souvenir': 'remember',
            'oublier': 'forget',
            'test': 'test',
            'quiz': 'quiz',
            'question': 'question',
            'réponse': 'answer',
            'correct': 'correct',
            'incorrect': 'incorrect',
            'erreur': 'error',
            'succès': 'success',
            'progrès': 'progress',
            'niveau': 'level',
            'débutant': 'beginner',
            'intermédiaire': 'intermediate',
            'avancé': 'advanced',
            'expert': 'expert',
            'facile': 'easy',
            'difficile': 'difficult',
            'dur': 'hard',
            'simple': 'simple',
            'complexe': 'complex'
        };
        
        // Diviser le texte source en mots
        const sourceWords = sourceText.toLowerCase().split(/\s+/);
        
        // Créer les paires de mots
        const pairs = [];
        
        sourceWords.forEach(word => {
            // Nettoyer le mot (enlever la ponctuation)
            const cleanWord = word.replace(/[.,;:!?'"()[\]{}]/g, '');
            
            // Vérifier si le mot est dans le dictionnaire
            if (cleanWord && dictionary[cleanWord]) {
                const pair = {
                    english: sourceLanguage === 'en' ? cleanWord : dictionary[cleanWord],
                    french: sourceLanguage === 'fr' ? cleanWord : dictionary[cleanWord]
                };
                
                // Éviter les doublons
                if (!pairs.some(p => p.english === pair.english && p.french === pair.french)) {
                    pairs.push(pair);
                }
            }
        });
        
        return pairs;
    },
    
    /**
     * Crée une liste à partir d'une traduction
     */
    createListFromTranslation: function() {
        const nameInput = document.getElementById('translation-list-name');
        const descriptionInput = document.getElementById('translation-list-description');
        
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        
        // Validation
        if (!name) {
            Utils.showNotification('Veuillez entrer un nom pour la liste', 'error');
            return;
        }
        
        // Récupérer les paires de mots
        const pairs = [];
        const englishInputs = document.querySelectorAll('.translation-word-english');
        const frenchInputs = document.querySelectorAll('.translation-word-french');
        
        for (let i = 0; i < englishInputs.length; i++) {
            const english = englishInputs[i].value.trim();
            const french = frenchInputs[i].value.trim();
            
            if (english && french) {
                pairs.push({
                    english: english,
                    french: french
                });
            }
        }
        
        if (pairs.length === 0) {
            Utils.showNotification('Veuillez ajouter au moins une paire de mots', 'error');
            return;
        }
        
        // Créer la liste
        const list = {
            id: 'list_' + Date.now(),
            name: name,
            description: description,
            words: pairs.map(pair => ({
                id: 'word_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                english: pair.english,
                french: pair.french,
                status: 'new',
                created_at: new Date().toISOString()
            })),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Ajouter la liste au stockage local
        Storage.addList(list);
        
        Utils.showNotification('Liste créée avec succès', 'success');
        
        // Fermer la modal
        document.getElementById('create-list-from-translation-modal').classList.remove('active');
        
        // Rediriger vers la liste créée
        Lists.openList(list.id);
    }
};

// Exporter le module Translation pour une utilisation dans d'autres fichiers
window.Translation = Translation;
