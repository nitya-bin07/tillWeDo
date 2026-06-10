import client from './client';

export const getDashboard = () => client.get('/admin/dashboard');
export const getUsers = (params) => client.get('/admin/users', { params });
export const getVaults = (params) => client.get('/admin/vaults', { params });
export const getForfeitureLog = () => client.get('/admin/forfeiture-log');
export const triggerPayout = (vaultId) => client.post(`/admin/payout/${vaultId}`);
export const getLogs = () => client.get('/admin/logs');

export const getMarriageProofs = () => client.get('/marriage/all');
export const approveProof = (id) => client.put(`/marriage/${id}/approve`);
export const rejectProof = (id, payload) => client.put(`/marriage/${id}/reject`, payload);
export const getAllVaults = (params) => client.get('/vault/all', { params });
export const getVaultById = (id) => client.get(`/vault/${id}`);
export const getCoupleById = (id) => client.get(`/couples/${id}`);
export const getContributionsByVault = (vaultId) => client.get(`/contributions/${vaultId}`);