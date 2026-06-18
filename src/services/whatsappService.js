/**
 * WhatsApp sending service.
 *
 * In production, set WHATSAPP_API_URL and WHATSAPP_API_TOKEN to your
 * WhatsApp Business API provider (e.g. 360dialog, Meta Cloud API, Twilio).
 * Without those vars the message is logged only — useful for testing.
 */

const config = require('../config');

const API_URL   = process.env.WHATSAPP_API_URL   || '';
const API_TOKEN = process.env.WHATSAPP_API_TOKEN  || '';
const FROM_NUMBER = process.env.WHATSAPP_FROM_NUMBER || '';

/**
 * Send a text message to a WhatsApp number.
 * Returns { sent: boolean, provider: string, sid?: string, error?: string }
 */
async function sendMessage(toNumber, text) {
  const to = normalisePhone(toNumber);
  if (!to) {
    return { sent: false, provider: 'none', error: 'Invalid phone number' };
  }

  // --- Live send via WhatsApp Business API ---
  if (API_URL && API_TOKEN) {
    try {
      const body = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text }
      };
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
      const sid = data.messages?.[0]?.id;
      console.log(`[WhatsApp] Sent to ${to} — sid: ${sid}`);
      return { sent: true, provider: 'whatsapp-api', sid };
    } catch (err) {
      console.error('[WhatsApp] Send failed:', err.message);
      return { sent: false, provider: 'whatsapp-api', error: err.message };
    }
  }

  // --- Simulation mode (no API configured) ---
  console.log(`[WhatsApp][SIMULATED] → ${to}`);
  console.log(`[WhatsApp][SIMULATED]   ${text.slice(0, 120)}…`);
  return { sent: true, provider: 'simulated', sid: `sim_${Date.now()}` };
}

/**
 * Normalise a phone number to E.164 format (digits only, leading +).
 * Returns null if the number looks invalid.
 */
function normalisePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length >= 10) return `+${digits}`;
  return null;
}

module.exports = { sendMessage };
