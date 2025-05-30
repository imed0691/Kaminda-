/**
 * translation.js - Gestion des traductions
 */

const Translation = {
    /**
     * API de traduction à utiliser
     * Options: 'libretranslate', 'dictionary', 'mymemory'
     */
    API: 'mymemory',
    
    /**
     * URL de l'API LibreTranslate
     */
    LIBRETRANSLATE_API_URL: 'https://libretranslate.de/translate',
    
    /**
     * URL de l'API MyMemory
     */
    MYMEMORY_API_URL: 'https://api.mymemory.translated.net/get',
    
    /**
     * Dictionnaire local pour les mots courants
     * Utilisé comme fallback si l'API est indisponible
     */
    LOCAL_DICTIONARY: {
        "apple": "pomme",
        "book": "livre",
        "car": "voiture",
        "dog": "chien",
        "cat": "chat",
        "house": "maison",
        "tree": "arbre",
        "water": "eau",
        "food": "nourriture",
        "sun": "soleil",
        "moon": "lune",
        "star": "étoile",
        "computer": "ordinateur",
        "phone": "téléphone",
        "table": "table",
        "chair": "chaise",
        "door": "porte",
        "window": "fenêtre",
        "school": "école",
        "work": "travail",
        "friend": "ami",
        "family": "famille",
        "love": "amour",
        "time": "temps",
        "day": "jour",
        "night": "nuit",
        "year": "année",
        "month": "mois",
        "week": "semaine",
        "hour": "heure",
        "minute": "minute",
        "second": "seconde",
        "hello": "bonjour",
        "goodbye": "au revoir",
        "yes": "oui",
        "no": "non",
        "please": "s'il vous plaît",
        "thank you": "merci",
        "sorry": "désolé",
        "good": "bon",
        "bad": "mauvais",
        "big": "grand",
        "small": "petit",
        "hot": "chaud",
        "cold": "froid",
        "new": "nouveau",
        "old": "vieux",
        "young": "jeune",
        "beautiful": "beau",
        "ugly": "laid",
        "happy": "heureux",
        "sad": "triste",
        "angry": "en colère",
        "tired": "fatigué",
        "hungry": "affamé",
        "thirsty": "assoiffé"
    },
    
    /**
     * Traduit un mot ou une phrase de l'anglais vers le français
     * @param {string} text - Texte à traduire
     * @returns {Promise<string>} Traduction
     */
    translate: async function(text) {
        if (!text || text.trim() === '') {
            return Promise.reject('Texte vide');
        }
        
        // Vérifie d'abord dans le dictionnaire local
        const lowerText = text.toLowerCase().trim();
        if (this.LOCAL_DICTIONARY[lowerText]) {
            return Promise.resolve(this.LOCAL_DICTIONARY[lowerText]);
        }
        
        // Sinon, utilise l'API configurée
        switch (this.API) {
            case 'libretranslate':
                return this.translateWithLibreTranslate(text);
            case 'mymemory':
                return this.translateWithMyMemory(text);
            case 'dictionary':
                return Promise.resolve('Traduction non disponible');
            default:
                return this.translateWithMyMemory(text);
        }
    },
    
    /**
     * Traduit avec l'API LibreTranslate
     * @param {string} text - Texte à traduire
     * @returns {Promise<string>} Traduction
     */
    translateWithLibreTranslate: async function(text) {
        try {
            const response = await fetch(this.LIBRETRANSLATE_API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: 'en',
                    target: 'fr'
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            return data.translatedText;
        } catch (error) {
            console.error('Erreur de traduction avec LibreTranslate:', error);
            
            // Fallback sur le dictionnaire local ou message d'erreur
            return this.LOCAL_DICTIONARY[text.toLowerCase().trim()] || 'Erreur de traduction';
        }
    },
    
    /**
     * Traduit avec l'API MyMemory (gratuite, sans clé API)
     * @param {string} text - Texte à traduire
     * @returns {Promise<string>} Traduction
     */
    translateWithMyMemory: async function(text) {
        try {
            const url = `${this.MYMEMORY_API_URL}?q=${encodeURIComponent(text)}&langpair=en|fr`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                return data.responseData.translatedText;
            } else {
                throw new Error(data.responseDetails || 'Erreur de traduction');
            }
        } catch (error) {
            console.error('Erreur de traduction avec MyMemory:', error);
            
            // Fallback sur le dictionnaire local ou message d'erreur
            return this.LOCAL_DICTIONARY[text.toLowerCase().trim()] || 'Erreur de traduction';
        }
    },
    
    /**
     * Traduit une liste de mots
     * @param {string[]} wordsList - Liste de mots à traduire
     * @param {Function} progressCallback - Fonction de callback pour la progression
     * @returns {Promise<Array>} Liste des traductions
     */
    translateList: async function(wordsList, progressCallback = null) {
        const results = [];
        let completed = 0;
        
        for (const word of wordsList) {
            try {
                const translation = await this.translate(word);
                results.push({
                    original: word,
                    translation: translation
                });
                
                completed++;
                if (progressCallback) {
                    progressCallback(completed / wordsList.length);
                }
            } catch (error) {
                console.error(`Erreur lors de la traduction de "${word}":`, error);
                results.push({
                    original: word,
                    translation: 'Erreur de traduction'
                });
                
                completed++;
                if (progressCallback) {
                    progressCallback(completed / wordsList.length);
                }
            }
            
            // Pause pour éviter de surcharger l'API
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        return results;
    },
    
    /**
     * Détecte la langue d'un texte (simplifiée)
     * @param {string} text - Texte à analyser
     * @returns {string} Code de langue ('en' ou 'fr')
     */
    detectLanguage: function(text) {
        if (!text || text.trim() === '') {
            return 'en';
        }
        
        // Liste de mots courants en français
        const frenchWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'que', 'qui', 'quoi', 'dont', 'où', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'mon', 'ton', 'son', 'notre', 'votre', 'leur'];
        
        // Liste de mots courants en anglais
        const englishWords = ['the', 'a', 'an', 'and', 'or', 'but', 'so', 'because', 'nor', 'that', 'which', 'what', 'whose', 'where', 'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their'];
        
        // Compte les occurrences de mots français et anglais
        const words = text.toLowerCase().split(/\s+/);
        let frenchCount = 0;
        let englishCount = 0;
        
        for (const word of words) {
            const cleanWord = word.replace(/[.,;:!?()]/g, '');
            if (frenchWords.includes(cleanWord)) {
                frenchCount++;
            }
            if (englishWords.includes(cleanWord)) {
                englishCount++;
            }
        }
        
        // Détermine la langue en fonction du nombre d'occurrences
        return frenchCount > englishCount ? 'fr' : 'en';
    },
    
    /**
     * Inverse la direction de traduction si nécessaire
     * @param {string} text - Texte à traduire
     * @param {string} translation - Traduction
     * @returns {Object} Texte et traduction dans le bon ordre
     */
    ensureEnglishToFrench: function(text, translation) {
        const textLang = this.detectLanguage(text);
        
        if (textLang === 'fr') {
            // Si le texte est en français, inverse la direction
            return {
                original: translation,
                translation: text
            };
        } else {
            // Sinon, conserve la direction
            return {
                original: text,
                translation: translation
            };
        }
    }
};

// Exporte l'objet Translation pour une utilisation dans d'autres fichiers
window.Translation = Translation;
