# Fellowship AI Agent — Phase 2 Skills Package

## Overview
This package contains 5 OpenClaw skills that automate the core weekly
operations of the fellowship. Install them one at a time, test each before
moving to the next.

## Skills in this package

| Skill | Folder | Auto or Approval |
|---|---|---|
| 1. Prayer Schedule | `prayer-schedule/` | Approval (Monday roster) |
| 2. Event Announcements | `event-announcements/` | Auto |
| 3. Birthday Greetings | `birthday-greetings/` | Auto |
| 4. Pastor's Word | `pastors-word/` | Approval (Monday devotional) |
| 5. Member Care | `member-care/` | Auto (appreciation) |

## Prerequisites
Before installing any skill, complete Phase 1:
- [ ] OpenClaw installed and running
- [ ] WhatsApp Business connected
- [ ] Claude API key added to OpenClaw config
- [ ] Airtable base created (see schema below)
- [ ] Google Calendar connected with fellowship events

## Airtable Base Schema

### Table: Members
| Field | Type | Notes |
|---|---|---|
| Name | Text | Full name |
| FirstName | Formula | `LEFT({Name}, FIND(" ",{Name})-1)` |
| Phone | Phone | International format e.g. +234... |
| WhatsApp | Phone | Same as phone if same number |
| Birthday | Text | Format: MM-DD e.g. 03-15 |
| BirthYear | Number | Optional — for age calculation |
| Department | Single select | Prayer, Choir, Admin, Protocol, Media, Finance, Evangelism, Hospitality, Follow-up, Baby Shower |
| DedicationLevel | Single select | Core, Active, Regular, Irregular |
| JoinDate | Date | When they joined fellowship |
| LastSeen | Date | Last event/activity date — update manually or via form |
| Active | Checkbox | Uncheck to exclude from all automations |
| AppreciationSentDate | Date | Auto-updated by agent |
| BirthdayMessageSent | Date | Auto-updated by agent |
| Notes | Long text | Pastor's private notes |

### Table: Prayer Ministers
| Field | Type | Notes |
|---|---|---|
| Member | Link to Members | |
| Team | Single select | Prayer (Monday team), General |
| Availability | Multi-select | Mon, Wed, Fri |
| LastRoster | Date | Auto-updated by agent |

### Table: Prayer Schedule
| Field | Type | Notes |
|---|---|---|
| Date | Date | Session date |
| Session | Single select | Monday Prayer, Wednesday Prayer, Friday Prayer |
| Ministers | Link to Prayer Ministers | |
| Status | Single select | Scheduled, Reminded, Completed |

### Table: Events
| Field | Type | Notes |
|---|---|---|
| Name | Text | Event name |
| Date | Date | |
| Time | Text | e.g. "7:00 PM" |
| Location | Text | Physical or "Online (WhatsApp)" |
| Description | Long text | Optional — for richer announcements |
| TargetGroup | Single select | All Members, Prayer Team, Leaders |
| ResponsibleDept | Single select | Department running the event |
| LeadPerson | Link to Members | |

### Table: PastorNotes
| Field | Type | Notes |
|---|---|---|
| Date | Date | Monday the message is for |
| Theme | Text | Optional pre-logged theme |
| Scripture | Text | Optional e.g. "Romans 8:37" |
| Notes | Long text | Any additional pastor notes |
| Status | Single select | Pending, Drafted, Sent, Held |

### Table: SentMessages
| Field | Type | Notes |
|---|---|---|
| Date | Date/time | When sent |
| Type | Single select | Birthday, Devotional, Event, Appreciation, Reminder |
| Recipient | Text | Name or "All Members" |
| Content | Long text | Full message text |
| Approved | Checkbox | Whether pastor approved |

### Table: EngagementLog
| Field | Type | Notes |
|---|---|---|
| Member | Link to Members | |
| Date | Date | |
| Type | Single select | Check-in sent, 4-week alert, 6-week escalation |
| Notes | Text | |

## Google Form — New Member Intake
Create a Google Form with these fields and connect to Airtable via Zapier free tier or Airtable's built-in form:

- Full Name (required)
- Phone / WhatsApp Number (required)
- Date of Birth — Day and Month only (optional)
- Department of Interest (dropdown — same options as Airtable)
- How did you hear about us? (optional)
- Prayer requests / anything you'd like the pastor to know (optional)

## Installation

### Step 1 — Copy skills into OpenClaw
```bash
# From your OpenClaw workspace directory:
cp -r fellowship-skills/* ~/.openclaw/skills/
```

### Step 2 — Install in order
In your OpenClaw Control UI (http://localhost:3000):
1. Go to Skills → Install from folder
2. Install in this order (test each before next):
   a. birthday-greetings (simplest — good first test)
   b. event-announcements
   c. prayer-schedule
   d. pastors-word
   e. member-care

### Step 3 — Configure environment variables
Add these to your OpenClaw `.env` file:
```
AIRTABLE_API_KEY=your_key_here
AIRTABLE_BASE_ID=your_base_id_here
FELLOWSHIP_NAME=Your Fellowship Name
PASTOR_NAME=Your Name
PASTOR_WHATSAPP=+234xxxxxxxxxx
ALL_MEMBERS_GROUP_ID=whatsapp_group_id
PRAYER_TEAM_GROUP_ID=whatsapp_group_id
ANTHROPIC_API_KEY=your_claude_api_key
BUFFER_API_KEY=optional_for_phase_3
```

### Step 4 — Test each skill manually
Message your OpenClaw agent on WhatsApp:
- "Who has a birthday today?" → tests birthday skill
- "What events do we have this week?" → tests event announcements
- "Generate prayer schedule" → tests prayer roster
- "Draft pastor's word for this Monday" → tests devotional draft
- "Who are our dedicated members?" → tests member care

## Weekly automation schedule at a glance

| Time | Day | Automation |
|---|---|---|
| 6:30 AM | Monday | Draft devotional → pastor for approval |
| 6:00 PM | Sunday | Generate prayer roster → pastor for approval |
| 7:00 PM | Sunday | Send weekly event digest to all members |
| 8:00 AM | Daily | Birthday check and greetings |
| 7:00 AM | Wed & Fri | Prayer day reminder to all members |
| 9:00 AM | Wednesday | Midweek encouragement (auto) |
| 24 hrs before | Prayer sessions | Reminders to ministers on duty |
| 4:00 PM | Friday | Appreciation messages to dedicated members |
| 7:00 AM | Monday | Engagement check — flag quiet members |
| 1st of month | Monthly | Birthday preview for coming month |

## Support
- OpenClaw docs: https://openclaw.ai/docs
- ClawHub skills marketplace: https://clawhub.io
- Community Discord: linked from OpenClaw GitHub
