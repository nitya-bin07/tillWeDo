import client from './client';

export const createInvite = (payload = {}) => client.post('/couples/create-invite', payload);
export const acceptInvite = (payload) => client.post('/couples/accept-invite', payload);
export const getMyCouple = () => client.get('/couples/me');
export const unlink = () => client.delete('/couples/unlink');

export const initiateBreakup = () => client.post('/breakup/initiate');
export const cancelBreakup = () => client.post('/breakup/cancel');
export const getBreakupStatus = () => client.get('/breakup/status');