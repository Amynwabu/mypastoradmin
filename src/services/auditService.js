const repos = require('../db/repositories');

function log(req, action, entity, entityId, details = {}) {
  return repos.audit.create({
    actorId: req.user?.id || 'system',
    actorName: req.user?.name || 'System',
    actorRole: req.user?.role || 'system',
    action,
    entity,
    entityId,
    details,
    ip: req.ip,
    userAgent: req.headers['user-agent'] || ''
  });
}

module.exports = { log };
