import { User } from '../types';

const DEFAULT_ADMIN_EMAIL = 'admin@bitedash.com';

const getPartnerAdminEmails = () =>
  (import.meta.env.VITE_PARTNER_ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

export const isPrivilegedEmail = (email?: string | null) => {
  const normalized = (email || '').trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === DEFAULT_ADMIN_EMAIL) return true;
  return getPartnerAdminEmails().includes(normalized);
};

export const resolveUserRole = (email?: string | null, storedRole?: string): User['role'] => {
  if (storedRole === 'admin') return 'admin';
  return isPrivilegedEmail(email) ? 'admin' : 'user';
};

export const resolveAdminScope = (email?: string | null, storedScope?: string): User['adminScope'] => {
  if (isPrivilegedEmail(email)) return 'all';
  if (storedScope === 'own') return 'own';
  if (storedScope === 'all') return 'all';
  return undefined;
};
