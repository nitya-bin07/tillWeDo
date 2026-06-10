import client from './client';

export const register = (payload) => client.post('/auth/register', payload);
export const login = (payload) => client.post('/auth/login', payload);
export const verifyEmail = (payload) => client.post('/auth/verify-email', payload);
export const verifyPhone = (payload) => client.post('/auth/verify-phone', payload);
export const forgotPassword = (payload) => client.post('/auth/forgot-password', payload);
export const resetPassword = (payload) => client.post('/auth/reset-password', payload);
export const logout = () => client.post('/auth/logout');
export const getMe = () => client.get('/auth/me');

export const getProfile = () => client.get('/users/profile');
export const updateProfile = (payload) => client.put('/users/profile', payload);
export const uploadPhoto = (formData) => client.post('/users/upload-photo', formData);
export const deleteAccount = () => client.delete('/users/account');