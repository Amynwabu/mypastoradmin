/**
 * Scheduled jobs for MyPastorAdmin.
 *
 * Jobs:
 *  08:00 daily  — birthday check → AI draft queued for pastor approval
 *  07:00 Mon    — prayer reminder to all active members
 *  09:00 Wed    — midweek encouragement (auto-send)
 */

const cron = require('node-cron');
const repos = require('../db/repositories');
const aiService = require('./aiService');
const whatsapp = require('./whatsappService');
const config = require('../config');

function todayMMDD() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

// ── Birthday check ─────────────────────────────────────────────────────────
async function runBirthdayCheck() {
  const today = todayMMDD();
  const settings = repos.settings.get();
  const birthday = repos.members.all().filter(
    (m) => m.active && m.birthday && m.birthday.slice(0, 5) === today
  );

  for (const member of birthday) {
    console.log(`[Cron] 🎂 Birthday: ${member.name}`);
    try {
      const result = await aiService.draft('birthday', {
        name: member.name,
        department: member.department
      }, settings);

      repos.messages.create({
        type: 'birthday',
        recipient: member.name,
        recipientPhone: member.whatsapp || member.phone,
        content: result.draft,
        status: 'Pending',
        triggeredBy: 'birthday-cron',
        provider: result.provider
      });
      console.log(`[Cron] Birthday draft queued for ${member.name} — awaiting pastor approval`);
    } catch (err) {
      console.error(`[Cron] Birthday draft failed for ${member.name}:`, err.message);
    }
  }
}

// ── Prayer reminder ────────────────────────────────────────────────────────
async function runPrayerReminder() {
  const settings = repos.settings.get();
  const name = settings.fellowshipName || config.fellowshipName;
  const text = `🙏 Good morning from ${name}!\n\nThis is your Monday prayer reminder. Let's start the week in prayer together. May God's presence guide our steps this week.\n\n"The effective, fervent prayer of a righteous man avails much." — James 5:16`;

  const members = repos.members.all().filter((m) => m.active);
  let sent = 0;
  for (const m of members) {
    const phone = m.whatsapp || m.phone;
    if (!phone) continue;
    const result = await whatsapp.sendMessage(phone, text);
    if (result.sent) sent++;
  }
  console.log(`[Cron] Prayer reminder sent to ${sent}/${members.length} members`);
}

// ── Midweek encouragement ─────────────────────────────────────────────────
async function runMidweekEncouragement() {
  const settings = repos.settings.get();
  const pastor = settings.pastorName || config.pastorName;
  const name = settings.fellowshipName || config.fellowshipName;
  const text = `✨ Midweek encouragement from ${name}!\n\nYou're halfway through the week — keep going! God is with you in every moment.\n\n"I can do all things through Christ who strengthens me." — Philippians 4:13\n\n— ${pastor}`;

  const members = repos.members.all().filter((m) => m.active);
  let sent = 0;
  for (const m of members) {
    const phone = m.whatsapp || m.phone;
    if (!phone) continue;
    const result = await whatsapp.sendMessage(phone, text);
    if (result.sent) sent++;
  }
  console.log(`[Cron] Midweek encouragement sent to ${sent}/${members.length} members`);
}

// ── Register all cron jobs ─────────────────────────────────────────────────
function startCronJobs() {
  const tz = config.timezone || 'Europe/London';

  // 08:00 every day — birthday check
  cron.schedule('0 8 * * *', () => {
    console.log('[Cron] Running birthday check…');
    runBirthdayCheck().catch(console.error);
  }, { timezone: tz });

  // 07:00 every Monday — prayer reminder
  cron.schedule('0 7 * * 1', () => {
    console.log('[Cron] Running Monday prayer reminder…');
    runPrayerReminder().catch(console.error);
  }, { timezone: tz });

  // 09:00 every Wednesday — midweek encouragement (auto)
  cron.schedule('0 9 * * 3', () => {
    console.log('[Cron] Running midweek encouragement…');
    runMidweekEncouragement().catch(console.error);
  }, { timezone: tz });

  console.log(`[Cron] Jobs registered (timezone: ${tz})`);
}

module.exports = { startCronJobs, runBirthdayCheck, runPrayerReminder, runMidweekEncouragement };
