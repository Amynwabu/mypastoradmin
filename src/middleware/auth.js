const { verifyToken } = require('../utils/token');
const repos = require('../db/repositories');

const roleRank = {
  pastor: 100,
  super_admin: 95,
  admin: 80,
  care: 60,
  finance: 60,
  media: 50,
  department_lead: 40,
  viewer: 10
};

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Authentication required' });
  const user = repos.users.find(payload.sub);
  if (!user || user.disabled) return res.status(401).json({ error: 'Invalid user' });
  req.user = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department || '' };
  next();
}

function allow(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'You do not have permission to access this resource' });
  };
}

function minimum(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if ((roleRank[req.user.role] || 0) >= (roleRank[role] || 0)) return next();
    return res.status(403).json({ error: 'You do not have enough permission for this action' });
  };
}

module.exports = { authenticate, allow, minimum };
