const express = require('express');
const repos = require('../db/repositories');
const { verifyPassword, hashPassword } = require('../utils/password');
const { issueToken } = require('../utils/token');
const { authenticate, allow } = require('../middleware/auth');
const { requireFields, pick, cleanString } = require('../utils/sanitize');
const audit = require('../services/auditService');

const router = express.Router();

router.post('/login', (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const email = cleanString(req.body.email).toLowerCase();
  const user = repos.users.all().find((u) => u.email.toLowerCase() === email && !u.disabled);
  if (!user || !verifyPassword(req.body.password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = issueToken({ sub: user.id, role: user.role, name: user.name });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department || '' } });
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

router.post('/users', authenticate, allow('pastor', 'super_admin'), (req, res) => {
  requireFields(req.body, ['name', 'email', 'password', 'role']);
  const data = pick(req.body, ['name', 'email', 'role', 'department']);
  data.email = cleanString(data.email).toLowerCase();
  if (repos.users.all().some((u) => u.email.toLowerCase() === data.email)) return res.status(409).json({ error: 'User email already exists' });
  data.passwordHash = hashPassword(req.body.password);
  data.disabled = false;
  const user = repos.users.create(data);
  audit.log(req, 'created', 'user', user.id, { role: user.role });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department || '' });
});

module.exports = router;
