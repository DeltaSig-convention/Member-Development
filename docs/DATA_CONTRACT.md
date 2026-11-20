# Data Contract — Member Development Dashboard

For Tyler and Ande. This is the shape the dashboard needs for one member, keyed by the 18-digit Contact ID. Today it comes from a bundled snapshot; in production a Laravel endpoint (`GET /api/member/{contactId18}`) returns the same JSON from Salesforce.

Salesforce stays the source of truth. The dashboard only reads.

## Raw member record

```json
{
  "source": "salesforce",
  "asOf": "2026-11-20",
  "contact": {
    "id": "0036g00000VirONAAZ",
    "firstName": "Andrew",
    "lastName": "Thomas",
    "chapterId": "0016g00000OOEEaAAP",
    "chapterName": "Iota Eta",
    "school": "Indiana University, Indianapolis",
    "status": "Alumnus",
    "initiationDate": "2014-01-09",
    "alumniDate": "2017-11-14",
    "classYear": null,
    "photoUrl": null
  },
  "eventRegistrations": [
    { "eventName": "Career Accelerator FY27", "programType": "Career Accelerator", "eventType": null,
      "beginDate": "2026-11-13", "attended": true, "attendeeType": "Staff", "cancelled": false }
  ],
  "officerRoles": [
    { "roleName": "Vice President", "roleType": "Collegiate Chapter Officer", "execRole": true,
      "beginDate": "2016-12-09", "endDate": "2017-12-04", "months": 12, "current": false, "groupId": null }
  ],
  "chapterAwards": [ { "awardName": "Pyramid of Excellence", "dateAwarded": "2026-03-31" } ],
  "lmsEnrollments": [ { "result": "Passed", "resultDate": "2025-02-14" } ],
  "giving": { "giftThisYear": false, "giftLastYear": true, "societyMember": false },
  "selfReports": [ { "actionId": "resume_review", "date": "2025-09-15", "status": "approved", "hours": null } ],
  "redemptions": [ { "points": 200, "date": "2027-02-01", "rewardId": "r1" } ]
}
```

## Where each field comes from

| Field | Salesforce source |
|---|---|
| `contact.*` | `Contact` (Id, FirstName, LastName, `csp__Chapter_of_Initiation__c`, `PhotoUrl`) |
| `contact.status` | `csp__Relationship__c.csp__Current_Status_Name__c` (Membership Type = Initiate) |
| `contact.initiationDate` | `csp__Relationship_Status__c` — begin date of the first **Active Member** status |
| `contact.alumniDate` | `csp__Relationship_Status__c` — begin date of the **Alumnus** status |
| `contact.school` | `csp__Relationship__c.Higher_Ed_Institution__c` |
| `eventRegistrations[]` | `Event_Registrants__c` — `Event_Name__c`, `Event_Program_Type__c`, `Event_Type__c`, `Event_Begin_Date__c`, `Attended__c`, `Attendee_Type__c`, `Cancelled__c` |
| `officerRoles[]` | `csp__Relationship_Role__c` — `Role_Name__c`, `Role_Type__c`, `Exec_Role__c`, `csp__Begin_Date__c`, `csp__End_Date__c`, `Months_in_Office__c`, `csp__Current__c`, `csp__Group__c` |
| `chapterAwards[]` | `csp__Group_Award__c` where Group = chapter of initiation — `Award_Name__c`, `csp__Date_Awarded__c` |
| `lmsEnrollments[]` | `csplms__Module_Enrollment__c` — `csplms__Result__c`, `csplms__Result_Date__c` |
| `giving` | `Contact.Total_Gifts_This_Calendar_Year__c > 0`, `Total_Gifts_Last_Calendar_Year__c > 0`; society = TBD (see questions) |
| `selfReports[]` | **New** — Formstack submissions landing in a Gamification Action object (December build) |
| `redemptions[]` | **New** — reward redemptions (after the catalog is final) |

## Rules the engine applies (to move into Flows in December)

- **Attendance counts only when** `Attended__c = true`, not cancelled, and `Attendee_Type__c` is Attendee or Guest. Staff, Facilitator and Speaker registrations don't count.
- **Convention** is matched on `Event_Type__c = "Convention"`, not program type (see findings).
- **Officer XP:** one award per 12 months in office (minimum one). President 200, any `Exec_Role__c` 150, other Collegiate Chapter Officer roles 100. Volunteer and alumni roles earn nothing yet.
- **Chapter award XP** only if the award date falls between the member's initiation and alumni dates.
- **Annual XP cap:** 3,000 per program year (July 1 – June 30). Lifetime XP sets the tier and never drops; current points = lifetime XP − redemptions.
- A badge is earned only after the level below it in the same pillar is earned.

## Findings from the Nov 20 pull

1. **Convention registrations have no `Event_Program_Type__c`.** All four of Andrew's Convention records show program type blank and `Event_Type__c = Convention`. The engine handles this, but the Flow should match on event type too.
2. **Officer assignments live on `csp__Relationship_Role__c`,** not `csp__Contact_Group_Role__c` (that object is the list of role definitions). The mapping doc should be corrected.
3. **Multi-year terms are one record.** Andrew's Philanthropy Chairman role is a single 24-month record. The engine splits it into two terms. `Latest_Reconfirmation__c` may be the cleaner signal — Tyler's call.
4. **Staff attendance is recorded the same way as member attendance,** separated only by `Attendee_Type__c`. Any Flow must filter on it or staff will earn badges.

## Open questions

- What field marks Foundation **Society** membership? `Lifetime_Level__c` is null for Andrew; confirm it's the right field or name the correct one.
- Do the giving fields on Contact include Foundation gifts, Fraternity gifts, or both?
- Self-report statuses: should Level I submissions write as `approved` directly, with Level II/III starting as `pending`?
