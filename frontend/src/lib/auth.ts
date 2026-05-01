export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cms_token');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('cms_user');
  return u ? JSON.parse(u) : null;
}

export function setAuth(token: string, user: User) {
  localStorage.setItem('cms_token', token);
  localStorage.setItem('cms_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('cms_token');
  localStorage.removeItem('cms_user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
