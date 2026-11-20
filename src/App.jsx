import { useEffect, useMemo, useState } from "react";
import {
  Briefcase, Handshake, BookOpen, Users, CheckCircle2, Shield, Star, Check, Award, Lock, Gift, ShoppingBag, X, Zap,
  Target, Crown, Medal, Circle, Heart, ChevronDown, ChevronUp, Sparkles, Map as MapIcon, ExternalLink, UserCog, Trophy,
  ArrowUpRight, ArrowDownRight, Minus, Home, Bell, ChevronLeft, Sun, Moon, TrendingUp, Calendar, Gem, Database, FileText,
  Clock, Info, SlidersHorizontal, Tag,
} from "lucide-react";
import { BRAND, PILLARS, DEST, REWARDS, TIERS, BADGES as BADGE_CONFIG } from "./config/program.js";
import { buildMemberSummary } from "./lib/engine.js";
import { SOURCES, getRawMember, getChapterRoster, readUrlState, writeUrlState } from "./lib/loadMember.js";
import DEMO_CHAPTER, { RARITY_PREVIEW } from "./data/demo-chapter.js";

/* ═══════════════════ THEME ═══════════════════ */
const ICONS = { Users, Briefcase, Handshake, BookOpen, Star, Shield, Medal, Zap, Award, Trophy, Map: MapIcon, Crown, Heart, Sparkles, Gem };
const LIGHT = { bg: BRAND.carnation, card: "#ffffff", surface: "#f9f8f4", text: "#111111", textSec: "#555555", textMuted: "#8f8f8f", border: "#e8e6e1", borderLight: "#f2f0ec", heroGrad: `linear-gradient(160deg, ${BRAND.sphinx} 0%, ${BRAND.nileDark} 55%, ${BRAND.nile} 100%)` };
const DARK = { bg: "#0e0e0e", card: "#1a1a1a", surface: "#141414", text: "#e8e8e8", textSec: "#a8a8a8", textMuted: "#6c6c6c", border: "#2a2a2a", borderLight: "#222222", heroGrad: `linear-gradient(160deg, #06120d 0%, #0d2a1d 55%, #12392a 100%)` };
const PILLAR = Object.fromEntries(PILLARS.map((p) => [p.key, { ...p, Icon: ICONS[p.icon] }]));
const TIER_BY_KEY = Object.fromEntries(TIERS.map((t) => [t.key, t]));
const h = (x) => ({ fontFamily: "'Montserrat',sans-serif", fontWeight: 600, ...x });
const hB = (x) => ({ fontFamily: "'Montserrat',sans-serif", fontWeight: 700, ...x });
const bd = (x) => ({ fontFamily: "'Lato',sans-serif", fontWeight: 400, ...x });
const bB = (x) => ({ fontFamily: "'Lato',sans-serif", fontWeight: 700, ...x });
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "");
const ago = (d, today) => {
  if (!d) return "";
  const days = Math.round((today - new Date(d)) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (days < 365) return `${Math.round(days / 30)} mo ago`;
  return fmtDate(d);
};

/* ═══════════════════ APP ═══════════════════ */
export default function App() {
  const initial = readUrlState();
  const [memberKey, setMemberKey] = useState(initial.member);
  const [includeStaff, setIncludeStaff] = useState(initial.staff);
  const [testDate, setTestDate] = useState(initial.date);
  const [showSources, setShowSources] = useState(initial.sources);
  const [testOpen, setTestOpen] = useState(false);
  const [rankView, setRankView] = useState("chapter");
  const [tab, setTab] = useState("dashboard");
  const [dark, setDark] = useState(true);
  const [showRewards, setShowRewards] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState(null);
  // Only re-render when crossing the desktop/mobile breakpoint, not on every resize
  // (mobile browsers fire resize while scrolling, which would replay animations).
  const [desk, setDesk] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setDesk(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  useEffect(() => writeUrlState({ member: memberKey, staff: includeStaff, date: testDate, sources: showSources }), [memberKey, includeStaff, testDate, showSources]);

  const m = useMemo(
    () => buildMemberSummary(getRawMember(memberKey), { includeStaff, ...(testDate ? { today: testDate } : {}) }),
    [memberKey, includeStaff, testDate],
  );
  // Real chapter roster (Beta Mu today) — every brother run through the same rules.
  const chapter = useMemo(() => {
    const raws = getChapterRoster(getRawMember(memberKey).contact.chapterId);
    if (!raws) return null;
    const opts = testDate ? { today: testDate } : {};
    const list = raws.map((r) => buildMemberSummary(r, opts));
    const rarity = {};
    for (const b of BADGE_CONFIG) rarity[b.id] = Math.round((100 * list.filter((x) => x.badges.find((y) => y.id === b.id)?.status === "earned").length) / list.length);
    return { list, rarity, name: raws[0].contact.chapterName };
  }, [memberKey, testDate]);
  const [celebration, setCelebration] = useState(m.celebrate);
  useEffect(() => setCelebration(m.celebrate), [m.celebrate]);

  const today = new Date(`${m.today}T12:00:00Z`);
  const T = dark ? DARK : LIGHT;
  const card = { background: T.card, borderRadius: 10, padding: "18px 20px", boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.06)", border: `1px solid ${T.borderLight}` };
  const badgeById = Object.fromEntries(m.badges.map((b) => [b.id, b]));
  const earned = m.badges.filter((b) => b.status === "earned");
  const latestBadge = [...earned].sort((a, b) => b.earnedDate - a.earnedDate)[0];
  const selectedBadge = selectedBadgeId ? badgeById[selectedBadgeId] : null;
  const isReal = m.source !== "demo";

  /* ── small components ── */
  const TierPill = useMemo(() => ({ tierKey }) => {
    const t = TIER_BY_KEY[tierKey];
    return <span style={h({ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: `${t.color}1f`, color: t.color, border: `1px solid ${t.color}40` })}>{t.label}</span>;
  }, []);
  const DL = useMemo(() => ({ dest }) => {
    const d = DEST[dest];
    if (!d) return null;
    if (!d.url) return <span style={h({ fontSize: 10, color: T.textMuted })}>{d.label}</span>;
    return <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 3, ...h({ fontSize: 10, color: BRAND.nileLight, textDecoration: "none" }) }}>{d.label}<ExternalLink size={9} /></a>;
  }, [T]);
  const SourceChip = useMemo(() => ({ a }) => {
    if (a.done) return <span style={bd({ fontSize: 10, color: BRAND.nileLight })}>{a.via === "salesforce" ? "From Salesforce" : a.via === "auto+self" ? "Salesforce + self-report" : "Self-reported"}</span>;
    if (a.pending) return <span style={bd({ fontSize: 10, color: BRAND.gold })}>Pending approval</span>;
    if (a.flag) return <span style={bd({ fontSize: 10, color: T.textMuted })}>{a.flag}</span>;
    return <span style={bd({ fontSize: 10, color: T.textMuted })}>{a.source === "auto" ? "Tracked automatically" : "Self-report form · coming soon"}</span>;
  }, [T]);
  const BadgeShape = useMemo(() => ({ level, color, earned: e, size = 40 }) => {
    const base = { width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: e ? color : `${color}14`, border: e ? "none" : `2px dashed ${color}55` };
    const icon = e ? <Check size={size * 0.42} color="#fff" /> : level === 1 ? <Circle size={size * 0.3} color={color} /> : level === 2 ? <Shield size={size * 0.36} color={color} /> : <Crown size={size * 0.36} color={color} />;
    if (level === 1) return <div style={{ ...base, borderRadius: "50%" }}>{icon}</div>;
    if (level === 2) return <div style={{ ...base, borderRadius: "14%" }}>{icon}</div>;
    return <div style={{ ...base, borderRadius: "50%", background: e ? `linear-gradient(135deg, ${color}, ${color}bb)` : base.background, ...(e ? { animation: "glow 2.5s ease infinite", "--gc": color } : {}) }}>{icon}</div>;
  }, []);
  const Bar = useMemo(() => ({ pct, color, height = 4 }) => (
    <div style={{ height, borderRadius: height, background: T.borderLight }}>
      <div style={{ height, borderRadius: height, width: `${Math.round(pct * 100)}%`, background: color, transformOrigin: "left", animation: "fillBar 0.8s ease" }} />
    </div>
  ), [T]);
  // Rarity: real share of the member's chapter when we have the roster, sample org-wide numbers otherwise.
  const Rarity = useMemo(() => ({ id }) => {
    const r = chapter ? chapter.rarity[id] : RARITY_PREVIEW[id];
    if (r == null) return null;
    const label = r < 10 ? "Rare" : r < 30 ? "Uncommon" : "Common";
    const color = r < 10 ? BRAND.gold : r < 30 ? "#a983c4" : T.textMuted;
    return <span style={bd({ fontSize: 10, color })}>{label} · {r}% of {chapter ? chapter.name : "members"}</span>;
  }, [T, chapter]);

  /* ── navigation ── */
  const navItems = [
    { k: "dashboard", l: "Home", Ic: Home },
    { k: "badges", l: "Badges", Ic: Award },
    { k: "leaderboard", l: "Rank", Ic: Trophy },
    { k: "activity", l: "Activity", Ic: Bell },
  ];
  const go = (k) => { setTab(k); setSelectedBadgeId(null); window.scrollTo?.(0, 0); };

  /* Where a piece of content comes from — shown when "Show content sources" is on. */
  const SRC = {
    personal: ["Personal", "Calculated from this member's Salesforce records", BRAND.nileLight],
    org: ["Org-wide", "Scheduled by HQ for every member", BRAND.gold],
    targeted: ["Targeted", "Scheduled by HQ for members who match an audience", "#a983c4"],
  };
  const Src = useMemo(() => ({ kind, style }) => {
    if (!showSources || !SRC[kind]) return null;
    const [l, d, c] = SRC[kind];
    return <span title={d} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 4, background: `${c}1c`, border: `1px dashed ${c}88`, ...h({ fontSize: 9, color: c, letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }), ...style }}><Tag size={9} color={c} />{l}</span>;
  }, [T, showSources]);

  const check = (label, value, set) => (
    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", ...bd({ fontSize: 11, color: T.textSec }) }}>
      <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />{label}
    </label>
  );
  const inputStyle = { ...bd({ fontSize: 12, color: T.text }), maxWidth: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 8px", colorScheme: dark ? "dark" : "light" };
  const TestingPanel = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <p style={h({ fontSize: 10, color: T.textMuted, letterSpacing: "0.06em" })}>TESTING</p>
      <select aria-label="Member to view" value={memberKey} onChange={(e) => setMemberKey(e.target.value)} style={inputStyle}>
        {[...new Set(SOURCES.map((s) => s.group))].map((g) => (
          <optgroup key={g} label={g}>{SOURCES.filter((s) => s.group === g).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</optgroup>
        ))}
      </select>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input type="date" aria-label="Pretend today is" value={testDate} onChange={(e) => setTestDate(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 0 }} />
        {testDate && <button onClick={() => setTestDate("")} style={{ ...bd({ fontSize: 11, color: BRAND.nileLight }), background: "none", border: "none", cursor: "pointer", padding: 0 }}>Today</button>}
      </div>
      <p style={bd({ fontSize: 10, color: T.textMuted, marginTop: -5 })}>Pretend today is… (see how content rotates)</p>
      {isReal && check("Count staff attendance", includeStaff, setIncludeStaff)}
      {check("Show content sources", showSources, setShowSources)}
    </div>
  );

  const Sidebar = () => (
    <div style={{ width: 210, position: "fixed", left: 0, top: 52, bottom: 0, background: T.card, borderRight: `1px solid ${T.border}`, padding: "20px 0", zIndex: 40, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {navItems.map((n) => (
        <button key={n.k} onClick={() => go(n.k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", width: "100%", background: tab === n.k ? `${BRAND.nile}18` : "transparent", color: tab === n.k ? BRAND.nileLight : T.textMuted, border: "none", borderRight: tab === n.k ? `3px solid ${BRAND.nileLight}` : "3px solid transparent", cursor: "pointer", ...h({ fontSize: 13, textAlign: "left" }) }}>
          <n.Ic size={18} strokeWidth={tab === n.k ? 2.2 : 1.6} />{n.l}
        </button>
      ))}
      <div style={{ marginTop: "auto", padding: "16px 20px 0", display: "flex", flexDirection: "column", gap: 16, borderTop: `1px solid ${T.borderLight}` }}>
        {TestingPanel()}
        <button onClick={() => setDark(!dark)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 0, ...bd({ fontSize: 12 }) }}>{dark ? <Sun size={14} /> : <Moon size={14} />}{dark ? "Light mode" : "Dark mode"}</button>
      </div>
    </div>
  );

  const BottomNav = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around", padding: "6px 0 10px", zIndex: 50 }}>
      {navItems.map((n) => (
        <button key={n.k} onClick={() => go(n.k)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "4px 12px", color: tab === n.k ? BRAND.nileLight : T.textMuted }}>
          <n.Ic size={20} strokeWidth={tab === n.k ? 2.4 : 1.6} /><span style={h({ fontSize: 10 })}>{n.l}</span>
        </button>
      ))}
    </div>
  );

  /* ── overlays ── */
  const Celebration = () => {
    const b = celebration && badgeById[celebration];
    if (!b) return null;
    const p = PILLAR[b.pillar];
    return (
      <div onClick={() => setCelebration(null)} style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.72)", animation: "fadeIn 0.3s ease" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", animation: "celebIn 0.5s ease", padding: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}><BadgeShape level={b.level} color={p.color} earned size={84} /></div>
          <p style={bd({ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 6 })}>Badge earned</p>
          <p style={hB({ fontSize: 26, color: "#fff", marginBottom: 8 })}>{b.name}</p>
          <p style={bd({ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 6 })}>{p.label} ▴ Level {b.level}</p>
          <Rarity id={b.id} />
          <p style={hB({ fontSize: 22, color: BRAND.gold, margin: "16px 0 24px", animation: "countUp 0.5s ease 0.3s both" })}>+{b.xp} XP</p>
          <button onClick={() => setCelebration(null)} style={{ ...h({ fontSize: 13 }), padding: "10px 28px", borderRadius: 8, border: "none", background: BRAND.gold, color: BRAND.sphinx, cursor: "pointer" }}>Continue</button>
        </div>
      </div>
    );
  };

  const Rewards = () => (
    <div onClick={() => setShowRewards(false)} style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "80vh", background: T.card, borderRadius: 16, padding: "24px 20px 28px", overflowY: "auto", margin: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <p style={hB({ fontSize: 18, color: T.text })}>Rewards</p>
          <button onClick={() => setShowRewards(false)} aria-label="Close" style={{ background: T.surface, border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color={T.textSec} /></button>
        </div>
        <p style={bd({ fontSize: 13, color: T.textSec, marginBottom: 4 })}>You have <strong style={{ color: BRAND.nileLight }}>{m.xp.currentPoints.toLocaleString()} points</strong> to spend.</p>
        <p style={bd({ fontSize: 11, color: T.textMuted, marginBottom: 18 })}>Spending points never lowers your tier — tiers run on lifetime XP. Redemptions open once the rewards catalog is final.</p>
        {REWARDS.map((r) => {
          const ok = m.xp.currentPoints >= r.cost;
          return (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: T.surface, borderRadius: 10, opacity: ok ? 1 : 0.5, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${BRAND.gold}1a`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Gift size={17} color={BRAND.gold} /></div>
              <div style={{ flex: 1 }}><p style={h({ fontSize: 13, color: T.text })}>{r.name}</p><p style={bd({ fontSize: 11, color: T.textMuted })}>{r.cat}</p></div>
              <span style={{ ...h({ fontSize: 11 }), padding: "6px 12px", borderRadius: 6, background: ok ? `${BRAND.nile}30` : T.border, color: ok ? BRAND.nileLight : T.textMuted }}>{r.cost} pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ── dashboard sections ── */
  /* Featured program — picked by the engine from the FEATURED schedule (config). */
  const Featured = () => {
    const f = m.featured;
    if (!f) return null;
    return (
      <div style={{ background: T.heroGrad, borderRadius: 10, padding: "20px 20px 18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 160, height: 160, background: `radial-gradient(circle at 100% 0%, ${BRAND.gold}26 0%, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <p style={h({ fontSize: 10, color: BRAND.gold, letterSpacing: "0.08em", textTransform: "uppercase" })}>{f.eyebrow}</p>
            <Src kind={f.kind} />
          </div>
          <p style={hB({ fontSize: 18, color: "#fff", lineHeight: 1.25, marginBottom: 6 })}>{f.title}</p>
          <p style={bd({ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, marginBottom: 14 })}>{f.sub}</p>
          <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 6, background: BRAND.gold, color: BRAND.sphinx, ...h({ fontSize: 12, textDecoration: "none" }) }}>{f.cta} <ExternalLink size={11} /></a>
        </div>
      </div>
    );
  };

  /* Who you are + where you stand: tier ring around the avatar, points, program-year cap. */
  const StatusBand = () => {
    const r = 40, circ = 2 * Math.PI * r;
    return (
      <div style={{ ...card, padding: desk ? "20px 24px" : "18px", display: "flex", flexDirection: desk ? "row" : "column", alignItems: desk ? "center" : "stretch", gap: desk ? 28 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
          <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 96 96" style={{ position: "absolute", inset: 0 }}>
              <circle cx="48" cy="48" r={r} fill="none" stroke={T.borderLight} strokeWidth="5" />
              <circle cx="48" cy="48" r={r} fill="none" stroke={m.tier.color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={circ * (1 - m.tier.progress)} strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
            </svg>
            <div style={{ position: "absolute", inset: 14, borderRadius: "50%", background: T.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={hB({ fontSize: 22, color: T.textSec })}>{m.member.initials}</span>
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={hB({ fontSize: 20, color: T.text })}>{m.member.firstName} {m.member.lastName}</p>
            <p style={bd({ fontSize: 12, color: T.textSec, marginBottom: 8 })}>{[m.member.chapter, m.member.school, m.member.classYear ? `Class of ${m.member.classYear}` : m.member.status].filter(Boolean).join(" ▴ ")}</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <TierPill tierKey={m.tier.key} />
              <span style={bd({ fontSize: 12, color: T.textSec })}>{earned.length} badge{earned.length === 1 ? "" : "s"}{latestBadge ? ` · latest ${latestBadge.name}` : ""}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: desk ? 28 : 12, alignItems: "stretch", ...(desk ? {} : { borderTop: `1px solid ${T.borderLight}`, paddingTop: 14 }) }}>
          <div style={{ minWidth: desk ? 150 : 0, flex: desk ? "none" : 1 }}>
            <p style={bd({ fontSize: 11, color: T.textMuted })}>Lifetime XP</p>
            <p style={hB({ fontSize: 26, color: T.text, lineHeight: 1.1 })}>{m.xp.lifetime.toLocaleString()}</p>
            <p style={bd({ fontSize: 11, color: m.tier.color, marginTop: 2 })}>{m.tier.next ? `${m.tier.xpToNext.toLocaleString()} XP to ${m.tier.next.label}` : "Top tier reached"}</p>
          </div>
          <div style={{ width: 1, background: T.borderLight }} />
          <div onClick={() => setShowRewards(true)} style={{ minWidth: desk ? 150 : 0, flex: desk ? "none" : 1, cursor: "pointer" }}>
            <p style={bd({ fontSize: 11, color: T.textMuted })}>Points to spend</p>
            <p style={hB({ fontSize: 26, color: BRAND.nileLight, lineHeight: 1.1 })}>{m.xp.currentPoints.toLocaleString()}</p>
            <p style={{ ...h({ fontSize: 11, color: BRAND.nileLight, marginTop: 2 }), display: "flex", alignItems: "center", gap: 4 }}><ShoppingBag size={11} /> Rewards</p>
          </div>
          {desk && <div style={{ width: 1, background: T.borderLight }} />}
          {desk && (
            <div style={{ minWidth: 170 }}>
              <p style={bd({ fontSize: 11, color: T.textMuted })}>Earned in {m.xp.programYear} (annual cap)</p>
              <p style={hB({ fontSize: 26, color: T.text, lineHeight: 1.1 })}>{m.xp.programYearEarned.toLocaleString()}<span style={bd({ fontSize: 12, color: T.textMuted })}> / {m.xp.annualCap.toLocaleString()}</span></p>
              <div style={{ marginTop: 7 }}><Bar pct={m.xp.programYearEarned / m.xp.annualCap} color={BRAND.nileLight} /></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const DataNotes = () => (m.notes.length || isReal) ? (
    <div style={{ ...card, padding: "9px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start", borderLeft: `3px solid ${isReal ? BRAND.nileLight : T.border}` }}>
      <Database size={14} color={isReal ? BRAND.nileLight : T.textMuted} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <p style={bd({ fontSize: 12, color: T.textSec })}>{isReal ? `Salesforce snapshot · ${fmtDate(m.asOf)}` : "Demo member · sample data in the Salesforce shape"}</p>
        {m.notes.map((n) => <p key={n} style={bd({ fontSize: 11, color: T.textMuted })}>{n}</p>)}
      </div>
    </div>
  ) : null;

  const cta = (item, color) => (item.url
    ? <a onClick={(e) => e.stopPropagation()} href={item.url} target="_blank" rel="noopener noreferrer" style={h({ fontSize: 11, color, textDecoration: "none", whiteSpace: "nowrap" })}>{item.cta} →</a>
    : <span style={h({ fontSize: 11, color: T.textMuted, whiteSpace: "nowrap" })}>{item.cta}</span>);
  const UpNext = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><p style={h({ fontSize: 15, color: T.text })}>Up next for you</p><Src kind="personal" /></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {m.upNext.map((item) => {
          const p = item.pillar ? PILLAR[item.pillar] : null;
          const color = p ? p.color : BRAND.nile;
          return (
            <div key={item.id} onClick={() => item.badgeId && (setTab("badges"), setSelectedBadgeId(item.badgeId))} style={{ ...card, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, borderLeft: `3px solid ${color}`, cursor: item.badgeId ? "pointer" : "default" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}1a`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p ? <Target size={15} color={color} /> : <Heart size={15} color={color} />}</div>
              <div style={{ flex: 1, minWidth: 0 }}><p style={h({ fontSize: 13, color: T.text })}>{item.action}</p><p style={bd({ fontSize: 11, color: T.textSec })}>{item.context}</p>{!desk && <div style={{ marginTop: 6 }}>{cta(item, color)}</div>}</div>
              {desk && cta(item, color)}
            </div>
          );
        })}
      </div>
    </div>
  );

  const Challenges = () => {
    const a = m.challenges.anchor;
    const timed = m.challenges.timed;
    if (!a && !timed.length) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {a && (
          <div style={{ ...card, borderTop: `3px solid ${BRAND.gold}`, background: dark ? "#1d1a10" : "#fffbea" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><Zap size={15} color={BRAND.gold} /><p style={h({ fontSize: 11, color: BRAND.gold, letterSpacing: "0.06em", flex: 1 })}>{a.active ? "HAPPENING NOW" : "ANNUAL CHALLENGE"}</p><Src kind={a.kind} /></div>
            <p style={hB({ fontSize: 16, color: T.text, marginBottom: 4 })}>{a.title}</p>
            <p style={bd({ fontSize: 12, color: T.textSec, marginBottom: 4, lineHeight: 1.5 })}>{a.desc}</p>
            <p style={bd({ fontSize: 11, color: T.textMuted, marginBottom: 12 })}>{fmtDate(a.start)} – {fmtDate(a.end)}{a.upcoming ? " · coming up" : ""}</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {a.tiers.map((t) => (
                <div key={t.label} style={{ flex: 1, padding: "10px 6px", borderRadius: 8, textAlign: "center", background: t.hit ? `${BRAND.gold}22` : T.surface, border: `1px solid ${t.hit ? `${BRAND.gold}66` : T.borderLight}` }}>
                  <p style={hB({ fontSize: 14, color: t.hit ? BRAND.gold : T.textSec })}>+{t.xp}</p>
                  <p style={h({ fontSize: 10, color: T.text, marginTop: 2 })}>{t.label}</p>
                  <p style={bd({ fontSize: 9, color: T.textMuted, marginTop: 2 })}>{t.req}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1 }}><Bar pct={a.done / a.total} color={BRAND.gold} height={5} /></div><span style={bd({ fontSize: 11, color: T.textMuted })}>{a.done}/{a.total} pillars</span></div>
          </div>
        )}
        {timed.length > 0 && (
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><Calendar size={14} color={T.textSec} /><p style={h({ fontSize: 13, color: T.text })}>Timed challenges</p></div>
            {timed.map((c, i) => (
              <div key={c.id} style={{ padding: "10px 0", borderTop: i ? `1px solid ${T.borderLight}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                  <div><p style={h({ fontSize: 12, color: T.text })}>{c.title}</p><p style={bd({ fontSize: 11, color: T.textSec })}>{c.desc}</p></div>
                  <span style={bB({ fontSize: 11, color: PILLAR[c.pillar].color, whiteSpace: "nowrap" })}>+{c.xp} XP</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1 }}><Bar pct={c.done / c.need} color={PILLAR[c.pillar].color} /></div><span style={bd({ fontSize: 10, color: T.textMuted })}>{c.done}/{c.need}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}><p style={bd({ fontSize: 10, color: T.textMuted })}>{c.active ? `Ends ${fmtDate(c.end)}` : `Starts ${fmtDate(c.start)}`}</p><Src kind={c.kind} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Stats = () => {
    const s = m.stats;
    const items = [
      { l: "Best month", v: s.bestMonth ? s.bestMonth.xp : "—", s: s.bestMonth ? s.bestMonth.label : "no XP yet", c: BRAND.gold },
      { l: "Badges this year", v: s.badgesThisYear, s: `${earned.length} of 12 overall`, c: "#a983c4" },
      { l: "Actions completed", v: s.actionsCompleted, s: "across all pillars", c: BRAND.nileLight },
      { l: "Programs attended", v: s.programsAttended, s: "in Salesforce", c: T.text },
      { l: "Service hours", v: s.serviceHours ?? "—", s: s.serviceHours ? "logged" : "log in My Profile", c: "#a983c4" },
      { l: "Days as a brother", v: s.daysSinceInitiation?.toLocaleString() ?? "—", s: "since initiation", c: BRAND.gold },
    ];
    return (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><p style={h({ fontSize: 14, color: T.text })}>Your stats</p><Src kind="personal" /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {items.map((x, i) => (
            <div key={x.l} style={{ textAlign: "center", padding: "8px 4px", animation: `countUp 0.4s ease ${i * 0.06}s both` }}>
              <p style={hB({ fontSize: 20, color: x.c })}>{x.v}</p>
              <p style={h({ fontSize: 10, color: T.text, marginTop: 2 })}>{x.l}</p>
              <p style={bd({ fontSize: 9, color: T.textMuted })}>{x.s}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BonusXP = () => {
    const sections = [
      ...(m.bonus.attendance.length ? [{ title: "Program attendance (proposal)", items: m.bonus.attendance, c: BRAND.gold, empty: "" }] : []),
      { title: "Officer terms", items: m.bonus.officer, c: "#a983c4", empty: "President 200 · Executive Board 150 · Committee Chair 100 per term" },
      { title: "Chapter awards", items: m.bonus.awards, c: BRAND.gold, empty: "Pyramid of Excellence 150 · Chapter of Distinction 100 · Next Era 75" },
      { title: "Foundation giving", items: m.bonus.giving, c: BRAND.nileLight, empty: "First gift 100 · Consecutive year 75 · Society member 150", link: "foundation" },
    ];
    const total = sections.reduce((s, x) => s + x.items.reduce((a, i) => a + i.xp, 0), 0);
    return (
      <>
        <div onClick={() => setShowBonus(!showBonus)} style={{ ...card, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: `${BRAND.purple}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><UserCog size={15} color="#a983c4" /></div>
          <div style={{ flex: 1 }}><p style={h({ fontSize: 13, color: T.text })}>Bonus XP</p><p style={bd({ fontSize: 11, color: T.textSec })}>{m.bonus.attendance.length ? "Programs, officer terms, awards, giving" : "Officer terms, chapter awards, giving"}</p></div>
          <span style={bB({ fontSize: 12, color: BRAND.nileLight })}>+{total}</span>
          {showBonus ? <ChevronUp size={15} color={T.textMuted} /> : <ChevronDown size={15} color={T.textMuted} />}
        </div>
        {showBonus && (
          <div style={{ ...card, marginTop: 8, borderTop: `3px solid ${BRAND.purple}` }}>
            {sections.map((s, si) => (
              <div key={s.title} style={{ marginBottom: si < sections.length - 1 ? 16 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><p style={h({ fontSize: 13, color: T.text })}>{s.title}</p>{s.link && <DL dest={s.link} />}</div>
                {s.items.length === 0 && <p style={bd({ fontSize: 11, color: T.textMuted })}>None yet · {s.empty}</p>}
                {s.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i ? `1px solid ${T.borderLight}` : "none" }}>
                    <span style={bd({ fontSize: 12, color: T.text })}>{it.label}</span>
                    <span style={bB({ fontSize: 12, color: s.c })}>+{it.xp}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const PillarOverview = () => (
    <>
      <p style={h({ fontSize: 15, color: T.text, marginBottom: 12 })}>Your pillars</p>
      <div style={{ display: "grid", gridTemplateColumns: desk ? "1fr 1fr" : "1fr", gap: 10 }}>
        {m.pillars.map((p) => {
          const P = PILLAR[p.key];
          const pb = m.badges.filter((b) => b.pillar === p.key).sort((a, b) => a.level - b.level);
          const pct = pb.reduce((s, b) => s + (b.status === "earned" ? 1 : b.progress), 0) / pb.length;
          return (
            <div key={p.key} onClick={() => go("badges")} style={{ ...card, cursor: "pointer", borderLeft: `3px solid ${P.color}`, transition: "transform 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "")}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${P.color}1f`, display: "flex", alignItems: "center", justifyContent: "center" }}><P.Icon size={17} color={P.color} /></div>
                <div style={{ flex: 1 }}><p style={h({ fontSize: 14, color: T.text })}>{P.label}</p><p style={bd({ fontSize: 11, color: T.textMuted })}>{p.earnedCount} of {p.total} badges</p></div>
                <div style={{ display: "flex", gap: 5 }}>{pb.map((b) => <BadgeShape key={b.id} level={b.level} color={P.color} earned={b.status === "earned"} size={20} />)}</div>
              </div>
              <Bar pct={pct} color={P.color} height={3} />
              <p style={bd({ fontSize: 10, color: T.textMuted, marginTop: 6 })}>{p.nextBadgeName ? `Next: ${p.nextBadgeName}` : "Pillar complete"}</p>
            </div>
          );
        })}
      </div>
    </>
  );

  const Achievements = () => (
    <>
      <p style={h({ fontSize: 15, color: T.text, marginBottom: 12 })}>Achievements</p>
      <div style={desk ? { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 } : { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
        {[...m.achievements].sort((a, b) => b.earned - a.earned).map((a) => {
          const Ic = ICONS[a.icon] || Star;
          return (
            <div key={a.id} style={{ flexShrink: 0, width: desk ? "auto" : 104, padding: "12px 8px", borderRadius: 10, textAlign: "center", background: a.earned ? T.card : T.surface, border: `1px solid ${a.earned ? `${a.color}55` : T.borderLight}`, opacity: a.earned ? 1 : 0.45 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", background: a.earned ? `${a.color}22` : T.borderLight }}>{a.earned ? <Ic size={16} color={a.color} /> : <Lock size={13} color={T.textMuted} />}</div>
              <p style={h({ fontSize: 10, color: T.text, lineHeight: 1.25, marginBottom: 3 })}>{a.name}</p>
              <p style={bd({ fontSize: 9, color: T.textMuted, lineHeight: 1.25 })}>{a.desc}</p>
            </div>
          );
        })}
      </div>
    </>
  );

  const Dashboard = () => (
    <div style={{ maxWidth: desk ? 1120 : 560, margin: "0 auto", padding: desk ? "24px 28px 40px" : "16px 16px 40px" }}>
      {DataNotes()}
      {StatusBand()}
      {desk ? (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.65fr) minmax(300px, 1fr)", gap: 24, marginTop: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {UpNext()}
            <div>{PillarOverview()}</div>
            <div>{Achievements()}</div>
            {Stats()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Featured()}
            {Challenges()}
            {BonusXP()}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>
          {Featured()}
          {UpNext()}
          {Challenges()}
          {PillarOverview()}
          {Stats()}
          {BonusXP()}
          {Achievements()}
        </div>
      )}
    </div>
  );

  /* ── badges ── */
  const BadgeDetail = () => {
    const b = selectedBadge;
    const p = PILLAR[b.pillar];
    const e = b.status === "earned";
    return (
      <div style={{ padding: "0 20px 100px", maxWidth: 640, margin: "0 auto", animation: "slideUp 0.25s ease" }}>
        <button onClick={() => setSelectedBadgeId(null)} style={{ display: "flex", alignItems: "center", gap: 6, ...h({ fontSize: 13, color: BRAND.nileLight }), background: "none", border: "none", cursor: "pointer", padding: "16px 0" }}><ChevronLeft size={16} /> All badges</button>
        <div style={{ textAlign: "center", padding: "16px 0 20px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><BadgeShape level={b.level} color={p.color} earned={e} size={72} /></div>
          <p style={hB({ fontSize: 22, color: T.text, marginBottom: 4 })}>{b.name}</p>
          <p style={h({ fontSize: 13, color: p.color, marginBottom: 6 })}>{p.label} ▴ Level {b.level} ▴ {b.xp} XP</p>
          <Rarity id={b.id} />
          {e && <p style={bB({ fontSize: 13, color: BRAND.nileLight, marginTop: 10 })}>Earned {fmtDate(b.earnedDate)} ✓</p>}
          {b.status === "qualified" && <p style={bd({ fontSize: 12, color: BRAND.gold, marginTop: 10 })}>Requirements met — unlocks when Level {b.level - 1} is earned</p>}
          {!e && b.status !== "qualified" && (
            <div style={{ maxWidth: 220, margin: "14px auto 0" }}><Bar pct={b.progress} color={p.color} /><p style={bd({ fontSize: 11, color: T.textMuted, marginTop: 4 })}>{b.stepsDone} of {b.steps} steps complete</p></div>
          )}
        </div>
        {!e && b.lockedBy && (
          <div onClick={() => setSelectedBadgeId(b.lockedBy.id)} style={{ ...card, marginBottom: 12, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", borderLeft: `3px solid ${BRAND.gold}` }}>
            <Lock size={16} color={BRAND.gold} style={{ flexShrink: 0 }} />
            <p style={bd({ fontSize: 13, color: T.text, flex: 1 })}>Earn <strong>{b.lockedBy.name}</strong> (Level {b.lockedBy.level}) first. Progress here still counts and is saved.</p>
            <span style={h({ fontSize: 11, color: BRAND.gold, whiteSpace: "nowrap" })}>Go →</span>
          </div>
        )}
        {b.prereq && (
          <div style={{ ...card, marginBottom: 12, borderLeft: `3px solid ${b.prereq.done ? BRAND.nileLight : p.color}` }}>
            <p style={h({ fontSize: 11, color: T.textMuted, letterSpacing: "0.06em", marginBottom: 6 })}>REQUIRED FIRST</p>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              {b.prereq.done ? <CheckCircle2 size={18} color={BRAND.nileLight} style={{ flexShrink: 0 }} /> : <Circle size={18} color={T.textMuted} style={{ flexShrink: 0 }} />}
              <div>
                <p style={bd({ fontSize: 13, color: T.text })}>{b.prereq.label}</p>
                {b.prereq.done && b.prereq.detail && <p style={bd({ fontSize: 11, color: BRAND.nileLight, marginTop: 3 })}>From Salesforce: {b.prereq.detail.slice(0, 3).join(", ")}</p>}
                {!b.prereq.done && b.prereq.partial && <p style={bd({ fontSize: 11, color: BRAND.gold, marginTop: 3 })}>Role requirement met — mentorship cycle still needed</p>}
              </div>
            </div>
          </div>
        )}
        <div style={{ ...card, marginBottom: 16 }}>
          <p style={h({ fontSize: 13, color: p.color, marginBottom: 8 })}>{b.prereq ? "Then complete" : "Complete"} {b.need} of:</p>
          {b.actions.map((a, i) => (
            <div key={a.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i ? `1px solid ${T.borderLight}` : "none" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${a.done ? BRAND.nileLight : T.border}`, background: a.done ? BRAND.nileLight : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{a.done && <Check size={11} color="#fff" />}</div>
              <div style={{ flex: 1 }}>
                <p style={bd({ fontSize: 13, color: a.done ? T.textSec : T.text })}>{a.text}</p>
                {a.done && a.detail?.length > 0 && <p style={bd({ fontSize: 11, color: T.textMuted, marginTop: 2 })}>{a.detail.slice(0, 3).join(", ")}</p>}
                <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}><SourceChip a={a} />{!a.done && <DL dest={a.dest} />}</div>
              </div>
            </div>
          ))}
        </div>
        {!e && b.lockedBy && <button onClick={() => setSelectedBadgeId(b.lockedBy.id)} style={{ display: "block", width: "100%", textAlign: "center", padding: 12, borderRadius: 8, border: "none", cursor: "pointer", background: BRAND.nile, color: "#fff", ...h({ fontSize: 14 }) }}>Start with {b.lockedBy.name}</button>}
        {!e && !b.lockedBy && DEST[b.dest]?.url && <a href={DEST[b.dest].url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", padding: 12, borderRadius: 8, background: BRAND.nile, color: "#fff", ...h({ fontSize: 14, textDecoration: "none" }) }}>Get started</a>}
      </div>
    );
  };

  const Badges = () => {
    if (selectedBadge) return BadgeDetail();
    const levels = { 1: ["Level I", "Participate — complete 2 actions"], 2: ["Level II", "Contribute — complete 3 actions"], 3: ["Level III", "Transform — flagship or equivalent, plus 1 follow-up"] };
    return (
      <div style={{ padding: "20px 20px 100px", maxWidth: desk ? 920 : 560, margin: "0 auto" }}>
        <p style={hB({ fontSize: 22, color: T.text, marginBottom: 4 })}>Badges</p>
        <p style={bd({ fontSize: 13, color: T.textSec, marginBottom: 22 })}>Tap any badge for what's done, what's left and where to go next.</p>
        {[1, 2, 3].map((lv) => {
          const list = PILLARS.map((p) => m.badges.find((b) => b.pillar === p.key && b.level === lv));
          return (
            <div key={lv} style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}><p style={hB({ fontSize: 16, color: T.text })}>{levels[lv][0]}</p><span style={bd({ fontSize: 12, color: T.textMuted })}>{list.filter((b) => b.status === "earned").length} of 4</span></div>
              <p style={bd({ fontSize: 12, color: T.textSec, marginBottom: 12 })}>{levels[lv][1]}</p>
              <div style={{ display: "grid", gridTemplateColumns: desk ? "repeat(4, 1fr)" : "1fr 1fr", gap: 10 }}>
                {list.map((b, i) => {
                  const p = PILLAR[b.pillar];
                  const e = b.status === "earned";
                  return (
                    <div key={b.id} onClick={() => setSelectedBadgeId(b.id)} style={{ ...card, padding: 16, textAlign: "center", cursor: "pointer", borderTop: `3px solid ${e ? p.color : T.borderLight}`, animation: `slideUp 0.3s ease ${i * 0.04}s both` }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, opacity: e ? 1 : 0.75 }}><BadgeShape level={lv} color={p.color} earned={e} size={lv === 1 ? 40 : lv === 2 ? 44 : 48} /></div>
                      <p style={h({ fontSize: 13, color: T.text, marginBottom: 2 })}>{b.name}</p>
                      <p style={bd({ fontSize: 11, color: p.color, marginBottom: 4 })}>{p.label.split(" ")[1]} ▴ {b.xp} XP</p>
                      <Rarity id={b.id} />
                      {!e && b.lockedBy && b.progress > 0 && <p style={bd({ fontSize: 10, color: BRAND.gold, marginTop: 6 })}>Unlocks after {b.lockedBy.name}</p>}
                      {!e && b.progress > 0 && <div style={{ marginTop: 8 }}><Bar pct={b.progress} color={p.color} height={3} /><p style={bd({ fontSize: 10, color: T.textMuted, marginTop: 3 })}>{Math.round(b.progress * 100)}%</p></div>}
                      {e && <p style={bB({ fontSize: 10, color: BRAND.nileLight, marginTop: 6 })}>Earned ✓</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── leaderboard ── */
  const Leaderboard = () => {
    const view = rankView, setView = setRankView;
    const real = !!chapter;
    const roster = (real
      ? chapter.list.map((x) => ({ id: x.member.id, name: `${x.member.firstName} ${x.member.lastName}`, tier: x.tier.key, xp: x.xp.lifetime, badges: x.badges.filter((b) => b.status === "earned").length, nm: x.member.status === "New Member", isYou: x.member.id === m.member.id }))
      : [...DEMO_CHAPTER, { id: "you", name: `${m.member.firstName} ${m.member.lastName}`, tier: m.tier.key, xp: m.xp.lifetime, badges: earned.length, trend: "up", isYou: true }]
    ).sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
    const rank = roster.findIndex((r) => r.isYou) + 1;
    const avg = Math.round(roster.reduce((s, r) => s + r.xp, 0) / roster.length);
    return (
      <div style={{ padding: "20px 20px 100px", maxWidth: desk ? 720 : 560, margin: "0 auto" }}>
        <p style={hB({ fontSize: 22, color: T.text, marginBottom: 14 })}>Rankings</p>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 16 }}>
          {[["chapter", "Chapter"], ["friends", "Friends"]].map(([k, l]) => <button key={k} onClick={() => setView(k)} style={{ ...h({ fontSize: 13 }), padding: "10px 18px", border: "none", cursor: "pointer", background: "transparent", color: view === k ? BRAND.nileLight : T.textMuted, borderBottom: view === k ? `2px solid ${BRAND.nileLight}` : "2px solid transparent", marginBottom: -1 }}>{l}</button>)}
        </div>
        {view === "chapter" ? (
          <>
            <div style={{ ...card, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}><Info size={14} color={T.textMuted} /><p style={bd({ fontSize: 11, color: T.textMuted })}>{real ? `All ${roster.length} current ${chapter.name} members from Salesforce, scored with the same rules. Badges stay low until the self-report forms launch.` : "Sample chapter roster with your real totals. The live roster connects once Lifetime XP is stored in Salesforce."}</p></div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[["Your rank", `#${rank}`, `of ${roster.length}`, BRAND.nileLight], ["Chapter avg", avg.toLocaleString(), "XP", T.text], ["Your tier", m.tier.label, `${m.xp.lifetime.toLocaleString()} XP`, m.tier.color]].map(([l, v, s, c]) => (
                <div key={l} style={{ ...card, flex: 1, padding: 12, textAlign: "center" }}><p style={bd({ fontSize: 11, color: T.textMuted })}>{l}</p><p style={hB({ fontSize: 19, color: c })}>{v}</p><p style={bd({ fontSize: 10, color: T.textMuted })}>{s}</p></div>
              ))}
            </div>
            <div style={{ ...card, padding: "4px 16px" }}>
              {roster.map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: r.isYou ? "11px 16px" : "11px 0", margin: r.isYou ? "0 -16px" : 0, background: r.isYou ? `${BRAND.nile}18` : "transparent", borderTop: i ? `1px solid ${T.borderLight}` : "none" }}>
                  <span style={hB({ fontSize: 13, color: i < 3 ? BRAND.gold : T.textMuted, width: 22, textAlign: "center" })}>{i + 1}</span>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.surface, border: `2px solid ${TIER_BY_KEY[r.tier].color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={h({ fontSize: 9, color: T.textSec })}>{r.name.split(" ").map((n) => n[0]).join("")}</span></div>
                  <div style={{ flex: 1, minWidth: 0 }}><p style={h({ fontSize: 12, color: T.text })}>{r.name}{r.isYou && <span style={bB({ fontSize: 9, color: BRAND.nileLight, marginLeft: 6 })}>YOU</span>}</p><p style={bd({ fontSize: 10, color: T.textMuted })}>{TIER_BY_KEY[r.tier].label} · {r.badges} badge{r.badges === 1 ? "" : "s"}{r.nm ? " · New Member" : ""}</p></div>
                  <span style={hB({ fontSize: 13, color: T.text })}>{r.xp.toLocaleString()}</span>
                  {!real && <span style={{ width: 14 }}>{r.trend === "up" ? <ArrowUpRight size={12} color={BRAND.nileLight} /> : r.trend === "down" ? <ArrowDownRight size={12} color="#d0605a" /> : <Minus size={12} color={T.textMuted} />}</span>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ ...card, textAlign: "center", padding: "36px 24px" }}>
            <Users size={28} color={T.textMuted} style={{ marginBottom: 10 }} />
            <p style={hB({ fontSize: 15, color: T.text, marginBottom: 6 })}>Friends arrive in Phase 2</p>
            <p style={bd({ fontSize: 12, color: T.textSec, lineHeight: 1.5, maxWidth: 360, margin: "0 auto" }) }>Connect with brothers you meet at Convention, Career Accelerator and Leadership Institute, then see how you stack up across chapters.</p>
          </div>
        )}
      </div>
    );
  };

  /* ── activity ── */
  const Activity = () => {
    const iconFor = (e) => (e.kind === "badge" ? PILLAR[e.pillar]?.Icon || Award : e.kind === "officer" ? UserCog : e.kind === "award" ? Trophy : e.kind === "giving" ? Heart : e.kind === "program" ? Calendar : TrendingUp);
    const colorFor = (e) => (e.kind === "badge" ? PILLAR[e.pillar]?.color : e.kind === "officer" ? "#a983c4" : e.kind === "award" ? BRAND.gold : BRAND.nileLight);
    return (
      <div style={{ padding: "20px 20px 100px", maxWidth: desk ? 720 : 560, margin: "0 auto" }}>
        <p style={hB({ fontSize: 22, color: T.text, marginBottom: 4 })}>Activity</p>
        <p style={bd({ fontSize: 13, color: T.textSec, marginBottom: 16 })}>Every XP you've earned, newest first.</p>
        {m.ledger.length === 0 && <div style={{ ...card, textAlign: "center", padding: 28 }}><Clock size={24} color={T.textMuted} /><p style={bd({ fontSize: 13, color: T.textSec, marginTop: 8 })}>Nothing yet. Your first badge shows up here.</p></div>}
        {m.ledger.map((e, i) => {
          const Ic = iconFor(e);
          const c = colorFor(e);
          return (
            <div key={`${e.label}-${i}`} style={{ display: "flex", gap: 12, padding: "14px 0", borderTop: i ? `1px solid ${T.borderLight}` : "none", animation: `slideUp 0.3s ease ${Math.min(i, 8) * 0.04}s both` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c}1f`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic size={16} color={c} /></div>
              <div style={{ flex: 1 }}><p style={h({ fontSize: 13, color: T.text })}>{e.label}</p><p style={bd({ fontSize: 11, color: T.textSec })}>{e.kind === "badge" ? `${PILLAR[e.pillar].label} badge` : e.kind === "officer" ? "Officer term" : e.kind === "award" ? "Chapter award" : e.kind === "program" ? "Program attendance (proposal)" : "Foundation giving"} · {e.programYear}{e.capped ? " · annual cap reached" : ""}</p></div>
              <div style={{ textAlign: "right", flexShrink: 0 }}><p style={bB({ fontSize: 12, color: BRAND.nileLight })}>+{e.xpAwarded} XP</p><p style={bd({ fontSize: 10, color: T.textMuted })}>{e.approx ? `${new Date(e.date).getUTCFullYear()}` : ago(e.date, today)}</p></div>
            </div>
          );
        })}
      </div>
    );
  };

  const VIEWS = { dashboard: Dashboard, badges: Badges, leaderboard: Leaderboard, activity: Activity };
  const View = VIEWS[tab] || Dashboard;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>
      {celebration && Celebration()}
      {showRewards && Rewards()}
      <header style={{ background: BRAND.sphinx, padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 52, position: desk ? "fixed" : "sticky", top: 0, left: 0, right: 0, zIndex: 45 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Shield size={18} color={BRAND.gold} />
          <span style={hB({ fontSize: 15, color: "#fff", whiteSpace: "nowrap" })}>Delta Sigma Phi</span>
          <span style={h({ fontSize: 13, color: "rgba(255,255,255,0.35)" })}>▴</span>
          <span style={h({ fontSize: 13, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" })}>Member Development</span>
        </div>
        {!desk && <button onClick={() => setDark(!dark)} aria-label="Toggle theme" style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 6, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{dark ? <Sun size={15} color="#fff" /> : <Moon size={15} color="#fff" />}</button>}
      </header>
      {desk && Sidebar()}
      <main style={{ marginLeft: desk ? 210 : 0, paddingTop: desk ? 52 : 0, paddingBottom: desk ? 20 : 70 }}>
        {!desk && (
          <div style={{ padding: "8px 16px", borderBottom: `1px solid ${T.border}`, background: T.card }}>
            <button onClick={() => setTestOpen(!testOpen)} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", background: "none", border: "none", cursor: "pointer", padding: "4px 0", ...h({ fontSize: 12, color: T.textSec }) }}>
              <SlidersHorizontal size={13} /> Testing · {SOURCES.find((x) => x.key === memberKey)?.label}{testDate ? ` · ${testDate}` : ""}
              <span style={{ marginLeft: "auto" }}>{testOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
            </button>
            {testOpen && <div style={{ padding: "8px 0 6px" }}>{TestingPanel()}</div>}
          </div>
        )}
        {View()}
        <footer style={{ padding: "8px 20px 24px", textAlign: "center" }}><p style={bd({ fontSize: 10, color: T.textMuted })}><FileText size={10} style={{ verticalAlign: "-1px" }} /> Proof of concept · {BADGE_CONFIG.length} badges · rules engine v0.1</p></footer>
      </main>
      {!desk && BottomNav()}
    </div>
  );
}
