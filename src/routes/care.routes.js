const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const { requireFields, pick } = require('../utils/sanitize');
const audit = require('../services/auditService');

const router = express.Router();
router.use(authenticate);

const editable = ['memberId', 'name', 'phone', 'category', 'summary', 'urgency', 'status', 'assignedTo', 'notes'];

function detectUrgency(summary = '') {
  const text = String(summary).toLowerCase();
  const urgentTerms = ['abuse', 'unsafe', 'harm', 'emergency', 'danger', 'violence'];
  return urgentTerms.some((term) => text.includes(term)) ? 'urgent' : 'normal';
}

router.get('/', allow('pastor', 'super_admin', 'care', 'admin'), (req, res) => {
  let requests = repos.counselling.all().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (req.query.status) requests = requests.filter((r) => r.status === req.query.status);
  res.json(requests);
});

router.post('/', allow('pastor', 'super_admin', 'care', 'admin'), (req, res) => {
  requireFields(req.body, ['name', 'summary']);
  const data = pick(req.body, editable);
  data.status = data.status || 'Open';
  data.urgency = data.urgency || detectUrgency(data.summary);
  data.disclaimer = 'Pastoral care record. Do not use AI as a substitute for professional or emergency support.';
  const request = repos.counselling.create(data);
  audit.log(req, 'created', 'care_request', request.id, { urgency: request.urgency });
  res.status(201).json(request);
});

router.put('/:id', allow('pastor', 'super_admin', 'care'), (req, res) => {
  const updated = repos.counselling.update(req.params.id, pick(req.body, editable));
  if (!updated) return res.status(404).json({ error: 'Care request not found' });
  audit.log(req, 'updated', 'care_request', updated.id, { status: updated.status, urgency: updated.urgency });
  res.json(updated);
});

module.exports = router;
