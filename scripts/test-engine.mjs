/* Run with: node scripts/test-engine.mjs
   Prints what the rules engine produces for each data source. */
import { buildMemberSummary } from "../src/lib/engine.js";
import demo from "../src/data/demo-member.js";
import andrew from "../src/data/andrew-thomas.snapshot.js";
import betaMu from "../src/data/beta-mu.snapshot.js";
const quincy = betaMu.find((r) => r.contact.firstName === "Quincy");

const today = "2026-11-20";
function show(label, raw, opts = {}) {
  const m = buildMemberSummary(raw, { today, ...opts });
  console.log(`\n=== ${label} ===`);
  console.log(`${m.member.firstName} ${m.member.lastName} · ${m.member.chapter} · ${m.tier.label} · lifetime ${m.xp.lifetime} XP · points ${m.xp.currentPoints} · this year ${m.xp.programYearEarned}`);
  for (const b of m.badges) console.log(`  ${b.id.padEnd(10)} ${b.name.padEnd(22)} ${b.status.padEnd(12)} ${Math.round(b.progress * 100)}%${b.prereq ? `  prereq:${b.prereq.done ? "met" : "no"}` : ""}${b.earnedDate ? `  earned ${b.earnedDate.toISOString().slice(0, 10)}` : ""}`);
  console.log("  bonus:", [...m.bonus.officer, ...m.bonus.awards, ...m.bonus.giving].map((e) => `${e.label} +${e.xp}`).join(" | ") || "none");
  console.log("  achievements:", m.achievements.filter((a) => a.earned).map((a) => a.name).join(", ") || "none");
  console.log("  up next:", m.upNext.map((u) => `${u.action} (${u.context})`).join(" || "));
  console.log("  stats:", JSON.stringify(m.stats), "celebrate:", m.celebrate);
  console.log("  featured:", m.featured?.id, `(${m.featured?.kind})`, "· anchor:", m.challenges.anchor ? `${m.challenges.anchor.done}/${m.challenges.anchor.total}` : "hidden", "· timed:", m.challenges.timed.map((c) => `${c.title} ${c.done}/${c.need}`).join(", ") || "none");
  return m;
}

const a = show("Demo — Jordan Rivera", demo);
show("Andrew — Salesforce snapshot (participant attendance only)", andrew);
show("Andrew — counting staff attendance (testing)", andrew, { includeStaff: true });
const q = show("Quincy — Salesforce snapshot", quincy);
const qp = show("Quincy — without program attendance XP (old rule, for comparison)", quincy, { programXP: false });
show("Quincy — during CTW Week (Apr 12, 2027)", quincy, { today: "2027-04-12" });
show("Demo — Feb 2027", demo, { today: "2027-02-10" });

// Assertions on the demo so rule changes that break expectations get caught.
const earned = a.badges.filter((b) => b.status === "earned").map((b) => b.id).sort();
const expect = ["career-1", "career-2", "edu-1", "service-1", "service-2"];
if (JSON.stringify(earned) !== JSON.stringify(expect)) { console.error("\nFAIL: demo earned badges", earned); process.exit(1); }
if (a.xp.lifetime !== 1200) { console.error("\nFAIL: demo lifetime XP", a.xp.lifetime); process.exit(1); }
if (!q.achievements.find((x) => x.id === "three_peater").earned) { console.error("\nFAIL: Quincy should be a Three-Peater"); process.exit(1); }
if (q.achievements.find((x) => x.id === "convention_bound").earned) { console.error("\nFAIL: a past, unattended Convention should not count as Convention Bound"); process.exit(1); }
if (q.xp.lifetime <= qp.xp.lifetime) { console.error("\nFAIL: program attendance XP should add XP"); process.exit(1); }
if (q.bonus.attendance.some((e) => /LEAD|Officer Training/.test(e.label))) { console.error("\nFAIL: LEAD Weekend should not earn attendance XP"); process.exit(1); }
if (!q.bonus.awards.length) { console.error("\nFAIL: Quincy should get chapter award XP from his New Member window"); process.exit(1); }

// Whole chapter: every record runs cleanly, ranked by lifetime XP.
const roster = betaMu.map((r) => buildMemberSummary(r, { today })).sort((a, b) => b.xp.lifetime - a.xp.lifetime);
console.log(`\n=== Beta Mu roster (${roster.length}) ===`);
for (const x of roster) console.log(`  ${String(x.xp.lifetime).padStart(5)}  ${x.tier.label.padEnd(7)} ${String(x.badges.filter((b) => b.status === "earned").length).padStart(2)} badges  ${x.member.firstName} ${x.member.lastName}${x.member.status === "New Member" ? " (NM)" : ""}`);
if (a.featured?.id !== "cei-fy27") { console.error("\nFAIL: demo undergrad should be featured CEI, got", a.featured?.id); process.exit(1); }
console.log("\nAll checks passed.");

// Officer roles under 3 months earn nothing (Neagle's 0-month VP record).
const neagle = buildMemberSummary(betaMu.find((r) => r.contact.lastName === "Neagle"), { today });
if (neagle.bonus.officer.some((o) => o.label.startsWith("Vice President —") || o.label === "Vice President")) { console.error("FAIL: 0-month VP role should not earn XP"); process.exit(1); }
console.log("Officer minimum check passed. Neagle:", neagle.xp.lifetime, "XP");
