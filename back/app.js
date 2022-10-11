const dotenv = require('dotenv').config();
const express = require('express');
const helmet = require("helmet");
const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const path = require('path');
const rateLimit = require("express-rate-limit");
const mongoSanitize = require('express-mongo-sanitize');
const redirect = require('./middleware/redirect');
const cors = require('cors');

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

const app = express();

// Ajout du plugin pour gérer les erreurs de la base de données
mongoose.plugin(mongodbErrorHandler);

// Création d'un limiteur en appelant la fonction rateLimit avec des options :
// max contient le nombre maximum de demandes et windowMs contient le temps en millisecondes pour que seule la quantité maximale de demandes puisse être faite dans le temps de la fenêtreMS. 
const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP"
});
app.use(limiter);

// Ajout du plugin Helmet qui configure des en-têtes HTTP sécurisées
app.use(helmet({crossOriginResourcePolicy: false}));
app.use(cors());

// Par défaut, les caractères $ et . sont complètement supprimés des entrées fournies par l'utilisateur aux endroits suivants :
// - req.body
// - req.params
// - req.headers
// - req.query
app.use(mongoSanitize());

// Ajout des Headers de requête dans l'objet response pour la sécurité CORS du navigateur
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Cross-Origin-Resource-Policy", '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Connection à la base de données MongoDB 
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER_NAME}.k0ozame.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME })
.then(() => console.log('Connexion à la base de données réussie !'))
.catch(() => console.log('Connexion à la base de données échouée !'));

app.use(express.json());
app.use(redirect);

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;