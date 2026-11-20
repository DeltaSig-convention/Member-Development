/* ════════════════════════════════════════════════════════════════
   PROGRAM CONFIG — the gamification design, in one place.

   Everything a non-developer might want to change lives here:
   pillars, badges, actions, XP values, tiers, achievements,
   rewards and challenges. The rules engine (src/lib/engine.js)
   reads this file; the dashboard never hard-codes these values.

   Each badge action has a `source`:
     auto  → detected from existing Salesforce data (see `rule`)
     self  → self-reported via Formstack (forms come in December)
   ════════════════════════════════════════════════════════════════ */

export const BRAND = {
  sphinx: "#032e24",
  nileDark: "#35634a",
  nile: "#177b5a",
  nileLight: "#1da375",
  gold: "#E9B320",
  purple: "#7a4f99",
  desertShadow: "#8d6d34",
  desertSan: "#dfc393",
  carnation: "#fffef6",
};

export const PROGRAM_YEAR_START_MONTH = 7; // July 1 – June 30
export const ANNUAL_XP_CAP = 3000;
export const POINTS_PER_XP = 1; // every XP earned also earns 1 spendable point

/* Tier names are placeholders until Comms finalizes award + Siggy names. */
export const TIERS = [
  { key: "bronze", label: "Bronze", min: 0, color: "#CD7F32" },
  { key: "silver", label: "Silver", min: 500, color: "#9A9A9A" },
  { key: "gold", label: "Gold", min: 2000, color: "#E9B320" },
  { key: "diamond", label: "Diamond", min: 4000, color: "#7a4f99" },
];

/* Salesforce picklist values (Events__c.Program__c → Event_Program_Type__c). */
export const PROGRAMS = {
  careerAccelerator: "Career Accelerator",
  cei: "Civic Engagement Institute",
  leadershipInstitute: "Leadership Institute",
  dayOfService: "Day of Service",
  chapterRetreat: "Chapter Retreat",
  careerProgramming: "Career Programming",
  courageAndCulture: [
    "Courage & Culture Retreat",
    "Brotherhood & Belonging",
    "The Conflict Playbook",
    "Consent and Relationship Education",
    "Let's Talk: Conversations that Matter",
    "Mental Health workshop",
    "Respect in Action",
    "Brothers in Prevention",
  ],
};
/* Convention has no program type in Salesforce — it is identified by the
   Event record type (Event_Registrants__c.Event_Type__c = "Convention"). */
export const CONVENTION_EVENT_TYPE = "Convention";

/* Every URL verified Nov 20, 2026. Members reach this dashboard from a tile
   inside MyDeltaSig (SSO), so MyDeltaSig links open in the same session. */
export const DEST = {
  mds: { label: "Open MyDeltaSig", url: "https://my.deltasig.org" },
  lms: { label: "Open The Lamp", url: "https://my.deltasig.org" }, // The Lamp learning platform lives inside MyDeltaSig
  programs: { label: "See programs", url: "https://deltasig.org/programs" },
  careers: { label: "Career resources", url: "https://deltasig.org/launch-careers" },
  dos: { label: "Day of Service", url: "https://deltasig.org/embrace-service" },
  ca: { label: "Career Accelerator", url: "https://deltasig.org/programs/career-accelerator" },
  cei: { label: "CEI info", url: "https://deltasig.org/programs/civic-engagement-institute" },
  li: { label: "Leadership Institute", url: "https://deltasig.org/programs/leadership-institute" },
  conv: { label: "Convention 2027", url: "https://convention.deltasig.org" },
  cc: { label: "Courage & Culture", url: "https://deltasig.org/courage-and-culture" },
  foundation: { label: "Give now", url: "https://give.deltasig.org" },
  vpmx: { label: "Talk to your VPMX", url: null },
  campus: { label: "Get involved on campus", url: null },
};

/* Pillar order is intentional: Build Relationships is the foundation pillar. */
export const PILLARS = [
  { key: "relationships", label: "Build Relationships", icon: "Users", color: BRAND.nile, flagship: "Convention" },
  { key: "career", label: "Launch Careers", icon: "Briefcase", color: BRAND.gold, flagship: "Career Accelerator" },
  { key: "service", label: "Embrace Service", icon: "Handshake", color: BRAND.purple, flagship: "Civic Engagement Institute" },
  { key: "education", label: "Pursue Education", icon: "BookOpen", color: BRAND.desertShadow, flagship: "Leadership Institute" },
];

const attended = (program, min = 1) => ({ type: "program", program, min });
const roleIn = (roles, minMonths = 0) => ({ type: "role", roles, minMonths });

export const BADGES = [
  /* ── BUILD RELATIONSHIPS ── */
  {
    id: "rel-1", pillar: "relationships", level: 1, name: "Connector", xp: 100, need: 2, dest: "vpmx",
    actions: [
      { id: "chapter_retreat", text: "Participate in a chapter retreat", source: "auto", rule: attended(PROGRAMS.chapterRetreat), dest: "programs" },
      { id: "big_brother_pairing", text: "Form a Big Brother/mentorship pairing and meet at least 3 times", source: "self", dest: "vpmx", flag: "Pending risk review with Aubrey" },
      { id: "one_on_one", text: "Have a structured 1-on-1 conversation with a brother you don't know well", source: "self", dest: "vpmx" },
      { id: "new_people_event", text: "Attend an event where you don't know most people", source: "self", dest: "programs" },
    ],
  },
  {
    id: "rel-2", pillar: "relationships", level: 2, name: "Bridge-Builder", xp: 250, need: 3, dest: "mds",
    actions: [
      { id: "big_brother_semester", text: "Serve as a Big Brother or mentor for a full semester", source: "self", dest: "vpmx", flag: "Pending risk review with Aubrey" },
      { id: "lead_brotherhood_event", text: "Lead or facilitate a brotherhood event", source: "self", dest: "vpmx" },
      { id: "facilitate_peer_cc", text: "Facilitate a peer-led Courage & Culture workshop", source: "self", dest: "cc" },
      { id: "alumni_relationship", text: "Build a relationship with a DSP alumnus through 2+ conversations", source: "self", dest: "programs" },
      { id: "relationship_role", text: "Hold a chapter role that manages relationships — President, VPMX, VP of Recruitment or Brotherhood Chairman", source: "auto",
        rule: roleIn(["President", "Vice President of Member Experience", "Vice President of Recruitment", "Brotherhood Chairman"]), dest: "mds" },
    ],
  },
  {
    id: "rel-3", pillar: "relationships", level: 3, name: "Community Leader", xp: 500, need: 1, dest: "conv",
    prereq: {
      label: "Attend Convention OR serve a full year as President, VPMX or Brotherhood Chairman and complete a mentorship cycle",
      anyOf: [
        { id: "convention", source: "auto", rule: { type: "convention" } },
        { id: "relationship_role_year", source: "auto", rule: roleIn(["President", "Vice President of Member Experience", "Brotherhood Chairman"], 12), alsoNeeds: "mentorship_cycle" },
      ],
    },
    actions: [
      { id: "convention_followup", text: "Maintain a connection from your experience — 3+ follow-up conversations", source: "self", dest: "mds" },
      { id: "organize_retreat_hq", text: "Organize a chapter retreat in partnership with the national office", source: "self", dest: "vpmx" },
      { id: "mentor_transition", text: "Mentor a younger member through a significant transition", source: "self", dest: "vpmx" },
    ],
  },

  /* ── LAUNCH CAREERS ── */
  {
    id: "career-1", pillar: "career", level: 1, name: "Career Explorer", xp: 100, need: 2, dest: "mds",
    actions: [
      { id: "resume_review", text: "Complete a résumé review with a career counselor or peer", source: "self", dest: "mds" },
      { id: "informational_interview", text: "Conduct an informational interview — a conversation with a professional about their career path", source: "self", dest: "mds" },
      { id: "career_workshop", text: "Attend a DSP or campus career workshop", source: "auto", rule: attended(PROGRAMS.careerProgramming), selfAlso: true, dest: "careers" },
      { id: "strengths_assessment", text: "Complete a career interest or strengths assessment", source: "self", dest: "lms" },
    ],
  },
  {
    id: "career-2", pillar: "career", level: 2, name: "Career Builder", xp: 250, need: 3, dest: "mds",
    actions: [
      { id: "mock_interview", text: "Complete a mock interview (practice job interview with feedback) or coaching session", source: "self", dest: "careers" },
      { id: "dev_plan", text: "Build a professional development plan with concrete next steps", source: "self", dest: "mds" },
      { id: "alumni_mentor", text: "Connect with a DSP alumni mentor for a career conversation", source: "self", dest: "careers" },
      { id: "internship", text: "Complete an internship", source: "self", dest: "mds" },
    ],
  },
  {
    id: "career-3", pillar: "career", level: 3, name: "Career Accelerator", xp: 500, need: 1, dest: "ca",
    prereq: {
      label: "Attend Career Accelerator OR complete an internship/co-op",
      anyOf: [
        { id: "attend_ca", source: "auto", rule: attended(PROGRAMS.careerAccelerator) },
        { id: "internship_or_coop", source: "self" },
      ],
    },
    actions: [
      { id: "resume_update", text: "Update your résumé with what you learned", source: "self", dest: "mds" },
      { id: "post_program_interview", text: "Conduct a post-program informational interview", source: "self", dest: "mds" },
      { id: "career_reflection", text: "Submit a reflection on your experience", source: "self", dest: "mds" },
      { id: "present_career_insight", text: "Present a career insight or skill to your chapter", source: "self", dest: "vpmx" },
    ],
  },

  /* ── EMBRACE SERVICE ── */
  {
    id: "service-1", pillar: "service", level: 1, name: "Service Advocate", xp: 100, need: 2, dest: "dos",
    actions: [
      { id: "day_of_service", text: "Participate in Day of Service", source: "auto", rule: attended(PROGRAMS.dayOfService), dest: "dos" },
      { id: "chapter_service", text: "Complete a community service activity with or through your chapter", source: "self", dest: "vpmx" },
      { id: "advocacy", text: "Participate in an advocacy effort", source: "self", dest: "vpmx" },
      { id: "chapter_fundraising", text: "Participate in or organize a chapter fundraising effort", source: "self", dest: "vpmx" },
    ],
  },
  {
    id: "service-2", pillar: "service", level: 2, name: "Service Changemaker", xp: 250, need: 3, dest: "mds",
    actions: [
      { id: "lead_service_project", text: "Lead or organize a service project from planning through execution", source: "self", dest: "vpmx" },
      { id: "sustained_service", text: "Sustain a service commitment with one organization — 4+ visits over 2+ months", source: "self", dest: "mds" },
      { id: "recruit_volunteers", text: "Recruit and lead a team of 5+ volunteers for a service event", source: "self", dest: "vpmx" },
      { id: "service_hours_15", text: "Log 15+ service hours in My Profile", source: "self", dest: "mds" },
      { id: "service_chairman", text: "Serve as chapter Service Chairman", source: "auto", rule: roleIn(["Service Chairman"]), dest: "mds" },
    ],
  },
  {
    id: "service-3", pillar: "service", level: 3, name: "Service Leader", xp: 500, need: 1, dest: "cei",
    prereq: {
      label: "Attend CEI OR lead a sustained service initiative across two semesters",
      anyOf: [
        { id: "attend_cei", source: "auto", rule: attended(PROGRAMS.cei) },
        { id: "two_semester_initiative", source: "self" },
      ],
    },
    actions: [
      { id: "lead_post_program", text: "Lead a chapter or community service initiative afterward", source: "self", dest: "vpmx" },
      { id: "service_reflection", text: "Submit a reflection on your experience", source: "self", dest: "mds" },
      { id: "community_partnership", text: "Establish an ongoing chapter partnership with a community organization", source: "self", dest: "vpmx" },
    ],
  },

  /* ── PURSUE EDUCATION ── */
  {
    id: "edu-1", pillar: "education", level: 1, name: "Curious Learner", xp: 100, need: 2, dest: "lms",
    actions: [
      { id: "lms_2", text: "Complete 2 LMS modules", source: "auto", rule: { type: "lms", min: 2 }, dest: "lms" },
      { id: "cc_1", text: "Complete 1 Courage & Culture program (HQ or peer-led)", source: "auto", rule: attended(PROGRAMS.courageAndCulture, 1), selfAlso: true, dest: "cc" },
      { id: "leadership_assessment", text: "Complete a personal strengths or leadership style assessment", source: "self", dest: "lms" },
      { id: "campus_org", text: "Participate in a campus organization outside of Delta Sig", source: "self", dest: "campus" },
    ],
  },
  {
    id: "edu-2", pillar: "education", level: 2, name: "Active Learner", xp: 250, need: 3, dest: "lms",
    actions: [
      { id: "cc_3", text: "Complete 3+ Courage & Culture programs (HQ or peer-led)", source: "auto", rule: attended(PROGRAMS.courageAndCulture, 3), selfAlso: true, dest: "cc" },
      { id: "facilitate_education", text: "Lead or facilitate an educational session for your chapter", source: "self", dest: "vpmx" },
      { id: "peer_tutor", text: "Serve as a peer tutor, study group leader or academic mentor", source: "self", dest: "campus" },
      { id: "campus_leadership", text: "Hold a leadership position in a campus organization", source: "self", dest: "campus" },
      { id: "coop", text: "Complete a co-op or professional field experience", source: "self", dest: "mds" },
      { id: "facilitate_peer_cc", text: "Facilitate a peer-led Courage & Culture workshop", source: "self", dest: "cc" },
    ],
  },
  {
    id: "edu-3", pillar: "education", level: 3, name: "Lifelong Learner", xp: 500, need: 1, dest: "li",
    prereq: {
      label: "Attend Leadership Institute OR complete a study abroad program",
      anyOf: [
        { id: "attend_li", source: "auto", rule: attended(PROGRAMS.leadershipInstitute) },
        { id: "study_abroad", source: "self" },
      ],
    },
    actions: [
      { id: "leadership_action_plan", text: "Complete your leadership action plan", source: "self", dest: "mds" },
      { id: "facilitate_leadership_workshop", text: "Facilitate a chapter workshop on a leadership topic", source: "self", dest: "vpmx" },
      { id: "li_reflection", text: "Complete a reflection on your experience", source: "self", dest: "mds" },
    ],
  },
];

/* Bonus XP — officer terms, chapter awards, Foundation giving. */
export const OFFICER_XP = { president: 200, execBoard: 150, other: 100 };
export const OFFICER_ROLE_TYPE = "Collegiate Chapter Officer";

export const CHAPTER_AWARD_XP = [
  { match: "Pyramid of Excellence", label: "Pyramid of Excellence", xp: 150 },
  { match: "Chapter of Distinction", label: "Chapter of Distinction", xp: 100 },
  { match: "Next Era", label: "Next Era Award", xp: 75 },
];

export const GIVING_XP = { firstGift: 100, consecutiveYear: 75, society: 150 };

/* Achievements: serious name, funny line underneath. */
export const ACHIEVEMENTS = [
  { id: "first_steps", name: "First Steps", desc: "Look at you, joining things", icon: "Star", color: BRAND.gold },
  { id: "pillar_pioneer", name: "Pillar Pioneer", desc: "A badge in every pillar? Show-off.", icon: "Shield", color: BRAND.nile },
  { id: "silver_lining", name: "Silver Lining", desc: "You're literally shining now", icon: "Medal", color: "#9A9A9A" },
  { id: "century_club", name: "Century Club", desc: "1,000 XP in a year. That's not nothing.", icon: "Zap", color: BRAND.gold },
  { id: "tier1_complete", name: "Level I Complete", desc: "All four Level I badges? Overachiever.", icon: "Award", color: BRAND.nile },
  { id: "three_peater", name: "Three-Peater", desc: "CA, CEI and LI. You've done the circuit.", icon: "Trophy", color: BRAND.purple },
  { id: "convention_bound", name: "Convention Bound", desc: "Pack sunscreen and your voting paddle", icon: "Map", color: BRAND.purple },
  { id: "full_pyramid", name: "The Full Pyramid", desc: "All 12 badges. We bow to you.", icon: "Crown", color: BRAND.gold },
  { id: "first_gift", name: "First Gift", desc: "Your wallet just joined the brotherhood", icon: "Heart", color: BRAND.nile },
  { id: "loyal_donor", name: "Loyal Donor", desc: "Two years running. The Foundation loves you.", icon: "Sparkles", color: BRAND.gold },
  { id: "society_member", name: "Society Member", desc: "Big donor energy", icon: "Gem", color: BRAND.gold },
];

/* Rewards catalog is a placeholder until the catalog is designed. */
export const REWARDS = [
  { id: "r1", name: "Delta Sig Sticker Pack", cost: 200, cat: "Merch" },
  { id: "r3", name: "Custom Phone Case", cost: 400, cat: "Merch" },
  { id: "r2", name: "Branded Dri-Fit Shirt", cost: 500, cat: "Merch" },
  { id: "r4", name: "Delta Sig Polo", cost: 600, cat: "Merch" },
  { id: "r6", name: "LI Priority Registration", cost: 750, cat: "Programs" },
  { id: "r7", name: "Alumni Networking Access", cost: 800, cat: "Experiences" },
  { id: "r5", name: "Convention Registration Discount", cost: 1000, cat: "Programs" },
];

/* Featured program in the hero. Swap seasonally. */
export const HERO = {
  eyebrow: "Featured Program",
  title: "Convince the World Week 2027",
  sub: "The biggest XP week of the year. Show up for every pillar, April 11–17.",
  url: "https://deltasig.org/embrace-service",
  cta: "Learn more",
};

/* Challenges are Salesforce Event records of type "Timed Challenge" (December build).
   Until then they live here. Progress counts actions dated inside the window. */
export const CHALLENGES = {
  anchor: {
    id: "ctw-2027", title: "Convince the World Week", start: "2027-04-11", end: "2027-04-17",
    desc: "Complete development actions across the pillars during CTW Week.",
    countBy: "pillars", total: 4,
    tiers: [
      { label: "Show Up", need: 1, xp: 25, req: "1 pillar" },
      { label: "Committed", need: 3, xp: 75, req: "3 pillars" },
      { label: "All In", need: 4, xp: 150, req: "All 4 pillars" },
    ],
  },
  monthly: [
    { id: "dec-2026-career", title: "Winter Break Career Push", desc: "Complete 2 career actions before classes start", pillar: "career", need: 2, xp: 50, start: "2026-12-01", end: "2027-01-15" },
    { id: "nov-2026-service", title: "Service Sprint", desc: "Complete 2 service actions this month", pillar: "service", need: 2, xp: 50, start: "2026-11-01", end: "2026-11-30" },
  ],
};
