const express = require('express');
const repos = require('../db/repositories');
const { authenticate, allow } = require('../middleware/auth');
const audit = require('../services/auditService');
const whatsapp = require('../services/whatsappService');

const router = express.Router();
router.use(authenticate);

router.get('/', allow('pastor', 'super_admin', 'admin'), (req, res) => res.json(repos.messages.all().slice(-100).reverse()));

// Approve a message (moves to Approved status, ready to send)
router.patch('/:id/approve', allow('pastor', 'super_admin', 'admin'), (req, res) => {
  const message = repos.messages.update(req.params.id, {
    status: 'Approved',
    approvedBy: req.user.name,
    approvedAt: new Date().toISOString()
  });
  if (!message) return res.status(404).json({ error: 'Message not found' });
  audit.log(req, 'approved', 'message', message.id);
  res.json(message);
});

// Send an approved message via WhatsApp
router.post('/:id/send', allow('pastor', 'super_admin', 'admin'), async (req, res, next) => {
  try {
    const message = repos.messages.find(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.status !== 'Approved') {
      return res.status(400).json({ error: 'Message must be approved before sending' });
    }

    // Determine recipient phone — may be stored on message or looked up from members
    let phone = message.recipientPhone || req.body.phone || '';
    if (!phone && message.recipient) {
      const member = repos.members.all().find(
        (m) => m.name.toLowerCase() === message.recipient.toLowerCase()
      );
      phone = member?.whatsapp || member?.phone || '';
    }

    if (!phone) {
      return res.status(400).json({
        error: 'No phone number found for this recipient. Provide one in the request body: { "phone": "+447..." }'
      });
    }

    const result = await whatsapp.sendMessage(phone, message.content);

    const updated = repos.messages.update(message.id, {
      status: result.sent ? 'Sent' : 'Send Failed',
      sentAt: result.sent ? new Date().toISOString() : undefined,
      sentBy: req.user.name,
      sentTo: phone,
      whatsappSid: result.sid,
      sendError: result.error
    });

    audit.log(req, result.sent ? 'sent' : 'send_failed', 'message', message.id, {
      phone,
      provider: result.provider,
      sid: result.sid
    });

    res.json({ success: result.sent, message: updated, provider: result.provider, sid: result.sid, error: result.error });
  } catch (err) {
    next(err);
  }
});

// Broadcast a message to all active members (or a filtered group)
router.post('/broadcast', allow('pastor', 'super_admin'), async (req, res, next) => {
  try {
    const { content, department, recipientLabel } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    let members = repos.members.all().filter((m) => m.active);
    if (department) members = members.filter((m) => m.department === department);

    const results = [];
    for (const member of members) {
      const phone = member.whatsapp || member.phone;
      if (!phone) { results.push({ name: member.name, sent: false, error: 'no phone' }); continue; }
      const result = await whatsapp.sendMessage(phone, content);
      results.push({ name: member.name, phone, sent: result.sent, sid: result.sid, error: result.error });
    }

    // Save a record of the broadcast
    const record = repos.messages.create({
      type: 'broadcast',
      recipient: recipientLabel || (department ? `${department} members` : 'All Members'),
      content,
      status: 'Sent',
      sentAt: new Date().toISOString(),
      sentBy: req.user.name,
      broadcastCount: results.filter((r) => r.sent).length
    });

    audit.log(req, 'broadcast', 'message', record.id, { sent: results.filter((r) => r.sent).length, total: members.length });
    res.json({ sent: results.filter((r) => r.sent).length, total: members.length, results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
