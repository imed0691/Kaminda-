# Structure du site web AnkiPro Français

## Architecture générale
Le site sera construit comme une application web monopage (SPA) en HTML, CSS et JavaScript pur, sans framework. Toutes les données seront stockées localement dans le navigateur de l'utilisateur via localStorage.

## Structure des fichiers
```
anki_pro_fr/
├── index.html           # Page principale
├── css/
│   ├── style.css        # Styles principaux
│   ├── animations.css   # Animations pour les cartes
│   └── responsive.css   # Styles pour la responsivité
├── js/
│   ├── app.js           # Point d'entrée de l'application
│   ├── translation.js   # Gestion des traductions
│   ├── flashcards.js    # Système de cartes mémoire
│   ├── storage.js       # Gestion du stockage local
│   ├── import.js        # Import de listes de mots
│   └── utils.js         # Fonctions utilitaires
├── assets/
│   ├── icons/           # Icônes de l'interface
│   └── fonts/           # Polices personnalisées
└── data/
    └── dictionary.json  # Dictionnaire de base (optionnel)
```

## Interfaces utilisateur

### 1. Page d'accueil
- En-tête avec logo et titre "AnkiPro Français"
- Menu de navigation principal
- Section d'introduction et guide rapide
- Boutons d'accès rapide aux fonctionnalités principales

### 2. Interface de traduction individuelle
- Champ de saisie pour le mot anglais
- Bouton de traduction
- Zone d'affichage de la traduction
- Bouton pour ajouter à la liste d'apprentissage

### 3. Interface d'import de liste
- Zone de texte pour coller une liste de mots
- Option d'import de fichier
- Bouton pour traduire la liste entière
- Aperçu des traductions avec options de modification
- Bouton pour ajouter tous les mots à la liste d'apprentissage

### 4. Interface de flashcards
- Carte avec mot anglais (recto)
- Animation de retournement
- Traduction française (verso)
- Boutons d'évaluation de la mémorisation (Difficile, Bon, Facile)
- Indicateur de progression
- Compteur de mots restants

### 5. Tableau de bord d'apprentissage
- Statistiques de progression
- Liste des mots en cours d'apprentissage
- Options de filtrage et de tri
- Bouton pour démarrer une session d'apprentissage

### 6. Menu de paramètres
- Options de personnalisation
- Gestion des données (export/import/réinitialisation)
- Réglages du système de répétition espacée

## Fonctionnalités techniques

### Système de traduction
- Utilisation de l'API gratuite LibreTranslate ou dictionnaire intégré
- Cache local des traductions déjà effectuées
- Détection automatique de la langue (anglais/français)

### Système de mémorisation
- Algorithme de répétition espacée inspiré d'Anki
- Calcul dynamique des intervalles de révision
- Stockage de la progression pour chaque mot

### Stockage local
- Utilisation de localStorage pour les données utilisateur
- Structure JSON pour les mots et leur progression
- Sauvegarde automatique et option d'export

### Responsive design
- Interface adaptative pour mobile, tablette et desktop
- Disposition flexible des éléments
- Gestes tactiles pour les appareils mobiles
