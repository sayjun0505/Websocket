/**
 * Authorization Roles
 */
const authRoles = {
  primary: ['primary'],
  admin: ['primary', 'admin'],
  staff: ['primary', 'admin', 'manager', 'agent'],
  user: ['primary', 'admin', 'manager', 'agent', 'user'],
  onlyGuest: [],
};

export default authRoles;
