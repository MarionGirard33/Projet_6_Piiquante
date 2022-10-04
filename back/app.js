const dotenv = require('dotenv').config();
const express = require('express');
const helmet = require("helmet");
const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const path = require('path');
const rateLimit = require("express-rate-limit");
const mongoSanitize = require('express-mongo-sanitize');

const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

const app = express();

// Ajout du plugin pour gérer les erreurs de la base de données
mongoose.plugin(mongodbErrorHandler);

// Creating a limiter by calling rateLimit function with options:
// max contains the maximum number of request and windowMs 
// contains the time in millisecond so only max amount of 
// request can be made in windowMS time.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP"
});
app.use(limiter);

// Ajout du plugin Helmet qui configure des en-têtes HTTP sécurisées
app.use(helmet());

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query
app.use(mongoSanitize());

// Ajout des Headers de requête dans l'objet response pour la sécurité CORS du navigateur
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Connection à la base de données MongoDB 
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER_NAME}.k0ozame.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;