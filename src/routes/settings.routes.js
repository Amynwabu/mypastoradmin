const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const audit = require('../services/auditService');
const { runBirthdayCheck, runPrayerReminder, runMidweekEncouragement } = require('../services/cronService');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => res.json(repos.settings.get()));

router.put('/', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  const saved = repos.settings.save(req.body || {});
  audit.log(req, 'updated', 'settings', 'global');
  res.json(saved);
});

// Legacy POST alias
router.post('/', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  const saved = repos.settings.save(req.body || {});
  audit.log(req, 'updated', 'settings', 'global');
  res.json(saved);
});

// Manual cron triggers for testing
router.post('/trigger/birthday-check', allow('pastor', 'super_admin'), async (req, res, next) => {
  try {
    await runBirthdayCheck();
    const msgs = repos.messages.all().filter(m => m.triggeredBy === 'birthday-cron');
    audit.log(req, 'triggered', 'cron', 'birthday-check');
    res.json({ ok: true, queued: msgs.length, message: 'Birthday check complete — any drafts are queued in Messages for approval.' });
  } catch (err) { next(err); }
});

router.post('/trigger/prayer-reminder', allow('pastor', 'super_admin'), async (req, res, next) => {
  try {
    await runPrayerReminder();
    audit.log(req, 'triggered', 'cron', 'prayer-reminder');
    res.json({ ok: true, message: 'Prayer reminder sent to all active members.' });
  } catch (err) { next(err); }
});

router.post('/trigger/midweek', allow('pastor', 'super_admin'), async (req, res, next) => {
  try {
    await runMidweekEncouragement();
    audit.log(req, 'triggered', 'cron', 'midweek');
    res.json({ ok: true, message: 'Midweek encouragement sent to all active members.' });
  } catch (err) { next(err); }
});

module.exports = router;
