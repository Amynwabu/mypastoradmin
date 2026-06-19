# Skill: Dedicated Member Care & Appreciation

## Purpose
Identifies dedicated and faithful members from the database and sends them
weekly personalised, love-driven appreciation messages to keep them motivated,
valued, and committed. Also tracks member engagement and alerts the pastor
when a previously active member goes quiet.

## Triggers
- **Scheduled**: Every Friday at 4:00 PM — send weekly appreciation to dedicated members
- **Scheduled**: Every Monday at 7:00 AM — flag members who have been inactive/quiet
- **Manual**: "send appreciation to [name]", "who are our dedicated members",
  "check member engagement", "send encouragement to [department]"

## Data Sources
- Airtable base: `Fellowship Members`
  - Table: `Members` — fields: Name, Phone, WhatsApp, Department, DedicationLevel
    (values: Core, Active, Regular, Irregular), JoinDate, LastSeen, Active,
    AppreciationSentDate, Notes
  - Table: `EngagementLog` — fields: MemberName, Date, Type, Notes

## Dedicated Member Tiers

| Tier | Description | Frequency of special message |
|---|---|---|
| Core | Leaders, department heads, long-serving members | Weekly (every Friday) |
| Active | Consistently attend and serve | Bi-weekly (every other Friday) |
| Regular | Attend most events | Monthly |
| Irregular | Sporadic attendance — need follow-up | Alert pastor, do not send group message |

## Actions

### 1. Friday appreciation run (runs 4:00 PM every Friday)
```
1. Query Airtable Members — filter DedicationLevel IN ["Core","Active"], Active = true
2. Apply frequency filter:
   - Core: always include
   - Active: include if AppreciationSentDate is more than 13 days ago
3. For each qualifying member:
   a. Generate personalised message using Claude API (see prompt below)
   b. Send to member's individual WhatsApp
   c. Update AppreciationSentDate in Airtable
4. Send summary to pastor:
   "Pastor, I sent appreciation messages to [N] dedicated members today:
   Core members: [list]
   Active members: [list]
   All messages delivered. ✅"
```

### 2. Appreciation message generation prompt (Claude API)
```
System prompt:
  You are writing a personal appreciation message on behalf of a pastor to
  a dedicated member of a Christian fellowship. The member's name is {NAME}
  and they serve in the {DEPARTMENT} department. They have been with the
  fellowship since {JOIN_DATE}.

  The message should:
  - Feel like it comes from a caring pastor who genuinely values this person
  - Be specific to their role/department where possible
  - Include a short scripture of encouragement
  - Affirm their faithfulness and its eternal significance
  - End with a warm blessing
  - NOT feel generic or templated — vary the opening, structure, and scripture
    each time so the member never feels like they received a mass message

  Length: 120–160 words. WhatsApp-readable paragraphs.
  Tone: Heartfelt, specific, Spirit-filled, and personal.

  Department context:
  - Prayer team: their intercession holds up the fellowship
  - Choir: their worship ushers in God's presence
  - Admin: their faithfulness behind the scenes builds the Kingdom
  - Protocol/Usher: their service creates an atmosphere of honour
  - Media: their work extends the ministry's reach
  - Finance: their integrity and stewardship honour God
  - Evangelism: their boldness wins souls
  - Hospitality: their warmth reflects God's love
  - Follow-up: their care stops people from falling through the cracks
  - Baby Shower: their compassion carries others' faith journey
```

### 3. Appreciation message format
```
"Dear [Name], 💛

[Personalised body — 120-160 words]

📖 [Scripture]

[Reflection/affirmation tied to their role]

[Blessing]

Thank you for being YOU. The Kingdom needs more people like [FirstName]. 🙏

With love and gratitude,
Pastor [Name]"
```

### 4. Monday engagement check (runs 7:00 AM Monday)
```
1. Query all Active members — check LastSeen field
2. Flag anyone not seen (no WhatsApp activity, no event attendance logged) in:
   - 2 weeks: send gentle check-in message (see template below)
   - 4 weeks: alert pastor privately ("Sister [Name] has not been seen in 4 weeks")
   - 6+ weeks: escalate — mark as needing pastoral visit, alert pastor with note
3. Log all checks to EngagementLog table
```

### 5. Gentle check-in message (sent to quiet member)
```
"Hello [Name]! 😊

We've been missing you in the fellowship this week and just wanted to check in.

You are always in our prayers and we love having you around. Is everything okay?

Please know that our doors — and hearts — are always open to you. We are here
for you in every season. 🙏

God bless you.
— [Fellowship Name] Family"
```

### 6. Manual appreciation by pastor
```
Pastor says: "Send appreciation to Brother James in choir"
Agent:
1. Looks up James in Airtable (confirms department = Choir)
2. Generates personalised message
3. Previews to pastor: "Here is the message I'll send to Brother James:
   [message preview]
   Reply SEND to approve or EDIT [changes] to revise."
4. Sends on approval, logs in Airtable
```

### 7. Department group encouragement
```
Pastor says: "Send encouragement to the admin team"
Agent:
1. Pulls all members in Admin department (DedicationLevel = Core or Active)
2. Generates one group message appropriate for the whole team
3. Previews to pastor for approval
4. Sends to each admin member individually (personalised greeting,
   same body — NOT a group forward)
```

## Error Handling
- Never send duplicate appreciation in the same week (check AppreciationSentDate)
- If Claude API unavailable: queue message for 1 hour retry, then use fallback
- If member's number is invalid: log, notify pastor
- Never mark a member as "irregular" without pastor confirmation

## Permissions
- Read/write: Airtable (Members table, EngagementLog table)
- Send messages: Individual member WhatsApp (never group for appreciation)
- Read: Claude API (message generation)
- Appreciation messages: auto-send (no approval required for Friday run)
- Check-in messages: auto-send for 2-week quiet members
- 4-week+ escalations: alert pastor only, do not auto-message member
