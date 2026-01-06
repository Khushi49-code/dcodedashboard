// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    // Implement actual API call
  },
};