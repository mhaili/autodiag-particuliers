# Auto-diagnostic Sûreté Habitation

> Outil développé par **MHAILI Majda** — **CPTM · Cellule de Prévention Technique de la Malveillance**

---

## Présentation

Application web d'auto-diagnostic permettant aux citoyens d'évaluer le niveau de sécurité de leur habitation (maison individuelle ou appartement) face aux risques d'intrusion et de cambriolage.

À l'issue du questionnaire, l'utilisateur obtient :

- un **niveau de sécurité** (Insuffisant / Moyen / Excellent) ;
- des **conseils personnalisés** selon ses réponses ;
- un **rapport PDF téléchargeable** récapitulant le diagnostic et les préconisations.

---

## Stack technique

| Technologie  
| -----------------------------------------------------
| [Vue 3](https://vuejs.org/)  
| [@gouvminint/vue-dsfr](https://vue-dsfr.netlify.app/)

---

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/GendarmerieNationale/autodiag-particuliers.git
cd Auto-diagnostic

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

---

## Build & déploiement

```bash
# Construire pour la production
npm run build

# Déployer sur GitHub Pages (branche gh-pages)
npm run deploy
```

L'application est déployée à l'adresse :
**https://GendarmerieNationale.github.io/Auto-diagnostic/**

## Données

Les questionnaires et conseils sont entièrement pilotés par des fichiers JSON dans `src/data/` — aucune base de données requise.

---

## Licence

Ce projet est publié sous la **Licence Ouverte 2.0 / Open Licence 2.0** d'Etalab.

Texte complet : https://github.com/etalab/licence-ouverte/blob/master/LO.md

**Auteur** : MHAILI Majda — Gendarmerie Nationale · CPTM
