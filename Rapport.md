# Documentation Technique de Sécurisation

Ce document regroupe les extraits de code critiques implémentés pour sécuriser l'application Secure Shop.

## 1. Hachage avec Sel et Poivre (`app/controllers/AuthController.js`)
Mise en œuvre du hachage robuste pour le stockage des mots de passe.

```javascript
// Inscription
const pepper = process.env.PEPPER || '';
const pepperedPassword = password + pepper;

// Génération du sel et hachage
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(pepperedPassword, salt);

// Insertion sécurisée
db.query(
    'INSERT INTO users (username, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [username, email, hashedPassword, address, 'user'],
    // ...
);
```

## 2. Prévention des Injections SQL
Utilisation systématique des requêtes paramétrées avec des marqueurs `?`.

```javascript
// Exemple de lecture sécurisée
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email], async (err, results) => {
    // Les données de l'utilisateur 'email' sont traitées de manière sécurisée par le driver
});
```

## 3. Gestion des Tokens JWT (`app/controllers/AuthController.js`)
Génération du token lors de la connexion.

```javascript
// Génération du token JWT après vérification du mot de passe
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
```

## 4. Middleware d'Authentification et de Rôles (`app/middleware/auth.js`)
Validation du token et contrôle d'accès.

```javascript
const auth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Accès refusé' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Injection de l'identité dans la requête
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token invalide' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Droits administrateur requis' });
    }
};
```

## 5. Protection des Routes d'Administration (`app/routes/Admin.js`)
Application des middlewares de sécurité.

```javascript
const { auth, isAdmin } = require('../middleware/auth');

// Toutes les routes définies dans ce fichier passent par auth ET isAdmin
router.use(auth);
router.use(isAdmin);

router.get('/users', controller.getUsers);
```

## 6. Stockage Client (`app/public/js/nav.js`)
Gestion du token côté navigateur.

```javascript
// Lors du login
localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// Lors des appels API protégés
const response = await fetch('/api/admin/users', {
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
    }
});
```

## 7. Protection contre le Brute-Force (`app/middleware/rateLimiter.js`)
Limitation du nombre de tentatives de connexion par adresse IP  avec `express-rate-limit` 

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5, 
    message: { error: 'Trop de tentatives. Réessayez dans 1 minute.' }
});

// Appliqué dans app/routes/Auth.js
router.post('/login', loginLimiter, controller.login);
```

## 8. Politique de Mot de Passe Fort
Point 16 : mettre en place une politique de mot de passe fort (minuscules, majuscule, longueur minimale, caractères spéciaux) avec affichage d’un indicateur de force.

Description : validation de la complexité du mot de passe à l’inscription côté serveur et affichage d’un indicateur côté client pour guider l’utilisateur vers un mot de passe sécurisé.

Exemple de code :
```javascript
const password = req.body.password;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10,}$/;

if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({ error: 'Mot de passe trop faible : 10 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.' });
}
```
