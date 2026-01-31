const API_URL = "http://localhost:8080/api/auth";
const WALLET_API_URL = "http://localhost:8080/api/wallets";

const register = (name, email, password, phone, country) => {
    return fetch(API_URL + "/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            email,
            password,
            phone,
            country
        }),
    }).then(async response => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || 'Registration failed');
        }
        return response.json();
    });
};

const login = (email, password) => {
    return fetch(API_URL + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error("Login failed");
        })
        .then((data) => {
            if (data.token) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }
            return data.user;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

const getWallets = (userId) => {
    return fetch(WALLET_API_URL + "/user/" + userId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(response => response.json())
        .then(data => data.map(w => ({ ...w, change: w.dailyChange })));
}

const createWallet = (userId, currency, initialDeposit) => {
    return fetch(WALLET_API_URL + "/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currency, initialDeposit })
    }).then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    });
};

const getTransactions = (walletId) => {
    return fetch(`http://localhost:8080/api/transactions/wallet/${walletId}`)
        .then(res => res.json());
};

const getWalletStats = (walletId) => {
    return fetch(`http://localhost:8080/api/transactions/wallet/${walletId}/stats`)
        .then(res => res.json());
};

const getUserTransactions = (userId) => {
    return fetch(`http://localhost:8080/api/transactions/user/${userId}`)
        .then(res => res.json());
};

const createPaymentIntent = (amount, currency) => {
    return fetch(`http://localhost:8080/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency })
    }).then(res => res.json());
};

const confirmPayment = (paymentIntentId, walletId) => {
    return fetch(`http://localhost:8080/api/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, walletId })
    }).then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    });
};

export default {
    register,
    login,
    logout,
    getCurrentUser,
    getWallets,
    createWallet,
    getTransactions,
    getWalletStats,
    getUserTransactions,
    createPaymentIntent,
    confirmPayment
};
