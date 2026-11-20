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

export const SOURCES = [
  { key: "demo", label: "Jordan Rivera (demo)", raw: demo },
  { key: "andrew", label: "Andrew Thomas (Salesforce)", raw: andrew },
];

export function getRawMember(key) {
  return (SOURCES.find((s) => s.key === key) || SOURCES[0]).raw;
}

export function readUrlState() {
  try {
    const p = new URLSearchParams(window.location.search);
    return { member: p.get("member") || "demo", staff: p.get("staff") === "1" };
  } catch {
    return { member: "demo", staff: false };
  }
}

export function writeUrlState({ member, staff }) {
  try {
    const p = new URLSearchParams(window.location.search);
    member === "demo" ? p.delete("member") : p.set("member", member);
    staff ? p.set("staff", "1") : p.delete("staff");
    const q = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
  } catch {
    /* ignore */
  }
}
