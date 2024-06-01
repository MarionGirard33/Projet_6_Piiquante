Projet 6 OpenClassrooms Piiquante - Création d'une API

Lancement du serveur Node

- cd back
- npm install
- nodemon server

Lancement de l'API

- Se connecter à l'url : http://localhost:4200

Renseigner les variables d'environnement

- compléter un fichier .env dans le dossier back en le renseignant comme dans .env_sample avec les informations de connexion à votre cluster MongoDB

Redirection HTTP vers HTTPS

- Créer des certificats SSL dans un dossier certificats à la racine de back (https://deviloper.in/ssl-certificate-in-nodejs)
- En cas de souci avec le certificat au premier chargement de la page, essayer d'accèder à une route de l'API depuis le navigateur (exemple https://localhost:3001/api/sauces) et autoriser à poursuivre la navigation

