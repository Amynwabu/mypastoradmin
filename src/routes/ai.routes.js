const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const { requireFields } = require('../utils/sanitize');
const aiService = require('../services/aiService');
const audit = require('../services/auditService');

const router = express.Router();
router.use(authenticate, allow('pastor', 'super_admin', 'admin', 'media', 'care'));

router.post('/draft', async (req, res, next) => {
  try {
    requireFields(req.body, ['type']);
    const result = await aiService.draft(req.body.type, req.body.context || {}, repos.settings.get());
    const msg = repos.messages.create({
      type: `AI Draft: ${req.body.type}`,
      content: result.draft,
      status: 'Draft - approval required',
      recipient: req.body.context?.name || 'Draft',
      createdBy: req.user.name,
      provider: result.provider
    });
    audit.log(req, 'created', 'ai_draft', msg.id, { type: req.body.type, provider: result.provider });
    res.json({ draft: result.draft, message: msg, provider: result.provider });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
