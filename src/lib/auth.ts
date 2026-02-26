export const validateCredentials = (username: string, password: string): boolean => {
  return username === 'admin' && password === 'admin';
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('authenticated') === 'true';
}; 