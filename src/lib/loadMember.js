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
import quincy from "../data/quincy-elliott.snapshot.js";

export const SOURCES = [
  { key: "demo", label: "Jordan Rivera (demo)", raw: demo },
  { key: "quincy", label: "Quincy Elliott (Salesforce)", raw: quincy },
  { key: "andrew", label: "Andrew Thomas (Salesforce)", raw: andrew },
];

export function getRawMember(key) {
  return (SOURCES.find((s) => s.key === key) || SOURCES[0]).raw;
}

/* Testing options live in the URL so a view can be shared:
   ?member=quincy&staff=1&progxp=1&date=2027-04-12&sources=1 */
const DEFAULTS = { member: "demo", staff: false, progxp: false, date: "", sources: false };

export function readUrlState() {
  try {
    const p = new URLSearchParams(window.location.search);
    const date = p.get("date") || "";
    return {
      member: p.get("member") || "demo",
      staff: p.get("staff") === "1",
      progxp: p.get("progxp") === "1",
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
    for (const k of ["staff", "progxp", "sources"]) state[k] ? p.set(k, "1") : p.delete(k);
    state.date ? p.set("date", state.date) : p.delete("date");
    const q = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
  } catch {
    /* ignore */
  }
}
