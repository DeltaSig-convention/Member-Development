/* ════════════════════════════════════════════════════════════════
   RULES ENGINE — turns raw Salesforce data into the member summary.

   TEMPORARY HOME: once Tyler's objects and Flows exist (December),
   Salesforce calculates badges, XP and tier and stores them. This
   file then shrinks to reading those stored values. Until then it
   lets us test the rules against real records.

   Input:  a raw member record shaped like Salesforce (see docs/DATA_CONTRACT.md)
   Output: the member summary the dashboard renders
   ════════════════════════════════════════════════════════════════ */

import {
  TIERS, BADGES, PILLARS, PROGRAMS, CONVENTION_EVENT_TYPE, OFFICER_XP, OFFICER_ROLE_TYPE,
  CHAPTER_AWARD_XP, GIVING_XP, OFFICER_MIN_MONTHS, ACHIEVEMENTS, CHALLENGES, ANNUAL_XP_CAP,
  PROGRAM_YEAR_START_MONTH, POINTS_PER_XP, DEST, FEATURED, PROGRAM_ATTENDANCE_XP,
} from "../config/program.js";

const DAY = 86400000;
const toDate = (s) => (s ? new Date(`${String(s).slice(0, 10)}T12:00:00Z`) : null);
const iso = (d) => (d ? d.toISOString().slice(0, 10) : null);
const maxDate = (...ds) => ds.filter(Boolean).sort((a, b) => b - a)[0] || null;

export function programYearOf(d) {
  const y = d.getUTCFullYear();
  const start = d.getUTCMonth() + 1 >= PROGRAM_YEAR_START_MONTH ? y : y - 1;
  return { key: `${start}-${String(start + 1).slice(2)}`, start: new Date(Date.UTC(start, PROGRAM_YEAR_START_MONTH - 1, 1)) };
}

export function tierFor(xp) {
  let t = TIERS[0];
  for (const tier of TIERS) if (xp >= tier.min) t = tier;
  const i = TIERS.indexOf(t);
  const next = TIERS[i + 1] || null;
  const progress = next ? (xp - t.min) / (next.min - t.min) : 1;
  return { ...t, next, progress: Math.max(0, Math.min(1, progress)), xpToNext: next ? next.min - xp : 0 };
}

/* Which event registrations count as participation. Staff, facilitators and
   speakers are excluded unless includeStaff is on (testing with staff records). */
function countedRegistrations(raw, opts) {
  const ok = opts.includeStaff ? null : new Set(["Attendee", "Guest", null, undefined, ""]);
  return (raw.eventRegistrations || []).filter(
    (r) => r.attended && !r.cancelled && (ok ? ok.has(r.attendeeType) : true),
  );
}

function matchProgram(reg, program) {
  const list = Array.isArray(program) ? program : [program];
  return list.includes(reg.programType);
}

/* Evaluate one auto rule → { done, date, count, detail } */
function evalRule(rule, ctx) {
  if (!rule) return { done: false, count: 0 };
  if (rule.type === "program") {
    const hits = ctx.regs.filter((r) => matchProgram(r, rule.program)).sort((a, b) => toDate(a.beginDate) - toDate(b.beginDate));
    const min = rule.min || 1;
    const done = hits.length >= min;
    return { done, count: hits.length, date: done ? toDate(hits[min - 1].beginDate) : null, detail: hits.map((h) => h.eventName) };
  }
  if (rule.type === "convention") {
    const hits = ctx.regs.filter((r) => r.eventType === CONVENTION_EVENT_TYPE).sort((a, b) => toDate(a.beginDate) - toDate(b.beginDate));
    return { done: hits.length > 0, count: hits.length, date: hits[0] ? toDate(hits[0].beginDate) : null, detail: hits.map((h) => h.eventName) };
  }
  if (rule.type === "lms") {
    const passed = (ctx.raw.lmsEnrollments || []).filter((e) => e.result === "Passed").sort((a, b) => toDate(a.resultDate) - toDate(b.resultDate));
    const done = passed.length >= rule.min;
    return { done, count: passed.length, date: done ? toDate(passed[rule.min - 1].resultDate) : null };
  }
  if (rule.type === "role") {
    const hits = ctx.chapterRoles
      .filter((r) => rule.roles.includes(r.roleName) && (r.months || 0) >= (rule.minMonths || 0))
      .sort((a, b) => toDate(a.beginDate) - toDate(b.beginDate));
    return { done: hits.length > 0, count: hits.length, date: hits[0] ? toDate(hits[0].beginDate) : null, detail: hits.map((h) => h.roleName) };
  }
  return { done: false, count: 0 };
}

/* Self-reported actions (Formstack → Salesforce). Only approved ones count;
   Level I auto-approves, Level II/III wait for VPMX/HQ approval. */
function evalSelf(actionId, ctx) {
  const hits = ctx.selfReports.filter((s) => s.actionId === actionId && s.status === "approved").sort((a, b) => toDate(a.date) - toDate(b.date));
  const pending = ctx.selfReports.some((s) => s.actionId === actionId && s.status === "pending");
  return { done: hits.length > 0, count: hits.length, date: hits[0] ? toDate(hits[0].date) : null, pending };
}

function evalAction(a, ctx) {
  const auto = a.source === "auto" ? evalRule(a.rule, ctx) : null;
  const self = a.source === "self" || a.selfAlso ? evalSelf(a.id, ctx) : null;
  // For count-based auto rules that also accept self-reports (peer-led C&C), combine counts.
  if (auto && self && a.rule?.min > 1) {
    const total = auto.count + self.count;
    const done = total >= a.rule.min;
    return { done, date: done ? maxDate(auto.date, self.date) : null, via: "auto+self", count: total, pending: self.pending };
  }
  const best = [auto, self].filter(Boolean).find((r) => r.done) || auto || self;
  return { ...best, via: auto?.done ? "salesforce" : self?.done ? "self-report" : null, pending: self?.pending || false };
}

/* ── Badges ── */
function evaluateBadges(ctx) {
  const results = {};
  const ordered = [...BADGES].sort((a, b) => a.level - b.level);
  for (const b of ordered) {
    const actions = b.actions.map((a) => ({ ...a, ...evalAction(a, ctx) }));
    const doneActions = actions.filter((a) => a.done).sort((x, y) => x.date - y.date);
    let prereq = null;
    if (b.prereq) {
      const paths = b.prereq.anyOf.map((p) => {
        const r = p.source === "auto" ? evalRule(p.rule, ctx) : evalSelf(p.id, ctx);
        if (r.done && p.alsoNeeds) {
          const extra = evalSelf(p.alsoNeeds, ctx);
          return { ...p, ...r, done: extra.done, date: extra.done ? maxDate(r.date, extra.date) : null, partial: !extra.done };
        }
        return { ...p, ...r };
      });
      const met = paths.filter((p) => p.done).sort((x, y) => x.date - y.date)[0];
      prereq = { label: b.prereq.label, done: !!met, date: met?.date || null, via: met?.id || null, partial: paths.some((p) => p.partial), detail: met?.detail || null };
    }
    const actionsMet = doneActions.length >= b.need;
    const requirementsMet = actionsMet && (!prereq || prereq.done);
    const prev = BADGES.find((x) => x.pillar === b.pillar && x.level === b.level - 1);
    const prevEarned = !prev || results[prev.id]?.status === "earned";
    let status = "not_started";
    if (requirementsMet) status = prevEarned ? "earned" : "qualified";
    else if (doneActions.length > 0 || prereq?.done) status = "in_progress";

    const steps = b.need + (prereq ? 1 : 0);
    const stepsDone = Math.min(doneActions.length, b.need) + (prereq?.done ? 1 : 0);
    const reqDate = actionsMet ? doneActions[b.need - 1].date : null;
    const prevDate = prev ? results[prev.id]?.earnedDate : null;
    const earnedDate = status === "earned" ? maxDate(reqDate, prereq?.date, prevDate) : null;

    // lockedBy: the lower badge in this pillar that has to be earned first.
    const lockedBy = prev && !prevEarned ? { id: prev.id, name: prev.name, level: prev.level } : null;
    results[b.id] = { ...b, actions, prereq, status, progress: stepsDone / steps, stepsDone, steps, earnedDate, lockedBy };
  }
  return BADGES.map((b) => results[b.id]);
}

/* ── Bonus XP ── */
function officerTerms(ctx) {
  return ctx.chapterRoles
    .filter((r) => r.roleType === OFFICER_ROLE_TYPE && (r.months ?? 12) >= OFFICER_MIN_MONTHS)
    .flatMap((r) => {
      // One term per 12 months in office (Tyler: repeat terms each earn XP). Minimum 1.
      const terms = Math.max(1, Math.round((r.months || 12) / 12));
      const xp = r.roleName === "President" ? OFFICER_XP.president : r.execRole ? OFFICER_XP.execBoard : OFFICER_XP.other;
      return Array.from({ length: terms }, (_, i) => {
        const d = toDate(r.beginDate);
        const termDate = d ? new Date(d.getTime() + i * 365 * DAY) : null;
        return { kind: "officer", label: `${r.roleName}${terms > 1 ? ` — term ${i + 1}` : ""}`, xp, date: termDate };
      });
    });
}

function chapterAwards(ctx) {
  // Window opens at the New Member date (falls back to initiation) and closes at alumni status.
  const start = toDate(ctx.raw.contact.newMemberDate || ctx.raw.contact.initiationDate);
  const end = toDate(ctx.raw.contact.alumniDate) || ctx.today;
  return (ctx.raw.chapterAwards || []).flatMap((a) => {
    const rule = CHAPTER_AWARD_XP.find((r) => (a.awardName || "").includes(r.match));
    const d = toDate(a.dateAwarded);
    // Only awards won while this member was an undergraduate.
    if (!rule || !d || !start || d < start || d > end) return [];
    return [{ kind: "award", label: `${rule.label} (${d.getUTCFullYear()})`, xp: rule.xp, date: d }];
  });
}

function giving(ctx) {
  const g = ctx.raw.giving || {};
  const y = ctx.today.getUTCFullYear();
  const out = [];
  const firstGiftDate = g.giftLastYear ? new Date(Date.UTC(y - 1, 11, 31)) : g.giftThisYear ? ctx.today : null;
  // Giving is stored yes/no by calendar year, so dates are the year, not the day (approx).
  if (firstGiftDate) out.push({ kind: "giving", label: "First gift to the Foundation", xp: GIVING_XP.firstGift, date: firstGiftDate, approx: true });
  if (g.giftLastYear && g.giftThisYear) out.push({ kind: "giving", label: "Second consecutive year of giving", xp: GIVING_XP.consecutiveYear, date: ctx.today, approx: true });
  if (g.societyMember) out.push({ kind: "giving", label: "Society member", xp: GIVING_XP.society, date: ctx.today, approx: true });
  return out;
}

/* ── Ledger with annual cap ── */
function buildLedger(entries) {
  const sorted = entries.filter((e) => e.date && e.xp > 0).sort((a, b) => a.date - b.date);
  const byYear = {};
  return sorted.map((e) => {
    const py = programYearOf(e.date).key;
    const used = byYear[py] || 0;
    const allowed = Math.max(0, Math.min(e.xp, ANNUAL_XP_CAP - used));
    byYear[py] = used + allowed;
    return { ...e, programYear: py, xpAwarded: allowed, capped: allowed < e.xp };
  });
}

/* ── Audience (org-wide vs targeted content) ── */
const isAlumni = (raw) => raw.contact.status === "Alumnus" || !!raw.contact.alumniDate;
function didAttend(program, ctx) {
  if (program === "convention") return ctx.regs.some((r) => r.eventType === CONVENTION_EVENT_TYPE);
  return ctx.regs.some((r) => matchProgram(r, program));
}
export function matchesAudience(aud = {}, ctx, lifetimeXP = 0) {
  if (aud.status === "undergrad" && isAlumni(ctx.raw)) return false;
  if (aud.status === "alumni" && !isAlumni(ctx.raw)) return false;
  if (aud.notAttended && didAttend(aud.notAttended, ctx)) return false;
  if (aud.attended && !didAttend(aud.attended, ctx)) return false;
  if (aud.chapters && !aud.chapters.includes(ctx.raw.contact.chapterId)) return false;
  if (aud.minTier) {
    const need = TIERS.find((t) => t.key === aud.minTier);
    if (need && lifetimeXP < need.min) return false;
  }
  return true;
}
const kindOf = (aud = {}) => (Object.keys(aud).some((k) => k !== "status") || (aud.status && aud.status !== "all") ? "targeted" : "org");
const between = (d, a, b) => d >= toDate(a) && d <= toDate(b);

function pickFeatured(ctx, lifetimeXP) {
  const live = FEATURED.filter((f) => between(ctx.today, f.show[0], f.show[1]) && matchesAudience(f.audience, ctx, lifetimeXP)).sort((a, b) => a.priority - b.priority);
  const f = live[0] || FEATURED.find((x) => x.fallback);
  return f ? { ...f, kind: kindOf(f.audience), considered: live.map((x) => x.id) } : null;
}

/* ── Challenges ── */
function challengeProgress(ctx, badges, lifetimeXP) {
  const dated = badges.flatMap((b) => b.actions.filter((a) => a.done && a.date).map((a) => ({ pillar: b.pillar, date: a.date })));
  const inWindow = (c, x) => between(x.date, c.start, c.end);
  const a = CHALLENGES.anchor;
  let anchor = null;
  if (between(ctx.today, a.showFrom, a.end) && matchesAudience(a.audience, ctx, lifetimeXP)) {
    const pillarsHit = new Set(dated.filter((x) => inWindow(a, x)).map((x) => x.pillar)).size;
    anchor = { ...a, kind: kindOf(a.audience), done: pillarsHit, tiers: a.tiers.map((t) => ({ ...t, hit: pillarsHit >= t.need })), upcoming: ctx.today < toDate(a.start), active: between(ctx.today, a.start, a.end) };
  }
  const preview = (CHALLENGES.previewDays || 0) * DAY;
  const timed = CHALLENGES.timed
    .filter((c) => toDate(c.end) >= ctx.today && toDate(c.start).getTime() - preview <= ctx.today.getTime() && matchesAudience(c.audience, ctx, lifetimeXP))
    .map((c) => {
      const done = dated.filter((x) => x.pillar === c.pillar && inWindow(c, x)).length;
      return { ...c, kind: kindOf(c.audience), done: Math.min(done, c.need), complete: done >= c.need, active: ctx.today >= toDate(c.start) };
    });
  return { anchor, timed };
}

/* ── Program attendance XP ── */
function programAttendance(ctx) {
  return PROGRAM_ATTENDANCE_XP.flatMap((rule) => {
    const hits = rule.program === "convention"
      ? ctx.regs.filter((r) => r.eventType === CONVENTION_EVENT_TYPE)
      : ctx.regs.filter((r) => matchProgram(r, rule.program));
    return hits.map((r) => ({ kind: "program", label: `Attended ${r.eventName}`, xp: rule.xp, date: toDate(r.beginDate) }));
  });
}

/* ── Recommendations ── */
function upNext(badges, ctx, givingEntries) {
  const items = [];
  for (const p of PILLARS) {
    const next = badges.filter((b) => b.pillar === p.key && b.status !== "earned").sort((a, b) => a.level - b.level)[0];
    if (!next) continue;
    if (next.prereq && !next.prereq.done) {
      items.push({ kind: "personal", id: `${next.id}-prereq`, pillar: p.key, badgeId: next.id, progress: next.progress, action: next.prereq.label.split(" OR ")[0], context: `Unlocks ${next.name} (Level ${next.level})`, dest: next.dest });
      continue;
    }
    const todo = next.actions.find((a) => !a.done && !a.pending && !a.flag) || next.actions.find((a) => !a.done);
    if (!todo) continue;
    const left = next.need - Math.min(next.actions.filter((a) => a.done).length, next.need);
    // If the member already has this pillar's Level III prerequisite (e.g. attended CA),
    // say so — the small steps are what stand between them and the top badge.
    const top = badges.find((b) => b.pillar === p.key && b.level === 3);
    const headStart = top && top.status !== "earned" && top.prereq?.done && next.level < 3;
    const ctxLine = left === 1 ? `1 action from ${next.name}` : `${left} actions from ${next.name}`;
    items.push({ kind: "personal", id: `${next.id}-${todo.id}`, pillar: p.key, badgeId: next.id, progress: next.progress, action: todo.text, context: headStart ? `${ctxLine} · you've already done the hard part of ${top.name}` : ctxLine, headStart: headStart ? top.name : null, dest: todo.dest });
  }
  items.sort((a, b) => (b.headStart ? 1 : 0) - (a.headStart ? 1 : 0) || b.progress - a.progress);
  const top = items.slice(0, 3);
  if (!givingEntries.length && top.length >= 3) top[2] = { kind: "personal", id: "first-gift", pillar: null, progress: 0, action: "Make your first Foundation gift", context: `Earn ${GIVING_XP.firstGift} XP and the First Gift achievement`, dest: "foundation" };
  return top.map((t) => ({ ...t, cta: DEST[t.dest]?.label || "Learn more", url: DEST[t.dest]?.url || null }));
}

/* ── Main ── */
export function buildMemberSummary(raw, opts = {}) {
  const today = toDate(opts.today || new Date().toISOString());
  const chapterId = raw.contact.chapterId;
  const ctx = {
    raw, opts, today,
    regs: countedRegistrations(raw, opts),
    chapterRoles: (raw.officerRoles || []).filter((r) => !chapterId || !r.groupId || r.groupId === chapterId),
    selfReports: raw.selfReports || [],
  };

  const badges = evaluateBadges(ctx);
  const badgeEntries = badges.filter((b) => b.status === "earned").map((b) => ({ kind: "badge", label: `Earned ${b.name}`, xp: b.xp, date: b.earnedDate, pillar: b.pillar, badgeId: b.id }));
  const officer = officerTerms(ctx);
  const awards = chapterAwards(ctx);
  const givingEntries = giving(ctx);
  const attendance = opts.programXP === false ? [] : programAttendance(ctx);
  const ledger = buildLedger([...badgeEntries, ...attendance, ...officer, ...awards, ...givingEntries]);

  const lifetimeXP = ledger.reduce((s, e) => s + e.xpAwarded, 0);
  const redeemed = (raw.redemptions || []).reduce((s, r) => s + r.points, 0);
  const currentPY = programYearOf(today);
  const programYearEarned = ledger.filter((e) => e.programYear === currentPY.key).reduce((s, e) => s + e.xpAwarded, 0);
  const tier = tierFor(lifetimeXP);

  const earned = badges.filter((b) => b.status === "earned");
  const pillars = PILLARS.map((p) => {
    const pb = badges.filter((b) => b.pillar === p.key);
    const next = pb.filter((b) => b.status !== "earned").sort((a, b) => a.level - b.level)[0] || null;
    return { ...p, earnedCount: pb.filter((b) => b.status === "earned").length, total: pb.length, nextBadgeId: next?.id || null, nextBadgeName: next?.name || null };
  });

  const yearlyTotals = ledger.reduce((m, e) => ((m[e.programYear] = (m[e.programYear] || 0) + e.xpAwarded), m), {});
  const programRegs = ctx.regs.filter((r) => [PROGRAMS.careerAccelerator, PROGRAMS.cei, PROGRAMS.leadershipInstitute].includes(r.programType));
  const flagshipsDone = new Set(programRegs.map((r) => r.programType));
  const g = raw.giving || {};
  // Registered for an upcoming Convention, or attended one.
  const registeredConvention = (raw.eventRegistrations || []).some((r) => r.eventType === CONVENTION_EVENT_TYPE && !r.cancelled && toDate(r.beginDate) >= today)
    || ctx.regs.some((r) => r.eventType === CONVENTION_EVENT_TYPE);

  const achieved = {
    first_steps: earned.length >= 1,
    pillar_pioneer: PILLARS.every((p) => earned.some((b) => b.pillar === p.key)),
    silver_lining: lifetimeXP >= TIERS[1].min,
    century_club: Object.values(yearlyTotals).some((v) => v >= 1000),
    tier1_complete: badges.filter((b) => b.level === 1).every((b) => b.status === "earned"),
    three_peater: flagshipsDone.size === 3,
    convention_bound: registeredConvention,
    full_pyramid: earned.length === BADGES.length,
    first_gift: !!(g.giftThisYear || g.giftLastYear),
    loyal_donor: !!(g.giftThisYear && g.giftLastYear),
    society_member: !!g.societyMember,
  };

  const months = ledger.reduce((m, e) => {
    const k = iso(e.date).slice(0, 7);
    m[k] = (m[k] || 0) + e.xpAwarded;
    return m;
  }, {});
  const best = Object.entries(months).sort((a, b) => b[1] - a[1])[0];
  const init = toDate(raw.contact.initiationDate || raw.contact.newMemberDate);
  const recentBadge = earned.filter((b) => b.earnedDate && today - b.earnedDate <= 30 * DAY).sort((a, b) => b.earnedDate - a.earnedDate)[0];

  const notes = [];
  if (opts.includeStaff) notes.push("Counting staff and facilitator attendance (testing only).");
  if (opts.today) notes.push(`Viewing as of ${iso(today)} (testing date).`);
  if (!(raw.selfReports || []).length) notes.push("Self-reported actions arrive once the Formstack forms are built.");

  return {
    source: raw.source,
    asOf: raw.asOf,
    member: {
      id: raw.contact.id,
      firstName: raw.contact.firstName,
      lastName: raw.contact.lastName,
      initials: `${raw.contact.firstName?.[0] || ""}${raw.contact.lastName?.[0] || ""}`,
      chapter: raw.contact.chapterName,
      school: raw.contact.school,
      status: raw.contact.status,
      classYear: raw.contact.classYear || null,
      photoUrl: raw.contact.photoUrl || null,
    },
    tier,
    xp: { lifetime: lifetimeXP, currentPoints: lifetimeXP * POINTS_PER_XP - redeemed, programYear: currentPY.key, programYearEarned, annualCap: ANNUAL_XP_CAP },
    badges,
    pillars,
    bonus: { officer, awards, giving: givingEntries, attendance },
    ledger: [...ledger].reverse(),
    achievements: ACHIEVEMENTS.map((a) => ({ ...a, earned: !!achieved[a.id] })),
    upNext: upNext(badges, ctx, givingEntries),
    challenges: challengeProgress(ctx, badges, lifetimeXP),
    featured: pickFeatured(ctx, lifetimeXP),
    today: iso(today),
    stats: {
      bestMonth: best ? { label: new Date(`${best[0]}-15T12:00:00Z`).toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }), xp: best[1] } : null,
      badgesThisYear: earned.filter((b) => programYearOf(b.earnedDate).key === currentPY.key).length,
      daysSinceInitiation: init ? Math.floor((today - init) / DAY) : null,
      actionsCompleted: badges.reduce((s, b) => s + b.actions.filter((a) => a.done).length, 0),
      programsAttended: ctx.regs.length,
      serviceHours: (raw.selfReports || []).filter((s) => s.hours && s.status === "approved").reduce((s, r) => s + r.hours, 0) || null,
    },
    celebrate: recentBadge?.id || null,
    notes,
  };
}
