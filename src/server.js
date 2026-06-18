const express = require('express');
const path = require('path');
const config = require('./config');
const { securityHeaders, corsGuard, rateLimit } = require('./middleware/security');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { seedDemoData } = require('./services/seedService');
const { startCronJobs } = require('./services/cronService');

const app = express();

app.use(corsGuard);
app.use(securityHeaders);
app.use(rateLimit({ windowMs: 60_000, max: 180 }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

if (config.seedDemo) seedDemoData();
startCronJobs();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '3.0.0', app: config.appName, timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/members', require('./routes/members.routes'));
app.use('/api/events', require('./routes/events.routes'));
app.use('/api/prayer', require('./routes/prayer.routes'));
app.use('/api/messages', require('./routes/messages.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/care', require('./routes/care.routes'));
app.use('/api/finance', require('./routes/finance.routes'));
app.use('/api/evangelism', require('./routes/evangelism.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

app.use('/api', notFound);
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`\n🙏 ${config.appName} running at http://localhost:${config.port}`);
    console.log('   Default demo login: pastor@example.com / ChangeMe123!');
    console.log('   Change the password and JWT_SECRET before real deployment.\n');
  });
}

module.exports = app;
