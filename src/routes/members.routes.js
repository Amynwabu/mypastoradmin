const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const { requireFields, pick, cleanString } = require('../utils/sanitize');
const audit = require('../services/auditService');

const router = express.Router();
router.use(authenticate);

const editable = ['name', 'phone', 'whatsapp', 'birthday', 'department', 'dedicationLevel', 'joinDate', 'active', 'notes'];

router.get('/', (req, res) => {
  let members = repos.members.all();
  const { department, dedication, search, active } = req.query;
  if (active !== undefined) members = members.filter((m) => m.active === (active === 'true'));
  if (department) members = members.filter((m) => m.department === department);
  if (dedication) members = members.filter((m) => m.dedicationLevel === dedication);
  if (search) {
    const q = String(search).toLowerCase();
    members = members.filter((m) => m.name?.toLowerCase().includes(q) || m.phone?.includes(q) || m.whatsapp?.includes(q));
  }
  res.json(members);
});

router.get('/:id', (req, res) => {
  const member = repos.members.find(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
});

router.post('/', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  requireFields(req.body, ['name', 'phone']);
  const data = pick(req.body, editable);
  data.name = cleanString(data.name, 120);
  data.firstName = data.name.split(' ')[0];
  data.active = data.active !== false;
  data.department = data.department || 'General';
  data.dedicationLevel = data.dedicationLevel || 'Regular';
  data.whatsapp = data.whatsapp || data.phone;
  data.joinDate = data.joinDate || new Date().toISOString().slice(0, 10);
  const member = repos.members.create(data);
  audit.log(req, 'created', 'member', member.id, { name: member.name });
  res.status(201).json(member);
});

router.put('/:id', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  const updated = repos.members.update(req.params.id, pick(req.body, editable));
  if (!updated) return res.status(404).json({ error: 'Member not found' });
  audit.log(req, 'updated', 'member', updated.id, { name: updated.name });
  res.json(updated);
});

router.delete('/:id', allow('pastor', 'super_admin'), (req, res) => {
  const ok = repos.members.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Member not found' });
  audit.log(req, 'deleted', 'member', req.params.id);
  res.json({ success: true });
});

router.post('/import', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  if (!Array.isArray(req.body.members)) return res.status(400).json({ error: 'members must be an array' });
  const added = req.body.members.slice(0, 500).map((m) => {
    const name = cleanString(m.name, 120);
    if (!name || !m.phone) return null;
    return repos.members.create({ ...pick(m, editable), name, firstName: name.split(' ')[0], whatsapp: m.whatsapp || m.phone, active: m.active !== false });
  }).filter(Boolean);
  audit.log(req, 'imported', 'member', 'bulk', { count: added.length });
  res.json({ imported: added.length, members: added });
});

module.exports = router;
