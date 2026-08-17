const { createHttpError } = require('../../utils/response.utils');

const DEFAULT_USER_ID = 'u1';

function daysAgo(days) {
    return new Date(Date.now() - days * 86400000).toISOString();
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const wallets = new Map([
    [
        DEFAULT_USER_ID,
        {
            balance: 320,
            transactions: [
                {
                    id: 't3',
                    type: 'debit',
                    amount: 60,
                    description: 'Spotlight "4K monitor"',
                    createdAt: daysAgo(2),
                },
                {
                    id: 't2',
                    type: 'debit',
                    amount: 120,
                    description: 'Boosted "Standing desk"',
                    createdAt: daysAgo(5),
                },
                {
                    id: 't1',
                    type: 'credit',
                    amount: 500,
                    description: 'Welcome bonus',
                    createdAt: daysAgo(40),
                },
            ],
        },
    ],
]);

function ensureWallet(userId = DEFAULT_USER_ID) {
    if (!wallets.has(userId)) {
        wallets.set(userId, {
            balance: 0,
            transactions: [],
        });
    }

    return wallets.get(userId);
}

function normalizeAmount(amount) {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw createHttpError(400, 'Amount must be a positive number.');
    }

    return numericAmount;
}

function makeTransaction(type, amount, description) {
    return {
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        type,
        amount,
        description,
        createdAt: new Date().toISOString(),
    };
}

async function getWallet(userId = DEFAULT_USER_ID) {
    const wallet = ensureWallet(userId);

    return clone({
        balance: wallet.balance,
        transactions: wallet.transactions,
    });
}

async function creditWallet(userId, amount, description = 'Credit added') {
    const wallet = ensureWallet(userId);
    const numericAmount = normalizeAmount(amount);
    const transaction = makeTransaction('credit', numericAmount, description);

    wallet.balance += numericAmount;
    wallet.transactions.unshift(transaction);

    return getWallet(userId);
}

async function debitWallet(userId, amount, description = 'Credit spent') {
    const wallet = ensureWallet(userId);
    const numericAmount = normalizeAmount(amount);

    if (wallet.balance < numericAmount) {
        throw createHttpError(400, 'Not enough credits.');
    }

    const transaction = makeTransaction('debit', numericAmount, description);
    wallet.balance -= numericAmount;
    wallet.transactions.unshift(transaction);

    return getWallet(userId);
}

module.exports = {
    DEFAULT_USER_ID,
    getWallet,
    creditWallet,
    debitWallet,
};
