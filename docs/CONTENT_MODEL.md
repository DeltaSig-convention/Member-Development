# Content Model — what updates itself and what HQ schedules

Every card on the dashboard falls into one of three kinds. Turn on **Show content sources** in the Testing panel to see the label on each card.

| Kind | What it covers | Who updates it | How |
|---|---|---|---|
| **Personal** (automated) | Up Next, badge progress, XP, tier, stats, challenge progress, achievements | Nobody, per member. HQ edits the rules once. | Calculated from the member's own Salesforce records. Today: the rules engine. Production: Salesforce Flows write the results to the member's record. |
| **Org-wide** (scheduled) | Annual challenge (CTW Week), timed challenges for everyone, the fallback featured program | MX staff | One record with a start and end date. Every member sees it inside that window. |
| **Targeted** (scheduled + audience) | Featured program recommendations, challenges for undergrads only or alumni only | MX staff | Same as org-wide, plus an audience rule. Only members who match see it. |

## Personal: why Up Next needs no upkeep

Up Next looks at each pillar, finds the lowest badge the member hasn't earned, and suggests the next action they haven't done. It then shows the three that are closest to finished. When a Formstack submission or an event attendance lands in Salesforce, the next suggestion changes on its own.

HQ upkeep: keep each action's text and link current in the badge rules. That's done once a year, at the annual refresh.

## Org-wide and targeted: one schedule, three placements

| Placement | Shows | Selection |
|---|---|---|
| **Featured program** card | One card | The highest-priority item that's inside its show window and matches the member. Falls back to the item marked as the default. |
| **Annual challenge** card | CTW Week | Appears from Aug 1 and becomes "Happening now" April 11–17. |
| **Timed challenges** card | All active and upcoming challenges that match | Each one appears 21 days before it starts and disappears after it ends. |

### Audience rules

All of these are optional, and every rule listed has to match.

| Rule | Example | Salesforce source |
|---|---|---|
| `status` | `undergrad`, `alumni`, `all` | Relationship current status |
| `notAttended` | Hide CEI from people who've been | Event_Registrants__c, attended, member registration |
| `attended` | Follow-up challenge for CA alumni | Same |
| `chapters` | A regional push for five chapters | Contact chapter of initiation |
| `minTier` | Silver and above | Lifetime XP field (December build) |

### What's in the schedule today (placeholders)

| Item | Kind | Shows | Audience |
|---|---|---|---|
| Civic Engagement Institute | Targeted | Nov 1 – Mar 15 | Undergrads who haven't attended CEI |
| Leadership Institute | Targeted | Mar 16 – Jun 30 | Undergrads who haven't attended LI |
| Career Accelerator | Targeted | Jul 1 – Oct 31 | Undergrads who haven't attended CA |
| Volunteer with Delta Sig | Targeted | All year | Alumni |
| Convention 2027 | Org-wide (default) | All year | Everyone |
| CTW Week challenge | Org-wide | Aug 1 – Apr 17 | Everyone |
| Service Sprint | Org-wide | Nov 2026 | Everyone |
| Winter Break Career Push | Targeted | Dec 1 – Jan 15 | Undergrads |
| Spring Semester Learning Push | Targeted | Feb 2027 | Undergrads |
| Alumni Mentor Month | Targeted | Feb 2027 | Alumni |

Show windows are placeholders until the FY27–28 calendar is set.

## Production build (for Tyler)

One Salesforce object holds both featured programs and challenges, so MX staff schedule everything in one place.

**Gamification_Content__c**

| Field | Type | Notes |
|---|---|---|
| Type__c | Picklist | Featured Program, Annual Challenge, Timed Challenge |
| Title__c, Description__c, Eyebrow__c | Text | |
| CTA_Label__c, CTA_URL__c | Text / URL | |
| Show_Start__c, Show_End__c | Date | When the card appears |
| Start__c, End__c | Date | The challenge window (challenges only) |
| Priority__c | Number | Lower number wins for the featured slot |
| Is_Default__c | Checkbox | Shown when nothing else matches |
| Audience_Status__c | Picklist | All, Undergraduate, Alumni |
| Audience_Not_Attended__c, Audience_Attended__c | Picklist | Program types, plus Convention |
| Audience_Chapters__c | Multi-lookup or text list | Optional |
| Audience_Min_Tier__c | Picklist | Optional |
| Pillar__c, Actions_Needed__c, XP__c | Picklist / Number | Challenges only |
| Unlocks_Badge__c | Text | Optional: badge the program unlocks |

The Laravel endpoint returns the content items that are live today next to the member record, and the dashboard applies the audience rules. Alternatively, the endpoint applies them and returns only matches. That's Tyler's call. Either way, the dashboard code doesn't change.

**Challenge progress** stays personal. It counts the member's approved actions dated inside the window. When a member crosses a tier, a Flow writes the bonus XP.

## Testing without the forms

Every testing option lives in the URL, so you can send someone a link to the exact view.

| Option | URL | What it does |
|---|---|---|
| Member | `member=quincy`, `andrew`, any Beta Mu Contact ID, or blank for the demo | Whose record to show |
| Pretend today is | `date=2027-04-12` | Rotates featured programs and challenges as if it were that day |
| Count staff attendance | `staff=1` | Counts staff and facilitator registrations (testing only) |
| Show content sources | `sources=1` | Labels each card Personal, Org-wide or Targeted |

Example: `?member=quincy&date=2027-04-12&sources=1` shows Quincy during CTW Week with source labels on.
