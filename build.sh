#!/bin/bash
set -e  # Arrête le script si une commande échoue

echo "Début du processus de construction..."

# Construction du frontend
echo "Construction du frontend..."
cd virtualguessr_front
npm install  # Assure que toutes les dépendances sont à jour
npm run build
cd ..

# Préparation du backend
echo "Préparation du backend..."
cd virtualguessr_back
pdm install  # Assure que toutes les dépendances sont à jour
pdm export --no-hashes -f requirements -o requirements.txt
cd ..


echo "Processus de construction terminé avec succès!"