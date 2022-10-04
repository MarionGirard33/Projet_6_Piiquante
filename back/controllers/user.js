const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const passwordValidator = require("password-validator");
const emailValidator = require("email-validator");


// Creation schéma pour valider le password
let passwordSchema = new passwordValidator();

// Ajout des propriétés au schéma du password
passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(30)                                  // Maximum length 30
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Azerty1', 'Azerty2', 'Passw0rd', 'Password123']); // Blacklist these values


// Création du controleur pour que l'utilisateur s'enregistre
exports.signup = (req, res, next) => {
    if (!emailValidator.validate(req.body.email)) {
        throw "L'adresse email doit être valide !"
    } else if (!passwordSchema.validate(req.body.password)) {
        throw "Le mot de passe doit avoir une longueur entre 8 et 30 caractères avec au minimum 1 chiffre, 1 minuscule et 1 majuscule, sans espace !"
    } else {
        bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
            email: req.body.email,
            password: hash
            });
            user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    }
};

// Création du controleur pour que l'utilisateur se connecte
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    } else {
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                { userId: user._id },
                                "RANDOM_TOKEN_SECRET",
                                { expiresIn: "24h"}
                            )
                        });
                    }
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};


  