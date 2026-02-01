const BASE_URL = "https://joyful-cooperation-production.up.railway.app/api";
const API_URL = "https://joyful-cooperation-production.up.railway.app/api/auth";
const WALLET_API_URL = "https://joyful-cooperation-production.up.railway.app/api/wallets";

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
    return fetch(`${BASE_URL}/transactions/wallet/${walletId}`)
        .then(res => res.json());
};

const getWalletStats = (walletId) => {
    return fetch(`${BASE_URL}/transactions/wallet/${walletId}/stats`)
        .then(res => res.json());
};

const getUserTransactions = (userId) => {
    return fetch(`${BASE_URL}/transactions/user/${userId}`)
        .then(res => res.json());
};

const createPaymentIntent = (amount, currency) => {
    return fetch(`${BASE_URL}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency })
    }).then(res => res.json());
};

const confirmPayment = (paymentIntentId, walletId) => {
    return fetch(`${BASE_URL}/payments/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId, walletId })
    }).then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    });
};

// Transfer APIs
const checkRecipient = (email, senderCurrency) => {
    return fetch(`${BASE_URL}/transfer/check-recipient?email=${encodeURIComponent(email)}&senderCurrency=${senderCurrency}`)
        .then(res => res.json());
};

const sendMoney = (senderWalletId, recipientEmail, amount, note) => {
    return fetch(`${BASE_URL}/transfer/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderWalletId, recipientEmail, amount, note })
    }).then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Transfer failed');
        return data;
    });
};

const convertCurrency = (fromWalletId, toWalletId, amount) => {
    return fetch(`${BASE_URL}/transfer/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromWalletId, toWalletId, amount })
    }).then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Conversion failed');
        return data;
    });
};

const getExchangeRates = () => {
    return fetch(`${BASE_URL}/transfer/exchange-rates`)
        .then(res => res.json());
};

const getExchangeRate = (from, to) => {
    return fetch(`${BASE_URL}/transfer/exchange-rate?from=${from}&to=${to}`)
        .then(res => res.json());
};

// Profile APIs
const getProfile = (userId) => {
    return fetch(`${BASE_URL}/user/${userId}`)
        .then(res => res.json());
};

const updateProfile = (userId, data) => {
    return fetch(`${BASE_URL}/user/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(async res => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Update failed');
        // Update local storage
        const user = getCurrentUser();
        if (user && result.user) {
            localStorage.setItem('user', JSON.stringify({ ...user, ...result.user }));
        }
        return result;
    });
};

const changePassword = (userId, currentPassword, newPassword) => {
    return fetch(`${BASE_URL}/user/${userId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
    }).then(async res => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Password change failed');
        return result;
    });
};

// Notification APIs
const getNotifications = (userId) => {
    return fetch(`${BASE_URL}/user/${userId}/notifications`)
        .then(res => res.json());
};

const getUnreadNotifications = (userId) => {
    return fetch(`${BASE_URL}/user/${userId}/notifications/unread`)
        .then(res => res.json());
};

const getUnreadNotificationCount = (userId) => {
    return fetch(`${BASE_URL}/user/${userId}/notifications/count`)
        .then(res => res.json());
};

const markNotificationRead = (notificationId) => {
    return fetch(`${BASE_URL}/user/notifications/${notificationId}/read`, {
        method: 'POST'
    }).then(res => res.json());
};

const markAllNotificationsRead = (userId) => {
    return fetch(`${BASE_URL}/user/${userId}/notifications/read-all`, {
        method: 'POST'
    }).then(res => res.json());
};

// Reports APIs
const getReportSummary = (userId) => {
    return fetch(`${BASE_URL}/reports/user/${userId}/summary`)
        .then(res => res.json());
};

const getMonthlyReport = (userId, year, month) => {
    let url = `${BASE_URL}/reports/user/${userId}/monthly`;
    if (year && month) {
        url += `?year=${year}&month=${month}`;
    }
    return fetch(url).then(res => res.json());
};

const exportTransactions = (userId, startDate, endDate) => {
    let url = `${BASE_URL}/reports/user/${userId}/transactions/export`;
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    return fetch(url).then(res => res.json());
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
    confirmPayment,
    checkRecipient,
    sendMoney,
    convertCurrency,
    getExchangeRates,
    getExchangeRate,
    getProfile,
    updateProfile,
    changePassword,
    getNotifications,
    getUnreadNotifications,
    getUnreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    getReportSummary,
    getMonthlyReport,
    exportTransactions
};
