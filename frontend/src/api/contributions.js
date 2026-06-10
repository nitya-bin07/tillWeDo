import client from './client';

export const getHistory = (params) => client.get('/contributions/history', { params });
export const getUpcoming = () => client.get('/contributions/upcoming');
export const manualPay = (payload) => client.post('/contributions/manual-pay', payload);