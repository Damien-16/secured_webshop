const db = require('../config/db');

module.exports = {

    // ----------------------------------------------------------
    // POST /api/auth/login
    // ----------------------------------------------------------
    login: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

        db.query(query, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message, query: query });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            res.json({ message: 'Connexion réussie', user: results[0] });
        });
    },

    // ----------------------------------------------------------
    // POST /api/auth/register
    // ----------------------------------------------------------
    register: (req, res) => {
        const { username, email, address, password } = req.body;

        if (!username || !email || !password || !address) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        // Vérification de l'existence de l'email
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur serveur lors de la vérification' });
            }
            if (results.length > 0) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé' });
            }

            // Insertion du nouvel utilisateur
            db.query(
                'INSERT INTO users (username, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
                [username, email, password, address, 'user'],
                (errInsert) => {
                    if (errInsert) {
                        return res.status(500).json({ error: 'Erreur lors de la création du compte' });
                    }
                    res.status(201).json({ message: 'Inscription réussie' });
                }
            );
        });
    }
};
