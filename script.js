// --- SYSTÈME D'INSCRIPTION ET DE CONNEXION ---

let currentUser = null;
const RATE_USD_TO_FCFA = 600;

// Catalogue officiel H1 à H9
const catalogProducts = [
    { id: 1, name: 'Cryptomining H1', priceFCFA: 5100, duration: 5, profitFCFA: 2000, maxLimit: 1, img: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300' },
    { id: 2, name: 'Cryptomining H2', priceFCFA: 10000, duration: 25, profitFCFA: 6000, maxLimit: 2, img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300' },
    { id: 3, name: 'Cryptomining H3', priceFCFA: 15000, duration: 25, profitFCFA: 8000, maxLimit: 2, img: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=300' },
    { id: 4, name: 'Cryptomining H4', priceFCFA: 26000, duration: 26, profitFCFA: 13000, maxLimit: 2, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300' },
    { id: 5, name: 'Cryptomining H5', priceFCFA: 43000, duration: 30, profitFCFA: 17000, maxLimit: 2, img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300' },
    { id: 6, name: 'Cryptomining H6', priceFCFA: 75000, duration: 30, profitFCFA: 32000, maxLimit: 2, img: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=300' },
    { id: 7, name: 'Cryptomining H7', priceFCFA: 120000, duration: 35, profitFCFA: 55000, maxLimit: 2, img: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=300' },
    { id: 8, name: 'Cryptomining H8', priceFCFA: 200000, duration: 40, profitFCFA: 95000, maxLimit: 2, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300' },
    { id: 9, name: 'Cryptomining H9', priceFCFA: 350000, duration: 45, profitFCFA: 180000, maxLimit: 2, img: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300' }
];

function switchAuth(mode) {
    if (mode === 'register') {
        document.getElementById('login-box').classList.add('hidden');
        document.getElementById('register-box').classList.remove('hidden');
    } else {
        document.getElementById('register-box').classList.add('hidden');
        document.getElementById('login-box').classList.remove('hidden');
    }
}

function handleRegister() {
    const user = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const ref = document.getElementById('reg-ref').value.trim();

    if (!user || !pass) {
        alert("Veuillez remplir tous les champs obligatoires.");
        return;
    }

    let existingUser = localStorage.getItem("nova_user_" + user);
    if (existingUser) {
        alert("Ce nom d'utilisateur existe déjà.");
        return;
    }

    const userData = {
        username: user,
        password: pass,
        referralCode: ref || "NOVA" + Math.floor(1000 + Math.random() * 9000),
        mainBalanceUSD: 0.00,
        totalInvestedUSD: 0.00,
        investments: [],
        purchasedCounts: {},
        cryptoAddress: "",
        addressLocked: false,
        momoOperator: "MTN MoMo",
        momoNumber: "",
        momoLocked: false,
        withdrawals: []
    };

    localStorage.setItem("nova_user_" + user, JSON.stringify(userData));
    alert("Inscription réussie ! Connectez-vous.");
    
    document.getElementById('login-user').value = user;
    document.getElementById('login-pass').value = pass;
    switchAuth('login');
}

function handleLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (!user || !pass) {
        alert("Veuillez entrer vos identifiants.");
        return;
    }

    const savedDataStr = localStorage.getItem("nova_user_" + user);
    if (!savedDataStr) {
        alert("Compte introuvable. Veuillez vous inscrire.");
        return;
    }

    const userData = JSON.parse(savedDataStr);
    if (userData.password !== pass) {
        alert("Mot de passe incorrect.");
        return;
    }

    currentUser = userData;
    initAppSession();
}

function initAppSession() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
    document.getElementById('bottom-nav').classList.remove('hidden');

    document.getElementById('user-display').innerText = currentUser.username;
    
    // Mettre à jour les soldes affichés
    updateBalancesUI();

    // Mettre à jour les champs de liaison et l'historique
    loadWithdrawalSettings();
    renderWithdrawalHistory();

    const refLinkInput = document.getElementById('my-ref-link');
    if (refLinkInput) {
        refLinkInput.value = window.location.origin + window.location.pathname + "?ref=" + currentUser.referralCode;
    }
    const profileCode = document.getElementById('profile-code');
    if (profileCode) {
        profileCode.innerText = "Votre code de parrainage : " + currentUser.referralCode;
    }

    renderCatalog();
}

function updateBalancesUI() {
    document.getElementById('mainBalanceUSD').innerText = currentUser.mainBalanceUSD.toFixed(2) + " $";
    document.getElementById('mainBalanceFCFA').innerText = Math.round(currentUser.mainBalanceUSD * RATE_USD_TO_FCFA) + " FCFA";
    document.getElementById('totalInvestedUSD').innerText = currentUser.totalInvestedUSD.toFixed(2) + " $";
    document.getElementById('totalInvestedFCFA').innerText = Math.round(currentUser.totalInvestedUSD * RATE_USD_TO_FCFA) + " FCFA";
}

// Sauvegarder et verrouiller le compte Mobile Money
function saveMomoAccount() {
    const op = document.getElementById('link-momo-op').value;
    const num = document.getElementById('link-momo-num').value.trim();

    if (!num) {
        alert("Veuillez entrer un numéro Mobile Money valide.");
        return;
    }

    currentUser.momoOperator = op;
    currentUser.momoNumber = num;
    currentUser.momoLocked = true;
    saveUserData();
    
    alert("Compte Mobile Money enregistré et lié avec succès !");
    loadWithdrawalSettings();
}

// Sauvegarder et verrouiller l'adresse Crypto
function saveCryptoAccount() {
    const addr = document.getElementById('link-crypto-addr').value.trim();

    if (!addr.startsWith("0x") || addr.length < 10) {
        alert("Veuillez entrer une adresse BEP-20 valide (commençant par 0x).");
        return;
    }

    currentUser.cryptoAddress = addr;
    currentUser.addressLocked = true;
    saveUserData();

    alert("Adresse Crypto enregistrée et liée avec succès !");
    loadWithdrawalSettings();
}

function loadWithdrawalSettings() {
    const momoOpSelect = document.getElementById('link-momo-op');
    const momoNumInput = document.getElementById('link-momo-num');
    const cryptoAddrInput = document.getElementById('link-crypto-addr');

    if (currentUser.momoNumber) {
        momoNumInput.value = currentUser.momoNumber;
        momoOpSelect.value = currentUser.momoOperator || "MTN MoMo";
    }
    if (currentUser.momoLocked) {
        momoNumInput.disabled = true;
        momoOpSelect.disabled = true;
    }

    if (currentUser.cryptoAddress) {
        cryptoAddrInput.value = currentUser.cryptoAddress;
    }
    if (currentUser.addressLocked) {
        cryptoAddrInput.disabled = true;
    }
}

// Effectuer une demande de retrait
function handleWithdrawal(event) {
    event.preventDefault();
    const method = document.getElementById('withdraw-method').value;
    const amount = parseFloat(document.getElementById('withdraw-amount').value);

    if (isNaN(amount) || amount <= 0) {
        alert("Veuillez entrer un montant valide.");
        return;
    }

    if (amount > currentUser.mainBalanceUSD) {
        alert("Solde insuffisant pour ce retrait.");
        return;
    }

    if (method === 'momo' && !currentUser.momoLocked) {
        alert("Veuillez d'abord lier et enregistrer votre compte Mobile Money ci-dessous.");
        return;
    }

    if (method === 'crypto' && !currentUser.addressLocked) {
        alert("Veuillez d'abord lier et enregistrer votre adresse Crypto ci-dessous.");
        return;
    }

    // Déduire du solde principal
    currentUser.mainBalanceUSD -= amount;

    // Enregistrer dans l'historique
    const withdrawalEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        amountUSD: amount,
        amountFCFA: Math.round(amount * RATE_USD_TO_FCFA),
        method: method === 'momo' ? `Mobile Money (${currentUser.momoOperator}: ${currentUser.momoNumber})` : `Crypto (${currentUser.cryptoAddress})`,
        status: 'En attente'
    };

    if (!currentUser.withdrawals) {
        currentUser.withdrawals = [];
    }
    currentUser.withdrawals.unshift(withdrawalEntry);
    
    saveUserData();
    updateBalancesUI();
    renderWithdrawalHistory();

    alert("Demande de retrait soumise avec succès ! En attente d'approbation.");
    document.getElementById('withdraw-amount').value = '';
}

function renderWithdrawalHistory() {
    const listContainer = document.getElementById('withdrawal-history-list');
    if (!listContainer) return;

    if (!currentUser.withdrawals || currentUser.withdrawals.length === 0) {
        listContainer.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); text-align:center;">Aucun historique pour le moment.</p>`;
        return;
    }

    listContainer.innerHTML = '';
    currentUser.withdrawals.forEach(w => {
        let statusColor = '#f3ba2f'; // En attente
        if (w.status === 'Approuvé') statusColor = '#22c55e';
        if (w.status === 'Refusé') statusColor = '#ef4444';

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="font-weight:bold; color:#fff;">${w.amountUSD.toFixed(2)} $ (${w.amountFCFA} F)</span>
                <span style="color:${statusColor}; font-weight:bold;">${w.status}</span>
            </div>
            <p style="color:var(--text-muted); font-size:0.75rem; margin-bottom:2px;">Cible : ${w.method}</p>
            <p style="color:var(--text-muted); font-size:0.7rem;">Date : ${w.date}</p>
        `;
        listContainer.appendChild(item);
    });
}

function saveUserData() {
    localStorage.setItem("nova_user_" + currentUser.username, JSON.stringify(currentUser));
}

// Fonction de navigation entre les différentes vues de l'application
function switchView(viewName, navElement) {
    const views = document.querySelectorAll('.view-content');
    views.forEach(v => v.classList.add('hidden'));

    const targetView = document.getElementById('view-' + viewName);
    if (targetView) {
        targetView.classList.remove('hidden');
    }

    if (navElement) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        navElement.classList.add('active');
    }
}

// Gestion des sous-onglets de dépôt
function switchDepositMethod(method) {
    const tabUsdt = document.getElementById('tab-usdt');
    const tabMomo = document.getElementById('tab-momo');
    const depositUsdt = document.getElementById('deposit-usdt');
    const depositMomo = document.getElementById('deposit-momo');

    if (method === 'usdt') {
        tabUsdt.classList.add('active');
        tabMomo.classList.remove('active');
        depositUsdt.classList.remove('hidden');
        depositMomo.classList.add('hidden');
    } else {
        tabMomo.classList.add('active');
        tabUsdt.classList.remove('active');
        depositMomo.classList.remove('hidden');
        depositUsdt.classList.add('hidden');
    }
}

function renderCatalog() {
    const catalogGrid = document.getElementById('catalogGrid');
    if (!catalogGrid) return;

    catalogGrid.innerHTML = '';

    catalogProducts.forEach(product => {
        const dailyProfitFCFA = Math.round(product.profitFCFA / product.duration);
        const dailyProfitUSD = (dailyProfitFCFA / RATE_USD_TO_FCFA).toFixed(2);
        
        const priceUSD = (product.priceFCFA / RATE_USD_TO_FCFA).toFixed(2);
        const totalProfitUSD = (product.profitFCFA / RATE_USD_TO_FCFA).toFixed(2);

        const card = document.createElement('div');
        card.className = 'catalog-card';
        card.innerHTML = `
            <div>
                <img src="${product.img}" alt="${product.name}" style="width:100%; height:90px; object-fit:cover; border-radius:6px; margin-bottom:8px;">
                <h5 style="font-size:0.85rem; color:#fff; margin-bottom:4px;">${product.name}</h5>
                <p style="font-size:0.75rem; color:var(--accent-color); margin-bottom:2px;">Prix: ${product.priceFCFA} F (${priceUSD} $)</p>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">Durée: ${product.duration} jours</p>
                <p style="font-size:0.75rem; color:#22c55e; font-weight:bold; margin-bottom:2px;">Revenu/jour: ${dailyProfitFCFA} F (${dailyProfitUSD} $)</p>
                <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">Total: ${product.profitFCFA} F (${totalProfitUSD} $)</p>
            </div>
            <button class="btn" style="padding:6px; font-size:0.8rem;" onclick="investProduct(${product.id})">Investir</button>
        `;
        catalogGrid.appendChild(card);
    });
}

function investProduct(productId) {
    alert("Fonction d'investissement pour le produit ID: " + productId);
}

function copyText(elementId) {
    const input = document.getElementById(elementId);
    if (input) {
        input.select();
        input.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(input.value);
        alert("Copié dans le presse-papier !");
    }
}

function handleLogout() {
    currentUser = null;
    document.getElementById('app-section').classList.add('hidden');
    document.getElementById('bottom-nav').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
}
