const express = require('express');
const repos = require('../db/repositories');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const members = repos.members.all();
  const events = repos.events.all();
  const messages = repos.messages.all();
  const prayer = repos.prayer.all();
  const care = repos.counselling.all();
  const evangelism = repos.evangelism.all();
  const active = members.filter((m) => m.active);
  const byDepartment = active.reduce((acc, m) => ({ ...acc, [m.department || 'General']: (acc[m.department || 'General'] || 0) + 1 }), {});
  const byDedication = active.reduce((acc, m) => ({ ...acc, [m.dedicationLevel || 'Regular']: (acc[m.dedicationLevel || 'Regular'] || 0) + 1 }), {});
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(5, 7);
  res.json({
    totals: {
      members: active.length,
      events: events.length,
      prayerSessions: prayer.length,
      drafts: messages.length,
      openCareRequests: care.filter((r) => r.status !== 'Closed').length,
      evangelismContacts: evangelism.length
    },
    byDepartment,
    byDedication,
    birthdaysThisMonth: active.filter((m) => String(m.birthday || '').startsWith(thisMonth)).map((m) => ({ name: m.name, birthday: m.birthday, department: m.department })),
    upcomingEvents: events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5),
    recentMessages: messages.slice(-5).reverse()
  });
});

module.exports = router;
