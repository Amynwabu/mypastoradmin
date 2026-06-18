# Skill: Fellowship Birthday Greetings

## Purpose
Each morning, checks the member database for birthdays that day and sends
each celebrating member a warm, personalised prayer-birthday message from
the pastor. Also notifies the fellowship group to celebrate together.

## Triggers
- **Scheduled**: Every day at 8:00 AM — check for birthdays and send greetings
- **Scheduled**: First day of each month — preview that month's birthdays for pastor
- **Manual**: "who has a birthday today", "send birthday message to [name]",
  "birthdays this month", "show upcoming birthdays"

## Data Sources
- Airtable base: `Fellowship Members`
  - Table: `Members` — fields: Name, Phone, WhatsApp, Birthday (MM-DD),
    BirthYear (optional), Department, Active, BirthdayMessageSent (date last sent)

## Actions

### 1. Daily birthday check (runs 8:00 AM every day)
```
1. Query Airtable Members — filter Birthday = today's MM-DD, Active = true
2. For each birthday member:
   a. Compose personalised message (see template)
   b. Send to member's individual WhatsApp
   c. Update BirthdayMessageSent field in Airtable to today's date
   d. Queue group announcement (see step 3)
3. If no birthdays today: do nothing, log "No birthdays today"
```

### 2. Personal birthday message (sent to individual member)
```
Message template (compose fresh with Claude API for each person — vary the
scripture and tone slightly so it never feels copy-pasted):

"Happy Birthday, [FirstName]! 🎂🎉

On this special day, I celebrate the gift that you are — not just to this
fellowship, but to the Kingdom of God.

May the Lord bless you and keep you;
May His face shine upon you and be gracious to you;
May He lift up His countenance upon you and give you peace.
— Numbers 6:24-26

[Add one personalised line if department is known, e.g.:]
- Prayer team: "Your intercessions are a sweet fragrance before God."
- Choir: "May your voice continue to usher in His presence."
- Admin: "Your faithful service behind the scenes does not go unnoticed."
- Evangelism: "May you win many more souls in this new year of your life."

This year, may every door that needs to open, open. May every burden lift.
May you walk in health, joy, and supernatural increase.

You are deeply loved and valued. 🙏

— Pastor [PastorName] & the [FellowshipName] Family"
```

### 3. Group celebration announcement
```
Trigger: After personal message is sent, post to All Members WhatsApp group

Message template:
  "🎂 Birthday Celebration! 🎂

   Join me in celebrating our beloved [FullName] today!

   [FirstName] is a treasured member of our [Department] family and we
   are so grateful for their life and dedication to God's work.

   Please send [FirstName] your love and birthday wishes today! 🙌🙏

   — Pastor"
```

### 4. Monthly birthday preview (1st of each month, sent to pastor only)
```
1. Query all members with birthdays in current month
2. Sort by date
3. Send to pastor WhatsApp:
   "Pastor, here are the birthdays coming up this month:

   [Date] — [Name] ([Department])
   [Date] — [Name] ([Department])
   ...

   Total: [N] birthdays this month.
   I will send personal greetings and group announcements automatically
   on each person's birthday. No action needed from you."
```

### 5. Manual trigger by pastor
```
Pastor says: "Send birthday message to Sister Ada"
Agent:
1. Looks up Ada in Airtable
2. Confirms: "Sister Ada Okonkwo has a birthday on [date].
   Send birthday message now? (YES/NO)"
3. On YES: sends personal message and group announcement immediately
```

## Error Handling
- If member's WhatsApp number is invalid: log error, notify pastor
- If Claude API fails to generate message: use a safe fallback template
- If BirthdayMessageSent = today (already sent): skip, do not double-send
- If birth year not stored, do not mention age in message (privacy)

## Database Update via Google Form
When a new member fills the Google Form:
- Birthday field format: DD/MM (day and month only — year optional)
- Agent confirms new member added: notifies pastor with member summary

## Permissions
- Read/write: Airtable (Members table — read birthday, write BirthdayMessageSent)
- Send messages: Individual member WhatsApp, All Members WhatsApp group
- Read: Claude API (for message generation)
- No pastor approval required — runs fully automatically
