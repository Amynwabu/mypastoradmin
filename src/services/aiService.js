const config = require('../config');

const allowedTypes = new Set(['devotional', 'birthday', 'announcement', 'appreciation', 'care_acknowledgement', 'follow_up']);

function buildPrompt(type, context = {}, settings = {}) {
  const pastorName = settings.pastorName || config.pastorName;
  const fellowshipName = settings.fellowshipName || config.fellowshipName;
  const prompts = {
    devotional: `Write a concise Monday devotional from ${pastorName} to ${fellowshipName}. Include a Bible verse reference, short reflection, declaration, and blessing. Keep it WhatsApp-readable and under 250 words. Theme: ${context.theme || 'walking with God'}.`,
    birthday: `Write a heartfelt birthday prayer from ${pastorName} of ${fellowshipName} to ${context.name || 'a beloved member'} in ${context.department || 'the fellowship'}. Keep it personal, warm, scripture-based, and under 160 words.`,
    announcement: `Write a warm church WhatsApp announcement for ${fellowshipName}. Event: ${context.eventName || 'Fellowship Meeting'}. Date: ${context.date || 'TBA'}. Time: ${context.time || 'TBA'}. Location: ${context.location || 'TBA'}. Details: ${context.description || ''}. Keep it under 160 words.`,
    appreciation: `Write a weekly appreciation note from ${pastorName} to ${context.name || 'a faithful member'} serving in ${context.department || 'the fellowship'}. Make it sincere, kingdom-focused, and under 160 words.`,
    care_acknowledgement: `Write a safe pastoral care acknowledgement for someone who requested prayer. Do not diagnose or act as a therapist. Encourage them that the care team will follow up. Keep it compassionate and under 120 words. Situation summary: ${context.summary || ''}.`,
    follow_up: `Write a friendly evangelism follow-up message for ${context.name || 'a visitor'} after ${context.eventName || 'a fellowship event'}. Warmly invite further connection. Keep it under 120 words.`
  };
  return prompts[type] || prompts.devotional;
}

async function draft(type, context, settings) {
  if (!allowedTypes.has(type)) {
    const error = new Error('Unsupported AI draft type');
    error.statusCode = 400;
    throw error;
  }
  const prompt = buildPrompt(type, context, settings);
  if (!config.ai.anthropicKey) {
    return {
      provider: 'template-fallback',
      draft: `[Draft generated without live AI]\n\n${prompt}\n\nSet ANTHROPIC_API_KEY in .env to enable live AI generation.`
    };
  }
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: config.ai.anthropicKey });
  const message = await client.messages.create({
    model: config.ai.model,
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }]
  });
  return { provider: 'anthropic', draft: message.content?.[0]?.text || '' };
}

module.exports = { draft, buildPrompt };
