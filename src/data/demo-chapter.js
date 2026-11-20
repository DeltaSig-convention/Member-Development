/* Sample chapter roster for the leaderboard preview.
   Replaced by a real chapter query (Contacts in the same chapter, with
   Lifetime XP) once Tyler's Gamification fields exist. */
export default [
  { id: "c1", name: "Marcus Williams", tier: "gold", xp: 2800, badges: 8, trend: "flat" },
  { id: "c2", name: "David Kim", tier: "gold", xp: 2150, badges: 7, trend: "up" },
  { id: "c3", name: "Ethan Nguyen", tier: "silver", xp: 1500, badges: 6, trend: "up" },
  { id: "c4", name: "Jake Morrison", tier: "silver", xp: 780, badges: 4, trend: "up" },
  { id: "c5", name: "Alex Chen", tier: "bronze", xp: 300, badges: 3, trend: "up" },
  { id: "c6", name: "Tyler Brooks", tier: "bronze", xp: 200, badges: 2, trend: "flat" },
  { id: "c7", name: "Ryan Patel", tier: "bronze", xp: 100, badges: 1, trend: "down" },
];

/* Rarity preview — % of members holding each badge. Real values come from an
   org-wide Salesforce report once badges are stored as records. */
export const RARITY_PREVIEW = {
  "career-1": 62, "career-2": 29, "career-3": 4,
  "service-1": 71, "service-2": 33, "service-3": 7,
  "edu-1": 55, "edu-2": 22, "edu-3": 5,
  "rel-1": 48, "rel-2": 26, "rel-3": 8,
};
