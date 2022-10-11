const express = require('express');

const app = express();

// Redirection forcée HTTP vers HTTPS
module.exports = (req, res, next) => {
    if (req.protocol === 'http') {
        return res.redirect(307, 'https://' + req.get('host').replace('3000', '3001') + req.url);
    }
    next();
  };


