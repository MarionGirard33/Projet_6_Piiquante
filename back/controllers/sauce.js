const Sauce = require("../models/Sauce");
const fs = require("fs");

// Créer une sauce
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    // Validation des entrées avec une Regex
    let sauceRegex = new RegExp(/^[A-Za-z0-9àçèéêëù.,:;!?%() ]{2,500}$/);
    if (sauceRegex.test(sauceObject.name.trim()) && sauceRegex.test(sauceObject.manufacturer.trim()) && sauceRegex.test(sauceObject.description.trim()) && sauceRegex.test(sauceObject.mainPepper.trim()) === true) {
        delete sauceObject._id;
        // Nouvelle instance de la classe sauce
        const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
        // Sauvegarde de la nouvelle sauce
        sauce.save()
            .then(() => res.status(201).json({ message: "Sauce enregistrée!"}))
            .catch(error => res.status(500).json({ error }));
    } else {
        res.status(400).json({ message: "Les champs Name, Manufacturer, Description et Main Pepper ne doivent contenir que des lettres et des chiffres"})
    }
};

// Voir toutes les sauces
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(500).json({ error }));
};

// Voir une sauce
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(500).json({ error }));
}; 

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
    let sauceId = req.params.id;
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    // Validation des entrées avec une Regex
    let sauceRegex = new RegExp(/^[A-Za-z0-9àçèéêëù.,:;!?%() ]{2,500}$/);
    if (sauceRegex.test(sauceObject.name.trim()) && sauceRegex.test(sauceObject.manufacturer.trim()) && sauceRegex.test(sauceObject.description.trim()) && sauceRegex.test(sauceObject.mainPepper.trim()) === true) {
        delete sauceObject._userId;
        Sauce.findOne({_id: sauceId})
            .then((sauce) => {
                if (sauce.userId != req.auth.userId) {
                    res.status(403).json({ message: "403:unauthorized request" });
                } else {
                    // Mise à jour de la sauce et suppression de l'ancienne image
                    const filename = sauce.imageUrl.split("/images/")[1];
                    fs.unlink(`images/${filename}`, () => {
                    Sauce.updateOne({ _id: sauceId }, { ...sauceObject,  _id: sauceId })
                        .then(() => res.status(200).json({ message: "Sauce modifiée!"}))
                        .catch(error => res.status(500).json({ error }));
                    })
                }
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        res.status(400).json({ message: "Les champs Name, Manufacturer, Description et Main Pepper ne doivent contenir que des lettres et des chiffres"})
    }
};

// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
    let sauceId = req.params.id;
    Sauce.findOne({_id: sauceId})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: "403:unauthorized request" });
            } else {
                // Suppression de la sauce et de l'image
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: sauceId })
                        .then(() => res.status(200).json({ message: "Sauce supprimée!"}))
                        .catch(error => res.status(500).json({ error }));
                })  
            }
        })
        .catch(error => res.status(500).json({ error }));
};

// Liker ou disliker une sauce
exports.likeSauce = (req, res, next) => {
    let like = req.body.like;
    let sauceId = req.params.id;
    let userId = req.body.userId;

    if (like === 1) {
        Sauce.updateOne(
            {_id: sauceId},
            {$inc: {likes: +1}, $addToSet: {usersLiked: userId}}
        )
        .then(() => res.status(200).json({ message: "Like ajouté !" }))
        .catch(error => res.status(500).json({ error }));
    } else if (like === -1) {
        Sauce.updateOne(
            {_id: sauceId},
            {$inc: {dislikes: +1}, $addToSet: {usersDisliked: userId}}
        )
        .then(() => res.status(200).json({ message: "Dislike ajouté !" }))
        .catch(error => res.status(500).json({ error }));
    } else {
        Sauce.findOne({_id: sauceId})
        .then((sauce) => {
            if (sauce.usersLiked.includes(userId)) {
                Sauce.updateOne(
                {_id: sauceId},
                {$inc: {likes: -1}, $pull: {usersLiked: userId}}
                )
                .then(() => res.status(200).json({ message: "Like supprimé !" }))
                .catch(error => res.status(500).json({ error }));
            } else if (sauce.usersDisliked.includes(userId)) {
                Sauce.updateOne(
                    {_id: sauceId},
                    {$inc: {dislikes: -1}, $pull: {usersDisliked: userId}}
                )
                .then(() => res.status(200).json({ message: "Dislike supprimé !" }))
                .catch(error => res.status(500).json({ error }));
            }
        })
    }  
};



