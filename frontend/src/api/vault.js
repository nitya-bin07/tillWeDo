import client from './client';

export const setupVault = (payload) => client.post('/vault/setup', payload);
export const getMyVault = () => client.get('/vault/me');
export const updateSettings = (payload) => client.put('/vault/settings', payload);
export const getBalance = () => client.get('/vault/balance');

export const createMandate = () => client.post('/payments/create-mandate');
export const createOrder = (payload = {}) => client.post('/payments/create-order', payload);
export const verifyPayment = (payload) => client.post('/payments/verify', payload);
export const savePayoutBank = (payload) => client.post('/payments/payout-bank', payload);