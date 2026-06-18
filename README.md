# MétéoMetrics Paris - Dashboard Frontend

## Présentation du Projet
Ce dépôt contient le code source de l'interface utilisateur et du tableau de bord de **MétéoMetrics Paris**, l'outil d'analyse et de décision météorologique conçu pour les collectivités territoriales de la mairie de Paris.

Cette application web moderne permet de visualiser de manière fluide et interactive l'ensemble des données générées par le pipeline de traitement de données :
- **Suivi en temps réel :** Affichage des conditions actuelles à Paris (température, humidité, vitesse du vent, précipitations).
- **Analyses Climatologiques Historiques :** Visualisation des tendances mensuelles, des profils horaires types et des observations archivées depuis 2010.
- **Prévisions par Machine Learning :** Intégration des modèles de prévisions calculés par l'algorithme Random Forest.
- **Widget d'Assistance IA :** Intégration directe d'une interface de messagerie connectée au chatbot FastAPI pour guider la logistique urbaine en direct.

---

## Architecture des Données Frontend

L'application consomme des fichiers JSON statiques mis à jour à chaque exécution du pipeline de données du dépôt principal :
- `current.json` : Météo actuelle
- `forecast.json` & `forecast_rf.json` : Prévisions brutes et prévisions optimisées par Machine Learning
- `hourly_profile.json` : Modèle de journée type heure par heure
- `monthly_stats.json` : Moyennes et statistiques climatologiques mensuelles
- `observations.json` : Compilation des données d'observations historiques

---

## Stack Technique
- **Framework :** React 18 (TypeScript)
- **Outil de Build :** Vite
- **Design & Styles :** Tailwind CSS
- **Qualité de code :** ESLint
- **Icônes :** Lucide React

---

## Installation et Lancement de l'interface

### Prérequis
Assurez-vous d'avoir installé [Node.js](https://nodejs.org/) sur votre machine (version 18+ recommandée).

### 1. Cloner le projet
```bash
git clone [https://github.com/qevan91/Projet-fil-rouge-b3-dashboard](https://github.com/qevan91/Projet-fil-rouge-b3-dashboard)
cd Projet-fil-rouge-b3-dashboard
```

### 2. Installer les packages de dépendances
```bash
npm install
```

### 3. Exécuter l'application en mode développement
Pour lancer le serveur de build de Vite et tester l'interface localement :
```bash
npm run dev
```
Ouvrez ensuite l'adresse locale indiquée par la console (généralement `http://localhost:5173`) sur votre navigateur web.

### 4. Compiler l'application pour la production
Pour générer les fichiers HTML/CSS/JS minifiés et optimisés dans le dossier `dist` (prêt à être hébergé sur un serveur web ou GitHub Pages) :
```bash
npm run build
```

---

## Lien avec l'écosystème global
Pour que ce tableau de bord affiche des données synchronisées et que le widget IA fonctionne correctement, assurez-vous d'avoir configuré et lancé le serveur backend Python. Toutes les instructions associées sont disponibles sur le dépôt central de l'application :
[Dépôt Principal - MétéoMetrics Paris Backend](https://github.com/Wuelass/Projet-fil-rouge-b3)