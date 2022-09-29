const Sauce = require("../models/Sauce");
const fs = require("fs");

// Créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    // Nouvelle instance de la classe sauce
    const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [" "],
    usersDisliked: [" "]
    });

    sauce.save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée!"}))
        .catch(error => res.status(400).json({ error }));
};

// Voir toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// Voir une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// MongoDB a la possibilité d'utiliser un module appelé Mongo Mask. Il peut être utilisé comme ceci sur l’application : var mongoMask = require('mongo-mask'). Sur la base de données, MongoDB a des accès en lecture seule qui peuvent être spécifiés dans le code. 

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "403:unauthorized request" });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject,  _id: req.params.id })
                    .then(() => res.status(200).json({ message: "Sauce modifiée!"}))
                    .catch(error => res.status(400).json({ error }));
            }
        })
        .catch(error => res.status(400).json({ error }));
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "403:unauthorized request" });
            } else {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => res.status(200).json({ message: "Sauce supprimée!"}))
                        .catch(error => res.status(400).json({ error }));
                })  
            }
        })
        .catch(error => res.status(500).json({ error }));
};



