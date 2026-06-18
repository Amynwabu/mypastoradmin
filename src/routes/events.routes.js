const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const { requireFields, pick } = require('../utils/sanitize');
const audit = require('../services/auditService');

const router = express.Router();
router.use(authenticate);

const editable = ['name', 'date', 'time', 'type', 'location', 'description', 'targetGroup', 'status'];

router.get('/', (req, res) => {
  let events = repos.events.all().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  if (req.query.upcoming === 'true') {
    const today = new Date().toISOString().slice(0, 10);
    events = events.filter((e) => e.date >= today);
  }
  res.json(events);
});

router.post('/', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  requireFields(req.body, ['name', 'date', 'time']);
  const event = repos.events.create({ ...pick(req.body, editable), status: req.body.status || 'Upcoming' });
  audit.log(req, 'created', 'event', event.id, { name: event.name });
  res.status(201).json(event);
});

router.put('/:id', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  const event = repos.events.update(req.params.id, pick(req.body, editable));
  if (!event) return res.status(404).json({ error: 'Event not found' });
  audit.log(req, 'updated', 'event', event.id, { name: event.name });
  res.json(event);
});

router.delete('/:id', allow('pastor', 'super_admin'), (req, res) => {
  const ok = repos.events.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Event not found' });
  audit.log(req, 'deleted', 'event', req.params.id);
  res.json({ success: true });
});

module.exports = router;
