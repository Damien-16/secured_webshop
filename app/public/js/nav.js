document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Gestion du Menu (Topbar) ---
    const nav = document.getElementById('topbar');
    if (nav) {
        nav.innerHTML = `
        <header class="topbar">
            <div class="container">
                <div class="brand">Secure Shop</div>
                <nav class="menu">
                    <a href="/">Accueil</a>
                    <a href="/profile">Profil</a>
                    <a href="/admin">Admin</a>
                    <a href="/login">Connexion</a>
                    <a href="/register">Inscription</a>
                </nav>
            </div>
        </header>
        `;
    }

    // --- 2. Logique de Connexion ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Récupération des données du formulaire
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Bienvenue ' + data.user.email);
                    window.location.href = '/'; 
                } else {
                    document.getElementById('message').textContent = data.error || 'Erreur lors de la connexion';
                }
            } catch (error) {
                console.error('Erreur réseau :', error);
            }
        });
    }
});