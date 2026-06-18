const store = require('./jsonStore');

const tables = {
  users: 'users',
  members: 'members',
  events: 'events',
  prayer: 'prayer_schedule',
  messages: 'messages',
  settings: 'settings',
  counselling: 'counselling_requests',
  finance: 'transactions',
  evangelism: 'evangelism_contacts',
  audit: 'audit_logs'
};

function repo(table, prefix) {
  return {
    all: () => store.all(table),
    find: (id) => store.findById(table, id),
    create: (data) => store.insert(table, data, prefix),
    update: (id, patch) => store.update(table, id, patch),
    delete: (id) => store.remove(table, id),
    replace: (rows) => store.replace(table, rows)
  };
}

module.exports = {
  users: repo(tables.users, 'usr'),
  members: repo(tables.members, 'mem'),
  events: repo(tables.events, 'evt'),
  prayer: repo(tables.prayer, 'pry'),
  messages: repo(tables.messages, 'msg'),
  counselling: repo(tables.counselling, 'car'),
  finance: repo(tables.finance, 'fin'),
  evangelism: repo(tables.evangelism, 'evg'),
  audit: repo(tables.audit, 'aud'),
  settings: {
    get: () => store.all(tables.settings)[0] || {},
    save: (settings) => {
      const row = { ...settings, updatedAt: store.now() };
      store.replace(tables.settings, [row]);
      return row;
    }
  }
};
