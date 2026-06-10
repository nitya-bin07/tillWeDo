import client from './client';

export const submitProof = (formData) => client.post('/marriage/submit-proof', formData);
export const getStatus = () => client.get('/marriage/status');