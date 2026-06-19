# Skill: Fellowship Event Announcements

## Purpose
Every Sunday evening, automatically compiles all events happening in the coming
week and sends a clear, warm announcement to all members via WhatsApp. Also sends
targeted reminders 48 hours and on the morning of each event.

## Triggers
- **Scheduled**: Every Sunday at 7:00 PM — weekly digest to all members
- **Scheduled**: 48 hours before each event — event-specific reminder
- **Scheduled**: Morning of event (7:00 AM) — day-of reminder
- **Manual**: "send announcements", "what events this week",
  "post the week's program", "send reminder for [event]"

## Data Sources
- Google Calendar: fellowship calendar (all events)
- Airtable base: `Fellowship Events`
  - Table: `Events` — fields: Name, Date, Time, Location, Description,
    TargetGroup, ResponsibleDept, LeadPerson
  - Table: `Members` — fields: Name, Phone, WhatsApp, Group, Active

## Recurring Events Reference
Use this to enrich announcements with the right context:

| Event | When | Group |
|---|---|---|
| Prayer Team | Every Monday 6 AM | Prayer team only |
| Fellowship Prayer | Every Wed & Fri 7 PM | All members |
| Baby Shower (believing for fruit of womb) | Last Friday of month | All members |
| Bible Study | 3rd Tuesday of month | All members |
| Fellowship Service | 2nd week of month (Sunday) | All members |
| Thanksgiving Service | Last Sunday of month | All members |
| Physical Meeting | Once every 3 months | All members |
| Evangelism Outreach | Once every 3 months | All members |

## Actions

### 1. Weekly Sunday digest (runs Sunday 7 PM)
```
1. Query Google Calendar for events in next 7 days
2. Enrich each event from Airtable Events table (lead person, description)
3. Compose weekly announcement message
4. Send to all-members WhatsApp group
```

### Weekly announcement message template:
```
Good evening, beloved family! 🙌

Here is our programme for the week ahead:

[For each event this week:]
📅 [DAY, DATE] — [EVENT NAME]
   ⏰ [TIME] | 📍 [LOCATION/ONLINE]
   [1-sentence description if available]

[If special monthly event this week, add highlight:]
⭐ This week is special — [EVENT] is happening! Please make every
   effort to be present and come with great expectation.

Let us hold one another accountable to show up and grow together.
God bless you all. 🙏

— Pastor [Name] & the Admin Team
```

### 2. Event-specific 48-hour reminder
```
Trigger: 48 hours before any event tagged as monthly/special
Message template:
  "Dear family, 🙏
   Just a reminder that [EVENT NAME] is coming up in 2 days!
   📅 [DATE] at [TIME]
   📍 [LOCATION]
   [Custom message per event type — see below]
   We look forward to seeing you there. — Admin"
```

### Custom messages per event type:
- **Baby Shower**: "Remember to bring a gift of love for our sisters
  believing God for the fruit of the womb. Let us surround them with
  faith and prayer."
- **Bible Study**: "Please come with your Bible and a notebook.
  This month we are studying [topic if set in Airtable]."
- **Thanksgiving**: "Come with your tithes, offerings, and a heart
  full of gratitude. Let us celebrate God's faithfulness together!"
- **Fellowship Service**: "Come expecting an encounter with God.
  Dress code: Smart casual."
- **Evangelism**: "Wear comfortable clothes and bring your boldness!
  Meeting point: [location]. Let us win souls for the Kingdom."
- **Physical Meeting**: "Please confirm your attendance by replying
  YES to this message so we can prepare adequately."

### 3. Day-of reminder (7:00 AM on event day)
```
Message template:
  "Good morning, family! 🌟
   Today is the day — [EVENT NAME] is TONIGHT at [TIME]!
   📍 [LOCATION]
   We can't wait to see you. Have a blessed day! — Admin"
```

### 4. Invite outsiders (evangelism feature)
```
Triggered manually: pastor says "send invite for [event] to outsiders list"
1. Pull contacts tagged as OutreachContacts in Airtable
2. Send personalised invitation:
   "Hello [Name], 😊
    You are warmly invited to join us for [EVENT] on [DATE] at [TIME].
    [Event description]
    We would love to have you with us. Reply YES if you can make it!
    — [Pastor Name], [Fellowship Name]"
```

## Permissions
- Read: Google Calendar (all events)
- Read/write: Airtable (Events, Members tables)
- Send messages: All Members WhatsApp group, Individual member WhatsApp
- Requires no pastor approval for standard weekly digest
- Requires pastor approval for outsider invitations
