/* Salesforce snapshot — Quincy Elliott (Contact 0034V00004y7UjDQAU)
   Pulled Nov 20, 2026 through the read-only Salesforce connector.
   Only fields the dashboard needs. Giving is stored as yes/no, not amounts.

   What Salesforce has (and doesn't):
     contact            → Beta Mu, Transylvania University. New Member 2023-10-15, Active Member 2024-01-15 (current)
     eventRegistrations → 6 records: LI 2024, LEAD Weekend FY25, 2025 Convention (registered, not attended),
                          CA FY26, Day of Service 2026, CEI FY26
     officerRoles       → none on csp__Relationship_Role__c (his IFC presidency is a campus role, so it
                          would arrive through the self-report form, not Salesforce)
     chapterAwards      → Beta Mu awards since his initiation: none in the XP list. Chapter of Distinction
                          was awarded 2024-01-13, two days before his Active Member date.
     lmsEnrollments     → none on record
     giving             → gift last calendar year, none yet this year; Lifetime_Level__c null
*/
export default {
  source: "salesforce-snapshot",
  asOf: "2026-11-20",
  contact: {
    id: "0034V00004y7UjDQAU",
    firstName: "Quincy",
    lastName: "Elliott",
    chapterId: "0016g00000OOEBsAAP",
    chapterName: "Beta Mu",
    school: "Transylvania University",
    status: "Active Member",
    newMemberDate: "2023-10-15",
    initiationDate: "2024-01-15",
    alumniDate: null,
    classYear: null,
    photoUrl: null,
  },
  eventRegistrations: [
    { eventName: "Civic Engagement Institute FY 26", programType: "Civic Engagement Institute", eventType: "Education & Training", beginDate: "2026-04-17", attended: true, attendeeType: "Attendee" },
    { eventName: "Day of Service 2026 - Lexington", programType: "Day of Service", eventType: "Education & Training", beginDate: "2026-04-10", attended: true, attendeeType: "Attendee" },
    { eventName: "Career Accelerator FY 26", programType: "Career Accelerator", eventType: "Education & Training", beginDate: "2025-11-13", attended: true, attendeeType: "Attendee" },
    { eventName: "2025 Convention", programType: null, eventType: "Convention", beginDate: "2025-07-24", attended: false, attendeeType: "Attendee" },
    { eventName: "LEAD Weekend FY 25 - Columbus", programType: "LEAD Weekend", eventType: "Education & Training", beginDate: "2024-11-16", attended: true, attendeeType: "Attendee" },
    { eventName: "Leadership Institute 2024", programType: "Leadership Institute", eventType: "Education & Training", beginDate: "2024-07-27", attended: true, attendeeType: "Attendee" },
  ],
  officerRoles: [],
  chapterAwards: [
    { awardName: "Chapter of Distinction Award", dateAwarded: "2024-01-13" },
    { awardName: "Community Engagement Award", dateAwarded: "2024-01-13" },
    { awardName: "Loren Lee Mall Ritual Award", dateAwarded: "2024-01-13" },
  ],
  lmsEnrollments: [],
  giving: { giftThisYear: false, giftLastYear: true, societyMember: false },
  selfReports: [],
  redemptions: [],
};
