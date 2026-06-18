function cleanString(value, max = 500) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max);
}

function requireFields(body, fields) {
  const missing = fields.filter((field) => !cleanString(body[field]));
  if (missing.length) {
    const error = new Error(`Missing required field(s): ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
}

function pick(body, allowed) {
  return allowed.reduce((out, key) => {
    if (body[key] !== undefined) out[key] = typeof body[key] === 'string' ? cleanString(body[key], 2000) : body[key];
    return out;
  }, {});
}

module.exports = { cleanString, requireFields, pick };
