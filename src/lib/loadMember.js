/* ════════════════════════════════════════════════════════════════
   DATA LOADER — the one place the dashboard gets member data.

   Today: returns a bundled snapshot (demo member or Andrew's record).
   Later (Laravel on Delta Tech): replace getRawMember() with
     fetch(`/api/member/${contactId18}`).then(r => r.json())
   The server returns the same raw shape (docs/DATA_CONTRACT.md),
   so nothing else in the app changes.
   ════════════════════════════════════════════════════════════════ */
import demo from "../data/demo-member.js";
import andrew from "../data/andrew-thomas.snapshot.js";
import betaMu from "../data/beta-mu.snapshot.js";

const keyFor = (c) => (c.id === "0034V00004y7UjDQAU" ? "quincy" : c.id);
const byName = (a, b) => `${a.contact.lastName} ${a.contact.firstName}`.localeCompare(`${b.contact.lastName} ${b.contact.firstName}`);

export const SOURCES = [
  { key: "demo", label: "Jordan Rivera (demo)", group: "Demo", raw: demo },
  { key: "andrew", label: "Andrew Thomas (Salesforce)", group: "Staff", raw: andrew },
  ...[...betaMu].sort(byName).map((r) => ({ key: keyFor(r.contact), label: `${r.contact.firstName} ${r.contact.lastName}${r.contact.status === "New Member" ? " (NM)" : ""}`, group: "Beta Mu · Transylvania (Salesforce)", raw: r })),
];

/* Chapter rosters for the leaderboard and rarity. In production: every
   Contact in the member's chapter, with stored Lifetime XP. */
const ROSTERS = { [betaMu[0].contact.chapterId]: betaMu };
export function getChapterRoster(chapterId) {
  return ROSTERS[chapterId] || null;
}

export function getRawMember(key) {
  return (SOURCES.find((s) => s.key === key) || SOURCES[0]).raw;
}

/* Testing options live in the URL so a view can be shared:
   ?member=quincy&staff=1&date=2027-04-12&sources=1 */
const DEFAULTS = { member: "demo", staff: false, date: "", sources: false };

export function readUrlState() {
  try {
    const p = new URLSearchParams(window.location.search);
    const date = p.get("date") || "";
    return {
      member: p.get("member") || "demo",
      staff: p.get("staff") === "1",
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
      sources: p.get("sources") === "1",
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeUrlState(state) {
  try {
    const p = new URLSearchParams(window.location.search);
    state.member === "demo" ? p.delete("member") : p.set("member", state.member);
    p.delete("progxp"); // retired: program attendance XP is now always on
    for (const k of ["staff", "sources"]) state[k] ? p.set(k, "1") : p.delete(k);
    state.date ? p.set("date", state.date) : p.delete("date");
    const q = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
  } catch {
    /* ignore */
  }
}
