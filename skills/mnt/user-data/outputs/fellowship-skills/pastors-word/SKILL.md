# Skill: Pastor's Word — Weekly Devotional

## Purpose
Every Monday morning, drafts a warm, Spirit-led devotional message from the
pastor's desk and sends it to all members. The pastor reviews and approves
before it goes out, or can customise the draft. Also sends a short midweek
encouragement on Wednesday.

## Triggers
- **Scheduled**: Every Monday at 6:30 AM — draft devotional, send to pastor for review
- **Scheduled**: Every Wednesday at 9:00 AM — send midweek encouragement (auto, no review)
- **Manual**: "draft pastor's word", "write devotional for this week",
  "send pastor's message", "write encouragement for [theme]"

## Data Sources
- Airtable base: `Fellowship Content`
  - Table: `PastorNotes` — fields: Date, Theme, Scripture, Notes, Status
  - Table: `SentMessages` — fields: Date, Type, Content, SentAt (audit log)
- Pastor WhatsApp (for draft delivery and approval)
- All Members WhatsApp group (for final delivery)

## Actions

### 1. Monday devotional draft (runs 6:30 AM Monday)
```
1. Check Airtable PastorNotes for any theme/scripture pastor logged this week
   (Pastor can pre-log by messaging agent: "This week's theme: faith over fear,
   scripture: Hebrews 11:1")
2. If theme found: generate devotional based on pastor's notes
3. If no theme: generate fresh devotional using Claude API (see prompt below)
4. Send draft to pastor's private WhatsApp for approval
5. Wait up to 2 hours for response:
   - Pastor replies SEND → broadcast to all members
   - Pastor replies EDIT [text] → agent revises and resends for approval
   - Pastor replies with own text → agent formats it and sends that instead
   - No reply after 2 hours → send gentle reminder, wait 1 more hour
   - Still no reply → hold message, notify pastor it was held
```

### 2. Devotional generation prompt (Claude API)
```
System prompt:
  You are writing a weekly devotional message on behalf of a Pentecostal/
  Charismatic pastor to approximately 100 fellowship members. The message
  should feel personal, warm, and Spirit-filled — not like a sermon outline
  but like a loving letter from a father/mother in the faith.

  Structure:
  1. A warm Monday greeting (2 sentences)
  2. A key scripture (one verse, written out in full)
  3. A short reflection on that scripture (3–4 sentences, practical and
     encouraging — relatable to everyday life)
  4. A declaration/prayer the member can speak over themselves today
     (2–3 bold, faith-filled sentences)
  5. A closing blessing (1–2 sentences)

  Tone: Warm, faith-filled, personal, uplifting. Not preachy.
  Length: 200–250 words maximum. WhatsApp readable — short paragraphs.
  Do not use religious jargon or overly formal language.
  [If theme provided]: Base the message on this theme: {THEME}
  [If scripture provided]: Use this scripture: {SCRIPTURE}
```

### 3. Monday devotional format (final message to all members)
```
"Good morning, beloved family! 🌅

[Devotional body — 200-250 words]

📖 [SCRIPTURE REFERENCE]

[Reflection]

🗣️ Declare this today:
[Declaration]

[Closing blessing]

Have a blessed and fruitful week! 🙏❤️

— Pastor [Name]
[Fellowship Name]"
```

### 4. Wednesday midweek encouragement (runs 9:00 AM Wednesday, no approval needed)
```
Generate a shorter encouragement (80–100 words max):
- One uplifting scripture
- One sentence of encouragement tied to the scripture
- A short prayer or declaration
- Reminder of that evening's prayer (if Wednesday prayer is scheduled)

Message template:
  "Midweek check-in! 🌿

   [Scripture + encouragement]

   🙏 Prayer: [Short prayer]

   [If prayer tonight]: Don't forget — we gather for prayer tonight at 7 PM.
   Come and be refreshed! See you there. ❤️

   — Pastor [Name]"
```

### 5. Pastor pre-logs a theme (any time)
```
Pastor messages agent: "This week's theme is breakthrough, use Romans 8:37"
Agent responds: "Noted, Pastor! I'll use the theme 'breakthrough' with
Romans 8:37 for Monday's devotional. I'll have the draft ready for your
review Monday morning at 6:30 AM."
Agent writes to Airtable PastorNotes: {Date: next Monday, Theme: "breakthrough",
Scripture: "Romans 8:37", Status: "pending"}
```

### 6. Audit log
Every message sent is written to Airtable SentMessages table with:
- Date and time sent
- Message type (Monday devotional / Wednesday encouragement)
- Full message content
- Whether pastor approved or auto-sent

## Error Handling
- If Claude API unavailable: use a pre-stored fallback devotional from Airtable
- If pastor does not respond in 3 hours: hold message and log "held — awaiting pastor"
- Never auto-send the Monday devotional without pastor approval
- Wednesday encouragement may auto-send (no approval required)

## Permissions
- Read/write: Airtable (PastorNotes, SentMessages tables)
- Send messages: Pastor WhatsApp (private draft), All Members WhatsApp group
- Read/write: Claude API (devotional generation)
- Monday devotional: REQUIRES pastor approval before broadcast
- Wednesday encouragement: auto-sends, no approval required
