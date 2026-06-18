const repos = require('../db/repositories');
const { hashPassword } = require('../utils/password');
const config = require('../config');

function todayMMDD() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function seedDemoData() {
  if (repos.users.all().length === 0) {
    repos.users.create({
      name: 'Pastor Admin',
      email: 'pastor@example.com',
      role: 'pastor',
      passwordHash: hashPassword('ChangeMe123!'),
      disabled: false
    });
  }

  if (repos.members.all().length === 0) {
    [
      // birthday format MM-DD — first member's birthday set to today for demo
      ['Pastor Emmanuel Okafor', '+2348011111111', 'Leaders', 'Core', todayMMDD()],
      ['Sister Ada Nwosu', '+2348022222222', 'Prayer', 'Core', '03-22'],
      ['Brother James Adeyemi', '+2348033333333', 'Choir', 'Core', '07-04'],
      ['Sister Grace Obi', '+2348044444444', 'Admin', 'Active', '11-15'],
      ['Brother Samuel Eze', '+2348055555555', 'Evangelism', 'Active', '02-14'],
      ['Sister Faith Okeke', '+2348066666666', 'Media', 'Active', '08-30'],
      ['Brother David Chukwu', '+2348077777777', 'Finance', 'Core', '12-01']
    ].forEach(([name, phone, department, dedicationLevel, birthday]) => {
      repos.members.create({
        name,
        firstName: name.split(' ')[1] || name.split(' ')[0],
        phone,
        whatsapp: phone,
        birthday,
        department,
        dedicationLevel,
        active: true,
        joinDate: new Date().toISOString().slice(0, 10),
        notes: ''
      });
    });
  }

  if (repos.events.all().length === 0) {
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString().slice(0, 10);
    repos.events.create({
      name: 'Weekly Fellowship Prayer',
      date,
      time: '19:00',
      type: 'Prayer',
      location: 'Online / WhatsApp',
      description: 'Weekly fellowship prayer meeting',
      targetGroup: 'All Members',
      status: 'Upcoming'
    });
  }

  if (!repos.settings.get().fellowshipName) {
    repos.settings.save({
      fellowshipName: config.fellowshipName,
      pastorName: config.pastorName,
      timezone: config.timezone,
      approvalRequiredForWhatsApp: true,
      safeguardingLead: 'Pastor / Care Team Lead'
    });
  }
}

module.exports = { seedDemoData };
