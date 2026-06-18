const crypto = require('crypto');

function generateId(prefix = '') {
  const id = crypto.randomBytes(8).toString('hex');
  return prefix ? `${prefix}_${id}` : id;
}

module.exports = { generateId };
