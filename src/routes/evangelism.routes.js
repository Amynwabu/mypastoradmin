const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const { requireFields, pick } = require('../utils/sanitize');
const audit = require('../services/auditService');

const router = express.Router();
router.use(authenticate, allow('pastor', 'super_admin', 'admin', 'department_lead'));

const editable = ['name', 'phone', 'email', 'sourceEvent', 'interest', 'status', 'assignedTo', 'nextFollowUpDate', 'notes'];

router.get('/', (req, res) => {
  let contacts = repos.evangelism.all().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (req.query.status) contacts = contacts.filter((c) => c.status === req.query.status);
  res.json(contacts);
});

router.post('/', (req, res) => {
  requireFields(req.body, ['name']);
  const contact = repos.evangelism.create({ ...pick(req.body, editable), status: req.body.status || 'New' });
  audit.log(req, 'created', 'evangelism_contact', contact.id, { name: contact.name });
  res.status(201).json(contact);
});

router.put('/:id', (req, res) => {
  const updated = repos.evangelism.update(req.params.id, pick(req.body, editable));
  if (!updated) return res.status(404).json({ error: 'Contact not found' });
  audit.log(req, 'updated', 'evangelism_contact', updated.id, { status: updated.status });
  res.json(updated);
});

module.exports = router;
