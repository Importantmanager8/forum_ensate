import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  resendVerificationEmail: async (email) => {
    const response = await api.post("/auth/resend-email", email);
    return response;
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};