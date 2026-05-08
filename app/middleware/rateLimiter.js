const rateLimit = require('express-rate-limit');

// Limiteur pour les tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limite à 5 essais par minute
    message: { 
        error: 'Trop de tentatives de connexion. Veuillez réessayer dans une minute.' 
    },
    standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
    legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
});

module.exports = { loginLimiter };
