const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {

    // ----------------------------------------------------------
    // POST /api/auth/login
    // ----------------------------------------------------------
    login: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const query = 'SELECT * FROM users WHERE email = ?';

        db.query(query, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message, query: query });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            const user = results[0];
            const pepper = process.env.PEPPER || '';
            const pepperedPassword = password + pepper;

            const match = await bcrypt.compare(pepperedPassword, user.password);

            if (!match) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            // Génération du token JWT
            const token = jwt.sign(
                { id: user.id, role: user.role, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            res.json({ 
                message: 'Connexion réussie', 
                token: token,
                user: { id: user.id, email: user.email, role: user.role }
            });
        });
    },

    // ----------------------------------------------------------
    // POST /api/auth/register
    // ----------------------------------------------------------
    register: async (req, res) => {
        const { username, email, address, password } = req.body;

        if (!username || !email || !password || !address) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        let hashedPassword;
        try {
            const pepper = process.env.PEPPER || '';
            const pepperedPassword = password + pepper;

            // 4. Ajouter un sel (explicite pour l'exercice)
            const salt = await bcrypt.genSalt(10);
            
            // 5. Ajouter un poivre (hachage du mdp + poivre avec le sel)
            hashedPassword = await bcrypt.hash(pepperedPassword, salt);
        } catch (error) {
            return res.status(500).json({ error: 'Erreur lors du hachage' });
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
                [username, email, hashedPassword, address, 'user'],
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
