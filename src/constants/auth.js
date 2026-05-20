export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER'
};

export const ADMIN_EMAIL = 'lekyanh1110@gmail.com';

export const isAdminEmail = (email) => {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const isAdminRole = (role) => {
  return role === ROLES.ADMIN;
};

export const isAdmin = (user) => {
  if (!user) return false;
  return isAdminEmail(user.email) || isAdminRole(user.role);
};
