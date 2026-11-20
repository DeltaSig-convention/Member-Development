/* Run with: node scripts/test-engine.mjs
   Prints what the rules engine produces for each data source. */
import { buildMemberSummary } from "../src/lib/engine.js";
import demo from "../src/data/demo-member.js";
import andrew from "../src/data/andrew-thomas.snapshot.js";

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
  console.log("  challenges:", m.challenges.anchor.done, "/", m.challenges.anchor.total, m.challenges.monthly.map((c) => `${c.title} ${c.done}/${c.need}`).join(", "));
  return m;
}

const a = show("Demo — Jordan Rivera", demo);
show("Andrew — Salesforce snapshot (participant attendance only)", andrew);
show("Andrew — counting staff attendance (testing)", andrew, { includeStaff: true });

// Assertions on the demo so rule changes that break expectations get caught.
const earned = a.badges.filter((b) => b.status === "earned").map((b) => b.id).sort();
const expect = ["career-1", "career-2", "edu-1", "service-1", "service-2"];
if (JSON.stringify(earned) !== JSON.stringify(expect)) { console.error("\nFAIL: demo earned badges", earned); process.exit(1); }
if (a.xp.lifetime !== 1050) { console.error("\nFAIL: demo lifetime XP", a.xp.lifetime); process.exit(1); }
console.log("\nAll checks passed.");
