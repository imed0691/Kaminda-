/**
 * Module de tests (version frontend uniquement)
 */
const Tests = {
    /**
     * Liste en cours de test
     */
    currentList: null,
    
    /**
     * Type de test en cours
     */
    currentTestType: null,
    
    /**
     * Questions du test en cours
     */
    questions: [],
    
    /**
     * Index de la question actuelle
     */
    currentQuestionIndex: 0,
    
    /**
     * Réponses de l'utilisateur
     */
    userAnswers: [],
    
    /**
     * Initialise le module de tests
     */
    init: function() {
        this.bindEvents();
    },
    
    /**
     * Attache les gestionnaires d'événements
     */
    bindEvents: function() {
        document.addEventListener('click', function(e) {
            // Bouton pour soumettre une réponse
            if (e.target.id === 'submit-answer-btn' || e.target.closest('#submit-answer-btn')) {
                this.submitAnswer();
            }
            
            // Bouton pour passer à la question suivante
            if (e.target.id === 'next-question-btn' || e.target.closest('#next-question-btn')) {
                this.nextQuestion();
            }
            
            // Bouton pour terminer le test
            if (e.target.id === 'finish-test-btn' || e.target.closest('#finish-test-btn')) {
                this.finishTest();
            }
            
            // Bouton pour revenir à la liste
            if (e.target.id === 'back-to-list-btn' || e.target.closest('#back-to-list-btn')) {
                this.backToList();
            }
            
            // Options de réponse pour les tests vrai/faux et QCM
            if (e.target.classList.contains('test-option') || e.target.closest('.test-option')) {
                const option = e.target.classList.contains('test-option') ? e.target : e.target.closest('.test-option');
                this.selectOption(option);
            }
        }.bind(this));
    },
    
    /**
     * Démarre un test
     * @param {Object} list - Liste à tester
     * @param {string} testType - Type de test (true-false, multiple-choice, writing)
     */
    startTest: function(list, testType) {
        // Vérifier que la liste contient des mots
        if (!list.words || list.words.length === 0) {
            Utils.showNotification('La liste ne contient aucun mot', 'error');
            return;
        }
        
        // Stocker la liste et le type de test
        this.currentList = list;
        this.currentTestType = testType;
        
        // Générer les questions
        this.generateQuestions();
        
        // Réinitialiser les réponses et l'index de question
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        
        // Créer la vue de test si elle n'existe pas
        let testView = document.getElementById('test-view');
        
        if (!testView) {
            testView = document.createElement('section');
            testView.id = 'test-view';
            testView.className = 'view';
            document.querySelector('main').appendChild(testView);
        }
        
        // Afficher la vue de test
        this.showView('test-view');
        
        // Afficher la première question
        this.displayCurrentQuestion();
    },
    
    /**
     * Génère les questions du test
     */
    generateQuestions: function() {
        // Copier et mélanger les mots
        const words = [...this.currentList.words];
        Utils.shuffleArray(words);
        
        // Limiter le nombre de questions (maximum 20)
        const numQuestions = Math.min(words.length, 20);
        const selectedWords = words.slice(0, numQuestions);
        
        // Générer les questions en fonction du type de test
        this.questions = selectedWords.map(word => {
            const question = {
                word: word,
                correct: null,
                options: null
            };
            
            // 50% de chance de tester anglais -> français ou français -> anglais
            const direction = Math.random() < 0.5 ? 'en_to_fr' : 'fr_to_en';
            
            if (direction === 'en_to_fr') {
                question.prompt = word.english;
                question.answer = word.french;
                question.direction = 'en_to_fr';
            } else {
                question.prompt = word.french;
                question.answer = word.english;
                question.direction = 'fr_to_en';
            }
            
            // Générer les options pour les tests à choix multiples
            if (this.currentTestType === 'multiple-choice') {
                // Trouver des options incorrectes
                const incorrectOptions = this.getIncorrectOptions(word, direction, words);
                
                // Ajouter la réponse correcte et mélanger
                const options = [...incorrectOptions, question.answer];
                Utils.shuffleArray(options);
                
                question.options = options;
            } else if (this.currentTestType === 'true-false') {
                // Pour les tests vrai/faux, 50% de chance d'avoir une réponse correcte ou incorrecte
                const isCorrect = Math.random() < 0.5;
                
                if (isCorrect) {
                    // La réponse proposée est correcte
                    question.proposed = question.answer;
                    question.correct = true;
                } else {
                    // La réponse proposée est incorrecte
                    const incorrectOptions = this.getIncorrectOptions(word, direction, words);
                    question.proposed = incorrectOptions[0];
                    question.correct = false;
                }
            }
            
            return question;
        });
    },
    
    /**
     * Obtient des options incorrectes pour les tests à choix multiples
     * @param {Object} word - Mot pour lequel générer des options incorrectes
     * @param {string} direction - Direction de la traduction (en_to_fr ou fr_to_en)
     * @param {Array} allWords - Tous les mots disponibles
     * @returns {Array} Options incorrectes
     */
    getIncorrectOptions: function(word, direction, allWords) {
        // Filtrer les mots pour exclure le mot actuel
        const otherWords = allWords.filter(w => w.id !== word.id);
        
        // Mélanger les mots
        Utils.shuffleArray(otherWords);
        
        // Prendre les 3 premiers mots comme options incorrectes
        const incorrectWords = otherWords.slice(0, 3);
        
        // Extraire les traductions en fonction de la direction
        return incorrectWords.map(w => direction === 'en_to_fr' ? w.french : w.english);
    },
    
    /**
     * Affiche la question actuelle
     */
    displayCurrentQuestion: function() {
        const question = this.questions[this.currentQuestionIndex];
        const testView = document.getElementById('test-view');
        
        // Déterminer le titre en fonction de la direction
        const directionTitle = question.direction === 'en_to_fr' 
            ? 'Traduisez en français' 
            : 'Traduisez en anglais';
        
        // Construire le contenu en fonction du type de test
        let content = `
            <div class="view-header">
                <h2>Test - ${this.getTestTypeLabel()}</h2>
                <div class="test-progress">
                    Question ${this.currentQuestionIndex + 1}/${this.questions.length}
                </div>
            </div>
            
            <div class="test-container">
                <div class="test-question">
                    <h3>${directionTitle}</h3>
                    <div class="test-prompt">
                        ${Utils.escapeHtml(question.prompt)}
                        <button class="icon-btn" onclick="Utils.speakText('${Utils.escapeHtml(question.prompt)}', '${question.direction === 'en_to_fr' ? 'en-US' : 'fr-FR'}')">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
        `;
        
        // Ajouter le contenu spécifique au type de test
        if (this.currentTestType === 'true-false') {
            content += `
                <div class="test-true-false">
                    <p>La traduction est-elle correcte ?</p>
                    <div class="test-proposed-answer">
                        ${Utils.escapeHtml(question.proposed)}
                    </div>
                    <div class="test-options">
                        <button class="test-option" data-value="true">
                            <i class="fas fa-check"></i> Vrai
                        </button>
                        <button class="test-option" data-value="false">
                            <i class="fas fa-times"></i> Faux
                        </button>
                    </div>
                </div>
            `;
        } else if (this.currentTestType === 'multiple-choice') {
            content += `
                <div class="test-multiple-choice">
                    <div class="test-options">
                        ${question.options.map((option, index) => `
                            <button class="test-option" data-value="${index}">
                                ${Utils.escapeHtml(option)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (this.currentTestType === 'writing') {
            content += `
                <div class="test-writing">
                    <div class="form-group">
                        <input type="text" id="test-writing-input" placeholder="Votre réponse" autocomplete="off">
                    </div>
                    <button id="submit-answer-btn" class="btn primary">
                        <i class="fas fa-check"></i> Vérifier
                    </button>
                </div>
            `;
        }
        
        content += `
                </div>
            </div>
        `;
        
        // Mettre à jour la vue
        testView.innerHTML = content;
        
        // Focus sur le champ de saisie pour les tests d'écriture
        if (this.currentTestType === 'writing') {
            setTimeout(() => {
                const input = document.getElementById('test-writing-input');
                if (input) {
                    input.focus();
                    
                    // Ajouter l'événement pour soumettre avec Enter
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            this.submitAnswer();
                        }
                    });
                }
            }, 100);
        }
    },
    
    /**
     * Sélectionne une option (pour les tests vrai/faux et QCM)
     * @param {Element} option - Option sélectionnée
     */
    selectOption: function(option) {
        // Désélectionner toutes les options
        const options = document.querySelectorAll('.test-option');
        options.forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Sélectionner l'option cliquée
        option.classList.add('selected');
        
        // Soumettre automatiquement après un court délai
        setTimeout(() => {
            this.submitAnswer();
        }, 500);
    },
    
    /**
     * Soumet la réponse de l'utilisateur
     */
    submitAnswer: function() {
        const question = this.questions[this.currentQuestionIndex];
        let userAnswer = null;
        let isCorrect = false;
        
        // Récupérer la réponse en fonction du type de test
        if (this.currentTestType === 'true-false') {
            const selectedOption = document.querySelector('.test-option.selected');
            
            if (!selectedOption) {
                Utils.showNotification('Veuillez sélectionner une réponse', 'error');
                return;
            }
            
            userAnswer = selectedOption.dataset.value === 'true';
            isCorrect = userAnswer === question.correct;
        } else if (this.currentTestType === 'multiple-choice') {
            const selectedOption = document.querySelector('.test-option.selected');
            
            if (!selectedOption) {
                Utils.showNotification('Veuillez sélectionner une réponse', 'error');
                return;
            }
            
            const optionIndex = parseInt(selectedOption.dataset.value);
            userAnswer = question.options[optionIndex];
            isCorrect = userAnswer === question.answer;
        } else if (this.currentTestType === 'writing') {
            const input = document.getElementById('test-writing-input');
            
            if (!input || !input.value.trim()) {
                Utils.showNotification('Veuillez entrer une réponse', 'error');
                return;
            }
            
            userAnswer = input.value.trim();
            
            // Pour l'écriture, on accepte une réponse si elle est suffisamment proche
            // (ignorer la casse, les accents, la ponctuation, etc.)
            isCorrect = this.checkWritingAnswer(userAnswer, question.answer);
        }
        
        // Enregistrer la réponse
        this.userAnswers.push({
            questionIndex: this.currentQuestionIndex,
            userAnswer: userAnswer,
            isCorrect: isCorrect
        });
        
        // Afficher le résultat
        this.displayAnswerResult(isCorrect, question);
    },
    
    /**
     * Vérifie si une réponse écrite est correcte
     * @param {string} userAnswer - Réponse de l'utilisateur
     * @param {string} correctAnswer - Réponse correcte
     * @returns {boolean} Vrai si la réponse est correcte
     */
    checkWritingAnswer: function(userAnswer, correctAnswer) {
        // Normaliser les réponses (supprimer les accents, mettre en minuscules, etc.)
        const normalizedUserAnswer = this.normalizeText(userAnswer);
        const normalizedCorrectAnswer = this.normalizeText(correctAnswer);
        
        // Vérifier si les réponses sont identiques
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
            return true;
        }
        
        // Calculer la distance de Levenshtein (nombre minimal d'opérations pour transformer une chaîne en une autre)
        const distance = this.levenshteinDistance(normalizedUserAnswer, normalizedCorrectAnswer);
        
        // Accepter une réponse si la distance est inférieure à 20% de la longueur de la réponse correcte
        const threshold = Math.max(1, Math.floor(normalizedCorrectAnswer.length * 0.2));
        return distance <= threshold;
    },
    
    /**
     * Normalise un texte (supprime les accents, met en minuscules, etc.)
     * @param {string} text - Texte à normaliser
     * @returns {string} Texte normalisé
     */
    normalizeText: function(text) {
        return text
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
            .replace(/[.,;:!?'"()\[\]{}]/g, '') // Supprimer la ponctuation
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .trim();
    },
    
    /**
     * Calcule la distance de Levenshtein entre deux chaînes
     * @param {string} a - Première chaîne
     * @param {string} b - Deuxième chaîne
     * @returns {number} Distance de Levenshtein
     */
    levenshteinDistance: function(a, b) {
        const matrix = [];
        
        // Initialiser la matrice
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        // Remplir la matrice
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // Substitution
                        matrix[i][j - 1] + 1,     // Insertion
                        matrix[i - 1][j] + 1      // Suppression
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    },
    
    /**
     * Affiche le résultat de la réponse
     * @param {boolean} isCorrect - Vrai si la réponse est correcte
     * @param {Object} question - Question
     */
    displayAnswerResult: function(isCorrect, question) {
        const testView = document.getElementById('test-view');
        
        // Déterminer le titre en fonction de la direction
        const directionTitle = question.direction === 'en_to_fr' 
            ? 'Traduisez en français' 
            : 'Traduisez en anglais';
        
        // Construire le contenu
        let content = `
            <div class="view-header">
                <h2>Test - ${this.getTestTypeLabel()}</h2>
                <div class="test-progress">
                    Question ${this.currentQuestionIndex + 1}/${this.questions.length}
                </div>
            </div>
            
            <div class="test-container">
                <div class="test-question">
                    <h3>${directionTitle}</h3>
                    <div class="test-prompt">
                        ${Utils.escapeHtml(question.prompt)}
                        <button class="icon-btn" onclick="Utils.speakText('${Utils.escapeHtml(question.prompt)}', '${question.direction === 'en_to_fr' ? 'en-US' : 'fr-FR'}')">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                </div>
                
                <div class="test-result ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="test-result-icon">
                        <i class="fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    </div>
                    <div class="test-result-message">
                        ${isCorrect ? 'Correct !' : 'Incorrect !'}
                    </div>
                </div>
                
                <div class="test-answer">
                    <div class="test-answer-label">Réponse correcte :</div>
                    <div class="test-answer-value">
                        ${Utils.escapeHtml(question.answer)}
                        <button class="icon-btn" onclick="Utils.speakText('${Utils.escapeHtml(question.answer)}', '${question.direction === 'en_to_fr' ? 'fr-FR' : 'en-US'}')">
                            <i class="fas fa-volume-up"></i>
                        </button>
                    </div>
                </div>
        `;
        
        // Ajouter la réponse de l'utilisateur si elle est différente de la réponse correcte
        if (!isCorrect) {
            let userAnswer = '';
            
            if (this.currentTestType === 'true-false') {
                userAnswer = this.userAnswers[this.userAnswers.length - 1].userAnswer ? 'Vrai' : 'Faux';
            } else {
                userAnswer = this.userAnswers[this.userAnswers.length - 1].userAnswer;
            }
            
            content += `
                <div class="test-user-answer">
                    <div class="test-answer-label">Votre réponse :</div>
                    <div class="test-answer-value">
                        ${Utils.escapeHtml(userAnswer)}
                    </div>
                </div>
            `;
        }
        
        // Ajouter le bouton pour continuer
        content += `
                <div class="test-actions">
                    ${this.currentQuestionIndex < this.questions.length - 1
                        ? `<button id="next-question-btn" class="btn primary">
                            <i class="fas fa-arrow-right"></i> Question suivante
                        </button>`
                        : `<button id="finish-test-btn" class="btn primary">
                            <i class="fas fa-flag-checkered"></i> Terminer le test
                        </button>`
                    }
                </div>
            </div>
        `;
        
        // Mettre à jour la vue
        testView.innerHTML = content;
    },
    
    /**
     * Passe à la question suivante
     */
    nextQuestion: function() {
        // Passer à la question suivante
        this.currentQuestionIndex++;
        
        // Afficher la question
        this.displayCurrentQuestion();
    },
    
    /**
     * Termine le test et affiche les résultats
     */
    finishTest: function() {
        // Calculer le score
        const numCorrect = this.userAnswers.filter(answer => answer.isCorrect).length;
        const score = Math.round((numCorrect / this.questions.length) * 100);
        
        // Mettre à jour les statistiques
        const testStat = {
            list_id: this.currentList.id,
            test_type: this.currentTestType,
            score: score,
            num_questions: this.questions.length,
            num_correct: numCorrect,
            date: new Date().toISOString()
        };
        
        Storage.addListStatistic(this.currentList.id, testStat);
        
        // Mettre à jour le statut des mots
        this.updateWordStatuses();
        
        // Afficher les résultats
        this.displayTestResults(score);
    },
    
    /**
     * Met à jour le statut des mots en fonction des réponses
     */
    updateWordStatuses: function() {
        // Parcourir toutes les réponses
        this.userAnswers.forEach(answer => {
            const question = this.questions[answer.questionIndex];
            const word = question.word;
            
            // Mettre à jour le statut du mot en fonction de la réponse
            if (answer.isCorrect) {
                // Si la réponse est correcte, améliorer le statut
                switch (word.status) {
                    case 'new':
                        word.status = 'learning';
                        break;
                    case 'learning':
                        word.status = 'review';
                        break;
                    case 'review':
                        word.status = 'mastered';
                        break;
                }
            } else {
                // Si la réponse est incorrecte, régresser le statut
                switch (word.status) {
                    case 'mastered':
                        word.status = 'review';
                        break;
                    case 'review':
                        word.status = 'learning';
                        break;
                }
            }
            
            // Mettre à jour le mot dans la liste
            Storage.updateWord(this.currentList.id, word.id, {
                status: word.status,
                last_tested: new Date().toISOString()
            });
        });
    },
    
    /**
     * Affiche les résultats du test
     * @param {number} score - Score (pourcentage)
     */
    displayTestResults: function(score) {
        const testView = document.getElementById('test-view');
        
        // Déterminer le message en fonction du score
        let message = '';
        let icon = '';
        
        if (score >= 90) {
            message = 'Excellent !';
            icon = 'fa-trophy';
        } else if (score >= 70) {
            message = 'Très bien !';
            icon = 'fa-star';
        } else if (score >= 50) {
            message = 'Bien !';
            icon = 'fa-thumbs-up';
        } else {
            message = 'Continuez à pratiquer !';
            icon = 'fa-book';
        }
        
        // Construire le contenu
        const content = `
            <div class="view-header">
                <h2>Résultats du test</h2>
            </div>
            
            <div class="test-results-container">
                <div class="test-results-header">
                    <div class="test-results-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="test-results-message">
                        ${message}
                    </div>
                    <div class="test-results-score">
                        Score : ${score}%
                    </div>
                </div>
                
                <div class="test-results-details">
                    <div class="test-results-stat">
                        <div class="test-results-stat-label">Questions :</div>
                        <div class="test-results-stat-value">${this.questions.length}</div>
                    </div>
                    <div class="test-results-stat">
                        <div class="test-results-stat-label">Réponses correctes :</div>
                        <div class="test-results-stat-value">${this.userAnswers.filter(answer => answer.isCorrect).length}</div>
                    </div>
                    <div class="test-results-stat">
                        <div class="test-results-stat-label">Réponses incorrectes :</div>
                        <div class="test-results-stat-value">${this.userAnswers.filter(answer => !answer.isCorrect).length}</div>
                    </div>
                </div>
                
                <div class="test-results-summary">
                    <h3>Résumé des réponses</h3>
                    <div class="test-results-answers">
                        ${this.userAnswers.map((answer, index) => {
                            const question = this.questions[answer.questionIndex];
                            return `
                                <div class="test-results-answer ${answer.isCorrect ? 'correct' : 'incorrect'}">
                                    <div class="test-results-answer-number">${index + 1}</div>
                                    <div class="test-results-answer-content">
                                        <div class="test-results-answer-prompt">${Utils.escapeHtml(question.prompt)}</div>
                                        <div class="test-results-answer-correct">${Utils.escapeHtml(question.answer)}</div>
                                        ${!answer.isCorrect ? `
                                            <div class="test-results-answer-user">${Utils.escapeHtml(answer.userAnswer)}</div>
                                        ` : ''}
                                    </div>
                                    <div class="test-results-answer-icon">
                                        <i class="fas ${answer.isCorrect ? 'fa-check' : 'fa-times'}"></i>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="test-results-actions">
                    <button id="back-to-list-btn" class="btn primary">
                        <i class="fas fa-arrow-left"></i> Retour à la liste
                    </button>
                </div>
            </div>
        `;
        
        // Mettre à jour la vue
        testView.innerHTML = content;
    },
    
    /**
     * Retourne à la liste
     */
    backToList: function() {
        // Réinitialiser les variables
        this.currentList = null;
        this.currentTestType = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        
        // Revenir à la vue de la liste
        Lists.showListsView();
    },
    
    /**
     * Obtient le libellé du type de test
     * @returns {string} Libellé
     */
    getTestTypeLabel: function() {
        switch (this.currentTestType) {
            case 'true-false':
                return 'Vrai/Faux';
            case 'multiple-choice':
                return 'QCM';
            case 'writing':
                return 'Écriture';
            default:
                return 'Test';
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

// Exporter le module Tests pour une utilisation dans d'autres fichiers
window.Tests = Tests;
