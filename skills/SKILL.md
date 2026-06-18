# Skill: Fellowship Prayer Schedule

## Purpose
Automatically generates the weekly prayer roster and sends WhatsApp reminders
to prayer ministers 24 hours before each session. Handles Monday prayer team
(closed group) and Wednesday/Friday fellowship prayer (all members).

## Triggers
- **Scheduled**: Every Sunday at 6:00 PM — generates the full week's schedule
- **Scheduled**: 24 hours before each prayer session — sends reminders to ministers on duty
- **Manual**: User says "generate prayer schedule", "who is praying this week",
  "send prayer reminders", "show prayer roster"

## Data Sources
- Airtable base: `Fellowship Members`
  - Table: `Prayer Ministers` — fields: Name, Phone, WhatsApp, Availability, LastRoster
  - Table: `Prayer Schedule` — fields: Date, Session, Ministers (linked), Status
- Google Calendar: events tagged `[PRAYER]`

## Schedule Logic

### Monday Prayer Team (closed — ministers only)
- Time: 6:00 AM – 7:00 AM
- Participants: Prayer team members only (filter Airtable by `Team = "Prayer"`)
- Minimum per session: 2 ministers
- Rotation rule: Do not assign same minister two Mondays in a row
  (check `LastRoster` field — skip if rostered in last 7 days)

### Wednesday Fellowship Prayer
- Time: 7:00 PM – 8:00 PM
- Participants: 1 lead minister + open to all members
- Lead minister rotates weekly from Prayer Ministers table

### Friday Fellowship Prayer
- Time: 7:00 PM – 8:00 PM
- Participants: 1 lead minister + open to all members
- Lead minister must differ from Wednesday's lead that same week

## Actions

### 1. Generate weekly roster (runs Sunday 6 PM)
```
1. Query Airtable Prayer Ministers — filter Active = true
2. Apply rotation logic (exclude recently rostered)
3. Assign: 2 ministers to Monday, 1 lead each to Wednesday and Friday
4. Write assignments back to Airtable Prayer Schedule table
5. Send summary to pastor WhatsApp:
   "Pastor, this week's prayer schedule is ready:
    Monday (Prayer Team): [Name1], [Name2]
    Wednesday (Lead): [Name3]
    Friday (Lead): [Name4]
    Reply APPROVE to send reminders or EDIT [day] [name] to change."
6. Wait for pastor approval before sending member reminders
```

### 2. Send minister reminders (24 hrs before session)
```
Trigger: 24 hours before each prayer session
Message template (Monday team):
  "Dear [Name], 🙏
   This is your reminder that you are on the Prayer Team this Monday,
   [Date] at 6:00 AM.
   Please come prepared in the spirit of intercession.
   God bless you richly. — Pastor"

Message template (Wednesday/Friday lead):
  "Dear [Name], 🙏
   You are leading fellowship prayer this [Wednesday/Friday],
   [Date] at 7:00 PM.
   Please prepare a short opening scripture and lead intercession
   for approximately 45 minutes.
   Thank you for your service. — Pastor"
```

### 3. Send all-members notice (Wednesday & Friday morning)
```
Trigger: 7:00 AM on prayer days
Message to all-members WhatsApp group:
  "Good morning, family! 🙏
   Remember we have fellowship prayer TONIGHT at 7:00 PM.
   [Name] will be leading us.
   Come and let us seek the face of God together.
   — Pastor"
```

## Error Handling
- If fewer than 2 available ministers for Monday: alert pastor immediately,
  ask for manual assignment
- If a minister's WhatsApp is undelivered: log to Airtable, notify pastor
- If no ministers marked available for a session: notify pastor 48 hrs ahead

## Monthly Roster Report
On the last Sunday of each month, generate a summary for the pastor:
- Total prayer sessions held
- Ministers who served most frequently (top 3)
- Any sessions with low attendance
- Suggested roster for coming month

## Permissions
- Read/write: Airtable (Prayer Ministers, Prayer Schedule tables)
- Send messages: Pastor WhatsApp (private), Prayer Team WhatsApp group,
  All Members WhatsApp group
- Read: Google Calendar (prayer events)
- Requires pastor APPROVE before sending reminders to ministers
