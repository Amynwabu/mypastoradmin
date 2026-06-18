const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const { requireFields, pick } = require('../utils/sanitize');
const audit = require('../services/auditService');

const router = express.Router();
router.use(authenticate);

const editable = ['date', 'session', 'time', 'ministerIds', 'ministerNames', 'status', 'type', 'notes'];

router.get('/', (req, res) => {
  res.json(repos.prayer.all().sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)));
});

router.post('/', allow('pastor', 'super_admin', 'admin', 'department_lead'), (req, res) => {
  requireFields(req.body, ['date', 'session', 'time']);
  const session = repos.prayer.create({ ...pick(req.body, editable), status: req.body.status || 'Scheduled' });
  audit.log(req, 'created', 'prayer_session', session.id, { session: session.session });
  res.status(201).json(session);
});

router.put('/:id', allow('pastor', 'super_admin', 'admin', 'department_lead'), (req, res) => {
  const updated = repos.prayer.update(req.params.id, pick(req.body, editable));
  if (!updated) return res.status(404).json({ error: 'Prayer session not found' });
  audit.log(req, 'updated', 'prayer_session', updated.id, { session: updated.session });
  res.json(updated);
});

router.post('/generate', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  const ministers = repos.members.all().filter((m) => m.department === 'Prayer' && m.active);
  if (ministers.length < 2) return res.status(400).json({ error: 'Need at least 2 active prayer ministers' });
  const schedule = repos.prayer.all();
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() + ((1 - today.getDay() + 7) % 7 || 7));
  const recentIds = schedule.slice(-6).flatMap((s) => s.ministerIds || []);
  const available = ministers.filter((m) => !recentIds.includes(m.id));
  const pool = available.length >= 2 ? available : ministers;
  const mondayMinisters = pool.slice(0, 2);
  const wedMinister = ministers.find((m) => !mondayMinisters.map((x) => x.id).includes(m.id)) || ministers[0];
  const friMinister = ministers.find((m) => m.id !== wedMinister.id && !mondayMinisters.map((x) => x.id).includes(m.id)) || ministers[1] || ministers[0];
  const wed = new Date(monday); wed.setDate(monday.getDate() + 2);
  const fri = new Date(monday); fri.setDate(monday.getDate() + 4);
  const sessions = [
    { date: monday.toISOString().slice(0, 10), session: 'Monday Prayer Team', time: '06:00', ministerIds: mondayMinisters.map((m) => m.id), ministerNames: mondayMinisters.map((m) => m.name), status: 'Scheduled', type: 'closed' },
    { date: wed.toISOString().slice(0, 10), session: 'Wednesday Fellowship Prayer', time: '19:00', ministerIds: [wedMinister.id], ministerNames: [wedMinister.name], status: 'Scheduled', type: 'open' },
    { date: fri.toISOString().slice(0, 10), session: 'Friday Fellowship Prayer', time: '19:00', ministerIds: [friMinister.id], ministerNames: [friMinister.name], status: 'Scheduled', type: 'open' }
  ].map((s) => repos.prayer.create(s));
  audit.log(req, 'generated', 'prayer_schedule', 'weekly', { count: sessions.length });
  res.json({ generated: sessions.length, sessions });
});

module.exports = router;
