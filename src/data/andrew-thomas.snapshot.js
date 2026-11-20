/* Salesforce snapshot — Andrew Thomas (Contact 0036g00000VirONAAZ)
   Pulled Nov 20, 2026 through the read-only Salesforce connector.
   Only fields the dashboard needs. Giving is stored as yes/no, not amounts.

   Sources:
     contact            → Contact + csp__Relationship__c / csp__Relationship_Status__c
     eventRegistrations → Event_Registrants__c (Event_Program_Type__c, Event_Type__c, Attended__c, Attendee_Type__c)
     officerRoles       → csp__Relationship_Role__c
     chapterAwards      → csp__Group_Award__c for the chapter of initiation (Iota Eta: none on record)
     lmsEnrollments     → csplms__Module_Enrollment__c (none on record)
     giving             → Contact.Total_Gifts_This/Last_Calendar_Year__c, Lifetime_Level__c
*/
export default {
  source: "salesforce-snapshot",
  asOf: "2026-11-20",
  contact: {
    id: "0036g00000VirONAAZ",
    firstName: "Andrew",
    lastName: "Thomas",
    chapterId: "0016g00000OOEEaAAP",
    chapterName: "Iota Eta",
    school: "Indiana University, Indianapolis",
    status: "Alumnus",
    initiationDate: "2014-01-09",
    alumniDate: "2017-11-14",
    classYear: null,
    photoUrl: null,
  },
  eventRegistrations: [
    { eventName: "Career Accelerator FY27", programType: "Career Accelerator", eventType: null, beginDate: "2026-11-13", attended: true, attendeeType: "Staff" },
    { eventName: "Indiana Chapter Retreat - Leadership", programType: "Chapter Retreat", eventType: null, beginDate: "2026-10-24", attended: false, attendeeType: "Staff" },
    { eventName: "Theta Eta Chapter Retreat - Leadership", programType: "Chapter Retreat", eventType: null, beginDate: "2026-10-16", attended: true, attendeeType: "Staff" },
    { eventName: "Iota Kappa Chapter Retreat", programType: "Chapter Retreat", eventType: null, beginDate: "2026-09-26", attended: false, attendeeType: "Facilitator" },
    { eventName: "Leadership Institute FY27", programType: "Leadership Institute", eventType: null, beginDate: "2026-07-19", attended: true, attendeeType: "Staff" },
    { eventName: "Civic Engagement Institute FY 26", programType: "Civic Engagement Institute", eventType: null, beginDate: "2026-04-17", attended: true, attendeeType: "Staff" },
    { eventName: "Career Accelerator FY 26", programType: "Career Accelerator", eventType: null, beginDate: "2025-11-13", attended: true, attendeeType: "Staff" },
    { eventName: "2025 Convention", programType: null, eventType: "Convention", beginDate: "2025-07-24", attended: false, attendeeType: "Staff" },
    { eventName: "Leadership Institute FY25", programType: "Leadership Institute", eventType: null, beginDate: "2025-07-20", attended: true, attendeeType: "Staff" },
    { eventName: "Indy 125th Anniversary Celebration", programType: null, eventType: null, beginDate: "2024-12-03", attended: true, attendeeType: "Attendee" },
    { eventName: "Leadership Institute 2024", programType: "Leadership Institute", eventType: null, beginDate: "2024-07-27", attended: true, attendeeType: "Facilitator" },
    { eventName: "2023 Convention", programType: null, eventType: "Convention", beginDate: "2023-07-20", attended: false, attendeeType: "Attendee" },
    { eventName: "2021 Convention", programType: null, eventType: "Convention", beginDate: "2021-10-14", attended: true, attendeeType: "Staff" },
    { eventName: "2019 Convention", programType: null, eventType: "Convention", beginDate: "2019-08-01", attended: true, attendeeType: "Staff" },
    { eventName: "Summit 2019", programType: "Recruitment Summit", eventType: null, beginDate: "2019-01-11", attended: true, attendeeType: "Facilitator" },
    { eventName: "Regional Leadership Academy 2016", programType: "Regional Leadership Academy", eventType: null, beginDate: "2016-02-20", attended: true, attendeeType: "Attendee" },
  ],
  officerRoles: [
    { roleName: "Philanthropy Chairman", roleType: "Collegiate Chapter Officer", execRole: false, beginDate: "2015-01-07", endDate: "2017-01-23", months: 24, current: false },
    { roleName: "Vice President", roleType: "Collegiate Chapter Officer", execRole: true, beginDate: "2016-12-09", endDate: "2017-12-04", months: 12, current: false },
    { roleName: "Lead Advisor", roleType: "Collegiate Chapter Volunteer", execRole: false, beginDate: "2023-09-07", endDate: "2024-09-19", months: 12, current: false },
  ],
  chapterAwards: [],
  lmsEnrollments: [],
  giving: { giftThisYear: false, giftLastYear: true, societyMember: false },
  selfReports: [],
  redemptions: [],
};
