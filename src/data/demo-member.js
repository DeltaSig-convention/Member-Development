/* Demo member — Jordan Rivera. Fictional person, real data shape.
   Same structure as a Salesforce snapshot, so the demo exercises the
   same rules engine. Delta Delta's 2026 Pyramid of Excellence is real. */
export default {
  source: "demo",
  asOf: "2026-11-20",
  contact: {
    id: "DEMO000000000000AA",
    firstName: "Jordan",
    lastName: "Rivera",
    chapterId: "0016g00000OOECWAA5",
    chapterName: "Delta Delta",
    school: "Purdue University",
    status: "Active Member",
    initiationDate: "2024-11-02",
    alumniDate: null,
    classYear: 2027,
    photoUrl: null,
  },
  eventRegistrations: [
    { eventName: "Brotherhood & Belonging — Delta Delta", programType: "Brotherhood & Belonging", eventType: null, beginDate: "2025-09-20", attended: true, attendeeType: "Attendee" },
    { eventName: "Purdue Career Night", programType: "Career Programming", eventType: null, beginDate: "2025-10-08", attended: true, attendeeType: "Attendee" },
    { eventName: "Delta Delta Chapter Retreat", programType: "Chapter Retreat", eventType: null, beginDate: "2025-10-18", attended: true, attendeeType: "Attendee" },
    { eventName: "Day of Service 2026 — Indianapolis", programType: "Day of Service", eventType: null, beginDate: "2026-04-11", attended: true, attendeeType: "Attendee" },
  ],
  officerRoles: [
    { roleName: "Service Chairman", roleType: "Collegiate Chapter Officer", execRole: false, beginDate: "2025-12-01", endDate: null, months: 12, current: true },
  ],
  chapterAwards: [
    { awardName: "Pyramid of Excellence", dateAwarded: "2026-03-31" },
    { awardName: "Loren Lee Mall Ritual Award", dateAwarded: "2026-04-24" },
    { awardName: "Robert R. Harris Outstanding Recruitment Award", dateAwarded: "2026-04-24" },
  ],
  lmsEnrollments: [
    { result: "Passed", resultDate: "2025-02-14" },
    { result: "Passed", resultDate: "2025-03-21" },
  ],
  giving: { giftThisYear: false, giftLastYear: false, societyMember: false },
  selfReports: [
    { actionId: "resume_review", date: "2025-09-15", status: "approved" },
    { actionId: "informational_interview", date: "2025-10-02", status: "approved" },
    { actionId: "chapter_service", date: "2025-11-08", status: "approved", hours: 4 },
    { actionId: "mock_interview", date: "2026-02-10", status: "approved" },
    { actionId: "dev_plan", date: "2026-03-01", status: "approved" },
    { actionId: "alumni_mentor", date: "2026-04-20", status: "approved" },
    { actionId: "campus_leadership", date: "2026-09-01", status: "approved" },
    { actionId: "lead_service_project", date: "2026-09-12", status: "approved", hours: 6 },
    { actionId: "sustained_service", date: "2026-10-30", status: "approved", hours: 9 },
    { actionId: "one_on_one", date: "2026-11-14", status: "pending" },
  ],
  redemptions: [],
};
