import React, { useState, useEffect, useCallback } from "react";
import {
  Wind, Snowflake, Flame, Settings, Layers, DollarSign, CalendarDays,
  Code2, Users, Check, Trash2, Copy, ArrowRight, Phone, Mail, MapPin,
  Building2, RotateCcw, ExternalLink, Star, CheckCircle2, Eye, Zap,
  RefreshCw, Thermometer, Camera, Leaf, Gauge, VolumeX, Lock, Unlock,
  X, ChevronLeft, Clock, Search, Home, Sparkles, Wrench, HelpCircle,
  BarChart3, Upload, Volume2, Droplet, Power, TrendingUp
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tradewind — the front door for HVAC contractors                    */
/* ------------------------------------------------------------------ */

const C = {
  ink: "#1C1A17", ink2: "#4A453E", ink3: "#7C766C",
  paper: "#F6F1E8", card: "#FFFFFF", line: "#E5DDCF", line2: "#D6CBB8",
  ember: "#D9582B", emberDk: "#B5421C", teal: "#0E6E6E", tealDk: "#0A5252",
  gold: "#C8932B", green: "#3B7A45",
};
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..500&family=Hanken+Grotesk:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');
* { box-sizing: border-box; }
@keyframes tw-rise { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform:none; } }
@keyframes tw-pop { from { opacity:0; transform: scale(.96); } to { opacity:1; transform:none; } }
.tw-rise { animation: tw-rise .5s cubic-bezier(.2,.7,.2,1) both; }
.tw-pop { animation: tw-pop .28s cubic-bezier(.2,.7,.2,1) both; }
.tw-card { transition: transform .25s cubic-bezier(.2,.7,.2,1), box-shadow .25s; }
.tw-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -22px rgba(28,26,23,.35); }
.tw-opt:hover { border-color:${C.ember} !important; transform: translateX(3px); }
.tw-opt { transition: border-color .15s, transform .15s, background .15s; }
.tw-btn { transition: transform .12s, filter .15s, background .15s; }
.tw-btn:active { transform: scale(.985); }
.tw-row:hover { background:${C.paper}; }
.tw-row { transition: background .12s; cursor:pointer; }
input, select, textarea { font-family: inherit; }
.tw-in:focus { outline: none; border-color: ${C.ember}; box-shadow: 0 0 0 3px rgba(217,88,43,.14); }
::-webkit-scrollbar { height:10px; width:10px; }
::-webkit-scrollbar-thumb { background:${C.line2}; border-radius:10px; }
`;

const DEFAULT_CONFIG = {
  company: { name: "Bayside Heating & Air", tagline: "Comfort you can count on since 2004", phone: "(949) 555-0142", email: "quotes@baysidehvac.com", accent: C.ember },
  notifyEmail: "owner@baysidehvac.com",
  sizing: { sqftPerTon: 500 },
  labor: { installBase: 1500, perTon: 350 },
  financing: { enabled: true, apr: 9.99, term: 120, preApprovalUrl: "" },
  gate: "range", // open | range | full
  diagnostic: { fee: 89, label: "In-home diagnostic visit", waived: true },
  packages: {
    good: { tier: "Good", name: "Essential Comfort", brand: "Goodman", blurb: "Reliable comfort at a smart price.", seer: "14.3 SEER2", warranty: "10-yr parts", baseEquipment: 4200, perTon: 600, features: ["Single-stage system", "Standard digital thermostat", "Pro install & haul-away"] },
    better: { tier: "Better", name: "Comfort Plus", brand: "Carrier", blurb: "Quieter, two-stage performance with smarter controls.", seer: "16 SEER2", warranty: "10-yr parts + labor", baseEquipment: 6400, perTon: 850, features: ["Two-stage compressor", "Smart Wi-Fi thermostat", "Enhanced air filtration"] },
    best: { tier: "Best", name: "Total Comfort", brand: "Carrier Infinity", blurb: "Top-tier variable-speed comfort and air quality.", seer: "18-20 SEER2", warranty: "12-yr parts + labor", baseEquipment: 9200, perTon: 1100, features: ["Variable-speed system", "Whole-home air purification", "Humidity control & zoning ready"] },
  },
  calendar: { provider: "Calendly", url: "https://calendly.com/baysidehvac/in-home-estimate" },
};

const JOB_TYPES = [
  { id: "repair", label: "Something's not working", sub: "Repair or service", icon: Wrench },
  { id: "replace", label: "I'm ready to replace my system", sub: "Upgrade or full replacement", icon: RefreshCw },
  { id: "unsure", label: "I'm not sure — something's just wrong", sub: "Help me figure it out", icon: HelpCircle },
];
const SYSTEM_TYPES = [
  { id: "ac_gas", label: "Central AC + Gas Furnace", icon: Home },
  { id: "ac_elec", label: "Central AC + Electric Furnace", icon: Zap },
  { id: "heatpump", label: "Heat Pump System", icon: RefreshCw },
  { id: "boiler", label: "Boiler / Radiator", icon: Thermometer },
  { id: "unsure", label: "Not sure", icon: HelpCircle },
];
const AGE_OPTIONS = [
  { id: "lt10", label: "Less than 10 years", icon: Sparkles },
  { id: "10_15", label: "10-15 years", icon: Clock },
  { id: "15_20", label: "15-20 years", icon: CalendarDays },
  { id: "gt20", label: "Over 20 years", icon: Building2 },
];
const PRIORITY_OPTIONS = [
  { id: "price", label: "Lowest price", tag: "Budget", icon: DollarSign, tier: "good" },
  { id: "efficiency", label: "Energy efficiency", icon: Leaf, tier: "better" },
  { id: "performance", label: "Top performance", icon: Gauge, tier: "best" },
  { id: "quiet", label: "Quietest operation", icon: VolumeX, tier: "better" },
];
const SYMPTOMS = [
  { id: "no_cool", label: "Not cooling", icon: Snowflake, score: 1 },
  { id: "no_heat", label: "Not heating", icon: Flame, score: 1 },
  { id: "noise", label: "Strange noises", icon: Volume2, score: 1 },
  { id: "leak", label: "Leaking water", icon: Droplet, score: 1 },
  { id: "no_power", label: "Won't turn on", icon: Power, score: 1 },
  { id: "high_bills", label: "High energy bills", icon: TrendingUp, score: 1 },
  { id: "tuneup", label: "Routine maintenance / tune-up", icon: Wrench, score: -3 },
];
const labelOf = (set, id) => set.find((x) => x.id === id)?.label || "—";
const recommendKey = (priority) => PRIORITY_OPTIONS.find((p) => p.id === priority)?.tier || "better";
const triageIntent = (age, symptomId) => {
  const a = age === "gt20" ? 2 : age === "15_20" ? 1 : 0;
  const s = SYMPTOMS.find((x) => x.id === symptomId)?.score || 0;
  return a + s >= 2 ? "replacement" : "diagnostic";
};

/* --------------------------------- helpers -------------------------------- */
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.round(n || 0));
const monthly = (P, aprPct, n) => { if (!P || P <= 0 || !n) return 0; const r = aprPct / 100 / 12; if (r === 0) return P / n; return (P * r) / (1 - Math.pow(1 + r, -n)); };
const sizeTons = (sqft, spt) => { const raw = (Number(sqft) || 1800) / (spt || 500); const r = Math.round(raw * 2) / 2; return Math.min(5, Math.max(1.5, r)); };
const priceFor = (pkg, tons, labor) => { const equip = pkg.baseEquipment + (tons - 3) * pkg.perTon; const install = labor.installBase + labor.perTon * tons; return { total: equip + install }; };
const slug = (s) => (s || "company").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const lookupProperty = (addr) => { let h = 0; for (let i = 0; i < (addr || "x").length; i++) h = (h * 31 + addr.charCodeAt(i)) >>> 0; return { sqft: 1400 + (h % 36) * 50, stories: 1 + (h % 3), yearBuilt: 1962 + (h % 56) }; };

/* ----------------------------- tiny UI atoms ------------------------------ */
const Label = ({ children }) => <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, letterSpacing: ".02em", textTransform: "uppercase", color: C.ink3, marginBottom: 6 }}>{children}</label>;
const inStyle = { width: "100%", padding: "10px 12px", fontSize: 14.5, color: C.ink, background: C.card, border: `1px solid ${C.line2}`, borderRadius: 10 };
const Text = ({ value, onChange, placeholder, type = "text" }) => <input className="tw-in" style={inStyle} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
const Num = ({ value, onChange, prefix }) => (<div style={{ position: "relative" }}>{prefix && <span style={{ position: "absolute", left: 12, top: 10, color: C.ink3, fontSize: 14.5 }}>{prefix}</span>}<input className="tw-in" style={{ ...inStyle, paddingLeft: prefix ? 24 : 12 }} type="number" value={value} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} /></div>);
const Area = ({ value, onChange, placeholder, rows = 2 }) => <textarea className="tw-in" style={{ ...inStyle, resize: "vertical", lineHeight: 1.5 }} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
const Check2 = ({ checked, onChange, label, accent }) => <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14.5, color: C.ink }}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: accent }} /> {label}</label>;
function Btn({ children, onClick, kind = "primary", accent = C.ember, full, small }) {
  const base = { primary: { background: accent, color: "#fff", border: `1px solid ${accent}` }, ghost: { background: "transparent", color: C.ink, border: `1px solid ${C.line2}` }, dark: { background: C.ink, color: "#fff", border: `1px solid ${C.ink}` } }[kind];
  return <button className="tw-btn" onClick={onClick} style={{ ...base, width: full ? "100%" : "auto", padding: small ? "8px 14px" : "12px 20px", fontSize: small ? 13.5 : 15, fontWeight: 600, borderRadius: 11, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>{children}</button>;
}
const Panel = ({ children, title, sub }) => (<div className="tw-rise" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: 26, marginBottom: 20 }}>{title && <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 500, color: C.ink, margin: "0 0 4px" }}>{title}</h3>}{sub && <p style={{ color: C.ink3, fontSize: 13.5, margin: "0 0 18px" }}>{sub}</p>}{children}</div>);
const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };
const STATUS = { New: C.ember, Quoted: C.gold, Booked: C.green };
const Back = ({ onClick, label = "Back" }) => <div style={{ marginTop: 18 }}><button onClick={onClick} style={{ background: "none", border: "none", color: C.ink3, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}><ChevronLeft size={15} /> {label}</button></div>;
function Steps({ labels, idx, accent }) {
  return (<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>{labels.map((l, i) => { const a = i <= idx; return (<React.Fragment key={l}><div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 22, height: 22, borderRadius: "50%", background: a ? accent : C.line, color: a ? "#fff" : C.ink3, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span><span style={{ fontSize: 12.5, fontWeight: 600, color: a ? C.ink : C.ink3 }}>{l}</span></div>{i < labels.length - 1 && <div style={{ flex: 1, height: 1, background: C.line }} />}</React.Fragment>); })}</div>);
}

/* ============================  CONTRACTOR STUDIO  ========================= */
function Studio({ config, setConfig, leads, setLeads, updateLead }) {
  const [tab, setTab] = useState("brand");
  const [openLead, setOpenLead] = useState(null);
  const set = (path, val) => setConfig((c) => { const n = structuredClone(c); let o = n; const k = path.split("."); k.slice(0, -1).forEach((x) => (o = o[x])); o[k[k.length - 1]] = val; return n; });
  const tabs = [
    { id: "brand", label: "Brand", icon: Building2 }, { id: "packages", label: "Packages", icon: Layers },
    { id: "pricing", label: "Pricing & Gating", icon: DollarSign }, { id: "schedule", label: "Scheduling & Repair", icon: CalendarDays },
    { id: "embed", label: "Embed", icon: Code2 }, { id: "dashboard", label: "Dashboard", icon: BarChart3 }, { id: "leads", label: "Leads", icon: Users, badge: leads.length },
  ];
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
      <div className="tw-rise" style={{ paddingTop: 36, paddingBottom: 24 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: C.ember }}>Contractor Studio</div>
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 38, fontWeight: 500, color: C.ink, margin: "6px 0 4px", letterSpacing: "-.01em" }}>Your <span style={{ fontStyle: "italic", color: C.teal }}>front door</span> for every homeowner</h1>
        <p style={{ color: C.ink2, fontSize: 15.5, margin: 0, maxWidth: 660 }}>One embeddable form that triages every visitor — repair, replacement, or not-sure — and turns each into a qualified lead, with an instant Good·Better·Best proposal when it's a replacement.</p>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderBottom: `1px solid ${C.line}`, marginBottom: 26 }}>
        {tabs.map((t) => { const a = tab === t.id; const I = t.icon; return (<button key={t.id} onClick={() => setTab(t.id)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 15px", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "transparent", border: "none", borderBottom: `2px solid ${a ? C.ember : "transparent"}`, color: a ? C.ink : C.ink3, fontFamily: "inherit", marginBottom: -1 }}><I size={16} /> {t.label}{t.badge > 0 && <span style={{ background: C.ember, color: "#fff", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>{t.badge}</span>}</button>); })}
      </div>
      {tab === "brand" && <BrandTab config={config} set={set} setConfig={setConfig} setLeads={setLeads} />}
      {tab === "packages" && <PackagesTab config={config} set={set} />}
      {tab === "pricing" && <PricingTab config={config} set={set} />}
      {tab === "schedule" && <ScheduleTab config={config} set={set} />}
      {tab === "embed" && <EmbedTab config={config} />}
      {tab === "dashboard" && <DashboardTab leads={leads} config={config} />}
      {tab === "leads" && <LeadsTab leads={leads} setLeads={setLeads} accent={config.company.accent} onOpen={setOpenLead} />}
      {openLead && <LeadDetail lead={openLead} config={config} onClose={() => setOpenLead(null)} onStatus={(s) => { updateLead(openLead.id, { status: s }); setOpenLead({ ...openLead, status: s }); }} />}
    </div>
  );
}

function BrandTab({ config, set, setConfig, setLeads }) {
  const sw = [C.ember, C.teal, "#2B5C8A", "#7A3B8F", C.green, "#B5421C", C.ink];
  return (<>
    <Panel title="Company identity" sub="What your homeowners see on the form.">
      <div style={grid2}>
        <div><Label>Company name</Label><Text value={config.company.name} onChange={(v) => set("company.name", v)} /></div>
        <div><Label>Tagline</Label><Text value={config.company.tagline} onChange={(v) => set("company.tagline", v)} /></div>
        <div><Label>Phone</Label><Text value={config.company.phone} onChange={(v) => set("company.phone", v)} /></div>
        <div><Label>Customer-facing email</Label><Text value={config.company.email} onChange={(v) => set("company.email", v)} /></div>
      </div>
      <div style={{ marginTop: 18 }}><Label>Accent color</Label><div style={{ display: "flex", gap: 10, alignItems: "center" }}>{sw.map((s) => <button key={s} onClick={() => set("company.accent", s)} style={{ width: 30, height: 30, borderRadius: 9, background: s, cursor: "pointer", border: config.company.accent === s ? `3px solid ${C.ink}` : `1px solid ${C.line2}` }} />)}<input type="color" value={config.company.accent} onChange={(e) => set("company.accent", e.target.value)} style={{ width: 38, height: 32, border: `1px solid ${C.line2}`, borderRadius: 9, background: C.card, cursor: "pointer", padding: 2 }} /></div></div>
    </Panel>
    <Panel title="New-lead notifications" sub="Where we email you the moment a lead comes in.">
      <div style={{ maxWidth: 420 }}><Label>Notify this address</Label><Text value={config.notifyEmail} onChange={(v) => set("notifyEmail", v)} /></div>
    </Panel>
    <Panel title="Demo data" sub="Reset to the sample company and clear leads."><Btn kind="ghost" small onClick={() => { if (confirm("Reset all configuration and clear leads?")) { setConfig(structuredClone(DEFAULT_CONFIG)); setLeads([]); } }}><RotateCcw size={15} /> Reset to sample data</Btn></Panel>
  </>);
}

function PackagesTab({ config, set }) {
  const order = ["good", "better", "best"]; const tones = { good: C.ink3, better: config.company.accent, best: C.teal };
  return (<>
    <p style={{ color: C.ink2, fontSize: 14, margin: "0 0 18px", maxWidth: 650 }}>Your three replacement tiers. Prices anchor to a <b>3-ton</b> reference system; the form scales each by the home's square footage.</p>
    {order.map((key) => { const p = config.packages[key]; return (
      <Panel key={key} title={`${p.tier} tier`}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: tones[key] }} /><span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: tones[key] }}>{p.tier}</span></div>
        <div style={grid2}><div><Label>Package name</Label><Text value={p.name} onChange={(v) => set(`packages.${key}.name`, v)} /></div><div><Label>Brand / system</Label><Text value={p.brand} onChange={(v) => set(`packages.${key}.brand`, v)} /></div></div>
        <div style={{ marginTop: 14 }}><Label>One-line pitch</Label><Text value={p.blurb} onChange={(v) => set(`packages.${key}.blurb`, v)} /></div>
        <div style={{ ...grid2, marginTop: 14 }}>
          <div><Label>Efficiency (SEER)</Label><Text value={p.seer} onChange={(v) => set(`packages.${key}.seer`, v)} /></div>
          <div><Label>Warranty</Label><Text value={p.warranty} onChange={(v) => set(`packages.${key}.warranty`, v)} /></div>
          <div><Label>Equipment price (at 3 tons)</Label><Num prefix="$" value={p.baseEquipment} onChange={(v) => set(`packages.${key}.baseEquipment`, v)} /></div>
          <div><Label>Price added per extra ton</Label><Num prefix="$" value={p.perTon} onChange={(v) => set(`packages.${key}.perTon`, v)} /></div>
        </div>
        <div style={{ marginTop: 14 }}><Label>What's included (one per line)</Label><Area rows={4} value={p.features.join("\n")} onChange={(v) => set(`packages.${key}.features`, v.split("\n").filter((x) => x.trim() !== ""))} /></div>
      </Panel>); })}
  </>);
}

function PricingTab({ config, set }) {
  const sample = sizeTons(2000, config.sizing.sqftPerTon);
  const totals = ["good", "better", "best"].map((k) => priceFor(config.packages[k], sample, config.labor).total);
  const gates = [{ id: "open", label: "Open", sub: "Show all prices immediately" }, { id: "range", label: "Show range, gate detail", sub: "Range is public; exact options need contact" }, { id: "full", label: "Full gate", sub: "All prices hidden until contact" }];
  return (<>
    <Panel title="Pricing gate" sub="How much pricing a homeowner sees before giving you their contact info. This is your transparency-vs-lead-capture dial.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
        {gates.map((g) => { const a = config.gate === g.id; return (<button key={g.id} onClick={() => set("gate", g.id)} className="tw-btn" style={{ textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", background: a ? config.company.accent + "0F" : C.card, border: `1.5px solid ${a ? config.company.accent : C.line2}` }}><div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{g.label}</div><div style={{ fontSize: 12.5, color: C.ink3, marginTop: 2 }}>{g.sub}</div></button>); })}
      </div>
    </Panel>
    <Panel title="System sizing" sub="How square footage becomes system size."><div style={{ maxWidth: 360 }}><Label>Square feet per ton</Label><Num value={config.sizing.sqftPerTon} onChange={(v) => set("sizing.sqftPerTon", v || 500)} /><p style={{ color: C.ink3, fontSize: 12.5, marginTop: 8 }}>A 2,000 sq ft home ≈ <b>{sizeTons(2000, config.sizing.sqftPerTon)} tons</b>.</p></div></Panel>
    <Panel title="Installation labor"><div style={grid2}><div><Label>Base install fee</Label><Num prefix="$" value={config.labor.installBase} onChange={(v) => set("labor.installBase", v || 0)} /></div><div><Label>Labor per ton</Label><Num prefix="$" value={config.labor.perTon} onChange={(v) => set("labor.perTon", v || 0)} /></div></div></Panel>
    <Panel title="Financing display" sub="The monthly payment shown on every option.">
      <Check2 checked={config.financing.enabled} onChange={(v) => set("financing.enabled", v)} label='Show "as low as $X/mo" on proposals' accent={config.company.accent} />
      <div style={{ ...grid2, marginTop: 16 }}><div><Label>Estimated APR (%)</Label><Num value={config.financing.apr} onChange={(v) => set("financing.apr", v || 0)} /></div><div><Label>Term (months)</Label><Num value={config.financing.term} onChange={(v) => set("financing.term", v || 12)} /></div></div>
      <div style={{ marginTop: 14 }}><Label>Pre-approval handoff link (optional, any lender)</Label><Text value={config.financing.preApprovalUrl} onChange={(v) => set("financing.preApprovalUrl", v)} placeholder="https://apply.yourlender.com/..." /></div>
      <div style={{ marginTop: 16, padding: 14, background: C.paper, borderRadius: 11, fontSize: 13, color: C.ink2 }}>2,000 sq ft preview:{["Good", "Better", "Best"].map((t, i) => <span key={t}>{i > 0 ? " · " : " "}<b>{t}</b> {money(totals[i])}{config.financing.enabled ? ` (~${money(monthly(totals[i], config.financing.apr, config.financing.term))}/mo)` : ""}</span>)}</div>
    </Panel>
    <Panel title="Recommendation logic" sub="Which tier earns the “Your pick” badge, from the homeowner's stated priority.">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>{PRIORITY_OPTIONS.map((p) => { const I = p.icon; return (<div key={p.id} style={{ border: `1px solid ${C.line}`, borderRadius: 11, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}><I size={16} color={C.ink3} /><div style={{ fontSize: 13.5 }}><div style={{ color: C.ink2 }}>{p.label}</div><div style={{ fontWeight: 700, color: C.teal }}>→ {config.packages[p.tier].tier}</div></div></div>); })}</div>
    </Panel>
  </>);
}

function ScheduleTab({ config, set }) {
  const providers = ["Calendly", "Acuity", "Google Appointments", "Housecall Pro", "ServiceTitan", "Other"];
  return (<>
    <Panel title="Bring your own calendar" sub="Calendar-agnostic. Paste the booking link you already use — it embeds after a homeowner picks an option or books a visit.">
      <div style={{ maxWidth: 520 }}><Label>Scheduling provider</Label><select className="tw-in" style={inStyle} value={config.calendar.provider} onChange={(e) => set("calendar.provider", e.target.value)}>{providers.map((p) => <option key={p}>{p}</option>)}</select><div style={{ marginTop: 16 }}><Label>Booking link</Label><Text value={config.calendar.url} onChange={(v) => set("calendar.url", v)} /></div></div>
    </Panel>
    <Panel title="Repair / diagnostic visits" sub="What a repair or not-sure homeowner sees when they book a service call.">
      <div style={{ maxWidth: 520 }}>
        <Label>Visit label</Label><Text value={config.diagnostic.label} onChange={(v) => set("diagnostic.label", v)} />
        <div style={{ ...grid2, marginTop: 14 }}><div><Label>Diagnostic fee</Label><Num prefix="$" value={config.diagnostic.fee} onChange={(v) => set("diagnostic.fee", v || 0)} /></div></div>
        <div style={{ marginTop: 14 }}><Check2 checked={config.diagnostic.waived} onChange={(v) => set("diagnostic.waived", v)} label="Fee waived if they move forward with a repair" accent={config.company.accent} /></div>
      </div>
    </Panel>
  </>);
}

function CopyBox({ code }) { const [d, setD] = useState(false); return (<div style={{ position: "relative" }}><pre style={{ background: C.ink, color: "#EBE3D6", padding: "16px 18px", borderRadius: 12, fontSize: 12.5, fontFamily: "'Geist Mono', monospace", overflowX: "auto", lineHeight: 1.65, margin: 0 }}>{code}</pre><button className="tw-btn" onClick={() => { navigator.clipboard?.writeText(code); setD(true); setTimeout(() => setD(false), 1400); }} style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.2)", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>{d ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}</button></div>); }
function EmbedTab({ config }) { const s = slug(config.company.name); const script = `<!-- Tradewind front door -->\n<script\n  src="https://embed.tradewind.app/v1/widget.js"\n  data-company="${s}"\n  async></script>\n<div id="tradewind-form"></div>`; return (<>
  <Panel title="Drop it on your site" sub="Homepage, a Get-a-quote page, anywhere."><Label>Embed script</Label><CopyBox code={script} /></Panel>
  <Panel title="Shareable link" sub="No website? Send it directly."><div style={{ display: "flex", alignItems: "center", gap: 10, background: C.paper, padding: "12px 14px", borderRadius: 11, fontFamily: "'Geist Mono', monospace", fontSize: 13.5, color: C.teal }}><ExternalLink size={15} /> forms.tradewind.app/{s}</div></Panel>
</>); }

function Metric({ label, value, sub, color }) { return (<div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "18px 20px" }}><div style={{ fontSize: 12.5, color: C.ink3, fontWeight: 600 }}>{label}</div><div style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 600, color: color || C.ink, margin: "4px 0 0" }}>{value}</div>{sub && <div style={{ fontSize: 12.5, color: C.ink3 }}>{sub}</div>}</div>); }
function DashboardTab({ leads, config }) {
  const total = leads.length;
  const booked = leads.filter((l) => l.status === "Booked").length;
  const conv = total ? Math.round((booked / total) * 100) : 0;
  const mix = { replace: 0, unsure: 0, repair: 0 }; leads.forEach((l) => { mix[l.jobType] = (mix[l.jobType] || 0) + 1; });
  const repl = leads.filter((l) => l.intent === "replacement");
  const avg = repl.length ? repl.reduce((s, l) => { const o = l.options?.find((x) => x.key === (l.selectedTier || l.recommendedTier)); return s + (o?.total || 0); }, 0) / repl.length : 0;
  const seg = [{ k: "replace", c: C.teal, label: "Replacement" }, { k: "unsure", c: config.company.accent, label: "Not sure" }, { k: "repair", c: C.ink3, label: "Repair" }];
  if (!total) return (<Panel><div style={{ textAlign: "center", padding: "30px 0" }}><BarChart3 size={30} color={C.line2} /><p style={{ color: C.ink2, fontSize: 15, margin: "12px 0 4px", fontWeight: 600 }}>No data yet</p><p style={{ color: C.ink3, fontSize: 13.5, margin: 0 }}>Run a few leads through the <b>Live Form</b> and your funnel shows up here.</p></div></Panel>);
  return (<>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 20 }}>
      <Metric label="Total leads" value={total} />
      <Metric label="Visits booked" value={booked} sub={`${conv}% conversion`} color={C.green} />
      <Metric label="Replacement leads" value={repl.length} sub="proposal generated" color={C.teal} />
      <Metric label="Avg. replacement ticket" value={money(avg)} color={config.company.accent} />
    </div>
    <Panel title="Lead mix by intent" sub="The whole point — you're catching all three, not just replacement shoppers.">
      <div style={{ display: "flex", height: 16, borderRadius: 20, overflow: "hidden", marginBottom: 14 }}>{seg.map((s) => { const w = total ? (mix[s.k] / total) * 100 : 0; return w > 0 ? <div key={s.k} style={{ width: `${w}%`, background: s.c }} /> : null; })}</div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>{seg.map((s) => <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, color: C.ink2 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: s.c }} /> {s.label} <b style={{ color: C.ink }}>{mix[s.k] || 0}</b></div>)}</div>
    </Panel>
  </>);
}

function LeadsTab({ leads, accent, onOpen, setLeads }) {
  if (!leads.length) return (<Panel><div style={{ textAlign: "center", padding: "30px 0" }}><Users size={30} color={C.line2} /><p style={{ color: C.ink2, fontSize: 15, margin: "12px 0 4px", fontWeight: 600 }}>No leads yet</p><p style={{ color: C.ink3, fontSize: 13.5, margin: 0 }}>Switch to <b>Live Form</b>, run the flow, and leads land here. Click any row for the full detail.</p></div></Panel>);
  const jobChip = { replace: ["Replace", C.teal], unsure: ["Not sure", accent], repair: ["Repair", C.ink3] };
  return (<Panel title={`${leads.length} captured lead${leads.length > 1 ? "s" : ""}`} sub="Click any row for everything the homeowner gave you.">
    <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
      <thead><tr style={{ textAlign: "left", color: C.ink3, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em" }}>{["Customer", "Job", "Detail", "Value", "Status"].map((h) => <th key={h} style={{ padding: "8px 10px", fontWeight: 700, borderBottom: `1px solid ${C.line}` }}>{h}</th>)}</tr></thead>
      <tbody>{leads.map((l) => { const [jl, jc] = jobChip[l.jobType] || ["—", C.ink3]; const isRepl = l.intent === "replacement"; const opt = l.options?.find((x) => x.key === (l.selectedTier || l.recommendedTier)); return (
        <tr key={l.id} className="tw-row" onClick={() => onOpen(l)} style={{ borderBottom: `1px solid ${C.line}` }}>
          <td style={{ padding: "11px 10px", fontWeight: 600, color: C.ink }}>{l.name}<div style={{ color: C.ink3, fontWeight: 400, fontSize: 12 }}>{new Date(l.ts).toLocaleDateString()}</div></td>
          <td style={{ padding: "11px 10px" }}><span style={{ background: jc + "1A", color: jc, fontWeight: 700, fontSize: 12, padding: "3px 9px", borderRadius: 20 }}>{jl}</span></td>
          <td style={{ padding: "11px 10px", color: C.ink2 }}>{isRepl ? `${Number(l.sqft).toLocaleString()} sq ft · ${l.tons} tons` : labelOf(SYMPTOMS, l.symptom)}<div style={{ color: C.ink3, fontSize: 12 }}>{isRepl ? labelOf(PRIORITY_OPTIONS, l.priority) : labelOf(SYSTEM_TYPES, l.systemType)}</div></td>
          <td style={{ padding: "11px 10px", color: C.ink, fontWeight: 600 }}>{isRepl ? money(opt?.total) : `${money(l.diagnosticFee)} visit`}</td>
          <td style={{ padding: "11px 10px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, fontSize: 12.5, color: STATUS[l.status] }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS[l.status] }} />{l.status}</span></td>
        </tr>); })}</tbody>
    </table></div>
    <div style={{ marginTop: 18 }}><Btn kind="ghost" small onClick={() => { if (confirm("Clear all leads?")) setLeads([]); }}><Trash2 size={14} /> Clear leads</Btn></div>
  </Panel>);
}

function DRow({ label, value }) { return (<div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "9px 0", borderBottom: `1px solid ${C.line}`, fontSize: 14 }}><span style={{ color: C.ink3 }}>{label}</span><span style={{ color: C.ink, fontWeight: 600, textAlign: "right" }}>{value}</span></div>); }
function LeadDetail({ lead, config, onClose, onStatus }) {
  const fin = config.financing.enabled; const isRepl = lead.intent === "replacement";
  return (<div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(28,26,23,.5)", display: "flex", justifyContent: "flex-end" }}>
    <div className="tw-pop" onClick={(e) => e.stopPropagation()} style={{ width: "min(520px,100%)", height: "100%", background: C.card, overflowY: "auto", boxShadow: "-30px 0 80px -40px rgba(0,0,0,.5)" }}>
      <div style={{ height: 5, background: `linear-gradient(90deg, ${C.teal}, ${config.company.accent})` }} />
      <div style={{ padding: "22px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: C.ember }}>{isRepl ? "Replacement lead" : lead.jobType === "repair" ? "Repair lead" : "Triaged lead"}</div><h2 style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 500, color: C.ink, margin: "3px 0 2px" }}>{lead.name}</h2><div style={{ fontSize: 12.5, color: C.ink3 }}>Captured {new Date(lead.ts).toLocaleString()}</div></div>
          <button onClick={onClose} className="tw-btn" style={{ background: C.paper, border: "none", borderRadius: 10, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={18} color={C.ink2} /></button>
        </div>
        <div style={{ display: "flex", gap: 8, margin: "18px 0 6px" }}>{["New", "Quoted", "Booked"].map((s) => <button key={s} onClick={() => onStatus(s)} className="tw-btn" style={{ flex: 1, padding: "9px", fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", border: `1px solid ${lead.status === s ? STATUS[s] : C.line2}`, background: lead.status === s ? STATUS[s] : "transparent", color: lead.status === s ? "#fff" : C.ink2 }}>{s}</button>)}</div>
        <h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.ink3, margin: "22px 0 4px" }}>Contact</h4>
        <DRow label="Email" value={lead.email || "—"} /><DRow label="Phone" value={lead.phone || "—"} /><DRow label="Address" value={lead.address || "—"} />
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}><Btn small kind="ghost" onClick={() => window.open(`mailto:${lead.email}`)}><Mail size={14} /> Email</Btn><Btn small kind="ghost" onClick={() => window.open(`tel:${lead.phone}`)}><Phone size={14} /> Call</Btn></div>
        <h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.ink3, margin: "22px 0 4px" }}>What they told us</h4>
        <DRow label="Job type" value={labelOf(JOB_TYPES, lead.jobType)} />
        {lead.symptom && <DRow label="Symptom" value={labelOf(SYMPTOMS, lead.symptom)} />}
        {lead.systemType && <DRow label="Current system" value={labelOf(SYSTEM_TYPES, lead.systemType)} />}
        {lead.systemAge && <DRow label="System age" value={labelOf(AGE_OPTIONS, lead.systemAge)} />}
        {lead.hasPhoto && <DRow label="Photo" value="Uploaded ✓" />}
        {isRepl && <><DRow label="Home" value={`${Number(lead.sqft).toLocaleString()} sq ft · ${lead.stories} story · ${lead.yearBuilt}`} /><DRow label="Sized system" value={`${lead.tons} tons`} /><DRow label="Priority" value={labelOf(PRIORITY_OPTIONS, lead.priority)} /></>}
        {isRepl ? (<><h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.ink3, margin: "22px 0 10px" }}>Proposal generated</h4>{lead.options?.map((o) => { const rec = o.key === lead.recommendedTier; const sel = o.key === lead.selectedTier; return (<div key={o.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", marginBottom: 8, borderRadius: 11, border: `1px solid ${sel ? config.company.accent : C.line}`, background: sel ? config.company.accent + "0F" : C.card }}><div style={{ fontWeight: 600, color: C.ink, fontSize: 14 }}>{o.tier} · {o.brand}{sel && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: config.company.accent }}>SELECTED</span>}{!sel && rec && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: C.teal }}>REC</span>}</div><div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: C.ink }}>{money(o.total)}</div>{fin && <div style={{ fontSize: 12, color: C.teal }}>{money(o.mo)}/mo</div>}</div></div>); })}</>) : (<><h4 style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.ink3, margin: "22px 0 4px" }}>Service request</h4><DRow label="Visit" value={config.diagnostic.label} /><DRow label="Diagnostic fee" value={money(lead.diagnosticFee)} /></>)}
      </div>
    </div>
  </div>);
}

/* ==============================  CUSTOMER FORM  =========================== */
function ContactGate({ data, upd, onSubmit, accent, title, sub, cta, onBack }) {
  return (<>
    <div style={{ textAlign: "center", padding: "8px 0 4px" }}><div style={{ width: 56, height: 56, borderRadius: "50%", background: accent + "14", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Unlock size={26} color={accent} /></div><h2 style={{ fontFamily: "Fraunces, serif", fontSize: 25, fontWeight: 500, color: C.ink, margin: "0 0 6px" }}>{title}</h2><p style={{ color: C.ink2, fontSize: 14.5, margin: "0 auto 22px", maxWidth: 360 }}>{sub}</p></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}><div><Label>Full name</Label><Text value={data.name} onChange={(v) => upd("name", v)} placeholder="Jordan Rivera" /></div><div><Label>Email</Label><Text type="email" value={data.email} onChange={(v) => upd("email", v)} placeholder="you@email.com" /></div><div><Label>Phone</Label><Text value={data.phone} onChange={(v) => upd("phone", v)} placeholder="(555) 123-4567" /></div></div>
    <div style={{ marginTop: 20 }}><Btn accent={accent} full onClick={() => { if (data.name && data.email) onSubmit(); }}>{cta} <ArrowRight size={16} /></Btn></div>
    <p style={{ fontSize: 11.5, color: C.ink3, textAlign: "center", marginTop: 12 }}>By submitting, you agree to receive communications about your request.</p>
    {onBack && <Back onClick={onBack} label="Back" />}
  </>);
}

function CustomerForm({ config, addLead, updateLead }) {
  const accent = config.company.accent;
  const [step, setStep] = useState("job");
  const [data, setData] = useState({ jobType: "", name: "", email: "", phone: "", address: "", sqft: 0, stories: 0, yearBuilt: 0, systemType: "", systemAge: "", priority: "", symptom: "", hasPhoto: false, photoName: "" });
  const [looked, setLooked] = useState(false);
  const [unlocked, setUnlocked] = useState(config.gate === "open");
  const [chosen, setChosen] = useState(null);
  const [pendingTier, setPendingTier] = useState(null);
  const [leadId, setLeadId] = useState(null);
  const upd = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const tons = sizeTons(data.sqft || 1800, config.sizing.sqftPerTon);
  const recKey = recommendKey(data.priority);
  const options = ["good", "better", "best"].map((key) => { const p = config.packages[key]; const total = priceFor(p, tons, config.labor).total; return { key, tier: p.tier, name: p.name, brand: p.brand, seer: p.seer, warranty: p.warranty, features: p.features, total, mo: monthly(total, config.financing.apr, config.financing.term) }; });
  const intent = data.jobType === "replace" ? "replacement" : data.jobType === "unsure" ? triageIntent(data.systemAge, data.symptom) : "diagnostic";

  const buildLead = (patch = {}) => {
    const id = Math.random().toString(36).slice(2);
    const lead = { id, ts: Date.now(), status: "New", jobType: data.jobType, name: data.name || "Website visitor", email: data.email, phone: data.phone, address: data.address, sqft: data.sqft, stories: data.stories, yearBuilt: data.yearBuilt, systemType: data.systemType, systemAge: data.systemAge, priority: data.priority, symptom: data.symptom, hasPhoto: data.hasPhoto, tons, intent: patch.intent || intent, recommendedTier: recKey, selectedTier: null, diagnosticFee: config.diagnostic.fee, options: options.map((o) => ({ key: o.key, tier: o.tier, name: o.name, brand: o.brand, total: o.total, mo: o.mo })), ...patch };
    addLead(lead); setLeadId(id); return id;
  };

  const Shell = ({ children, wide }) => (<div style={{ minHeight: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "44px 20px 80px" }}>
    <div className="tw-rise" style={{ width: "100%", maxWidth: wide ? 940 : 560, background: C.card, borderRadius: 20, border: `1px solid ${C.line}`, boxShadow: "0 30px 70px -50px rgba(28,26,23,.5)", overflow: "hidden" }}>
      <div style={{ height: 5, background: `linear-gradient(90deg, ${C.teal}, ${accent})` }} />
      <div style={{ padding: "26px 30px 14px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${C.line}` }}><div style={{ width: 40, height: 40, borderRadius: 11, background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Wind size={21} color="#fff" /></div><div><div style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 500, color: C.ink, lineHeight: 1.1 }}>{config.company.name}</div><div style={{ fontSize: 12.5, color: C.ink3 }}>{config.company.tagline}</div></div></div>
      <div style={{ padding: "26px 30px 30px" }}>{children}</div>
    </div>
  </div>);
  const OptList = ({ items, onPick, value, withSub }) => (<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{items.map((o) => { const I = o.icon; const a = value === o.id; return (<button key={o.id} className="tw-opt tw-btn" onClick={() => onPick(o.id)} style={{ display: "flex", alignItems: "center", gap: 13, textAlign: "left", padding: "15px 17px", borderRadius: 13, cursor: "pointer", fontFamily: "inherit", background: a ? accent + "0F" : C.card, border: `1.5px solid ${a ? accent : C.line2}` }}><I size={19} color={a ? accent : C.ink3} style={{ flexShrink: 0 }} /><span style={{ flex: 1 }}><span style={{ fontSize: 15, fontWeight: 600, color: C.ink, display: "block" }}>{o.label}</span>{withSub && o.sub && <span style={{ fontSize: 12.5, color: C.ink3 }}>{o.sub}</span>}</span>{o.tag && <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: C.green, background: C.green + "1A", padding: "3px 8px", borderRadius: 20 }}>{o.tag}</span>}</button>); })}</div>);

  const afterAddress = () => { if (data.jobType === "replace") setStep("priority"); else setStep("symptom"); };
  const afterSymptom = () => { if (data.jobType === "repair") setStep("photo"); else setStep("systemType"); };
  const choose = (o) => { setChosen(o); if (leadId) { updateLead(leadId, { selectedTier: o.key, status: "Quoted" }); setStep("schedule"); } else { setPendingTier(o); setStep("contact"); } };

  /* job type */
  if (step === "job") return (<Shell>
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 27, fontWeight: 500, color: C.ink, margin: "4px 0 4px" }}>How can we help today?</h2>
    <p style={{ color: C.ink2, fontSize: 14.5, margin: "0 0 22px" }}>Tell us what's going on and we'll take it from there.</p>
    <OptList items={JOB_TYPES} value={data.jobType} withSub onPick={(id) => { upd("jobType", id); setStep("address"); }} />
  </Shell>);

  /* address */
  if (step === "address") { const stepsArr = data.jobType === "replace" ? ["Your home", "Your pick", "Book"] : ["About it", data.jobType === "unsure" ? "Triage" : "Details", "Book"]; return (<Shell>
    <Steps labels={stepsArr} idx={0} accent={accent} />
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 25, fontWeight: 500, color: C.ink, margin: "4px 0 4px" }}>{data.jobType === "replace" ? "Let's size the right system for your home" : "What's the address?"}</h2>
    <p style={{ color: C.ink2, fontSize: 14.5, margin: "0 0 20px" }}>{data.jobType === "replace" ? "Start with your address — we'll pull your home's details automatically." : "So we know where we're headed."}</p>
    <Label>Home address</Label>
    <div style={{ display: "flex", gap: 10 }}><div style={{ flex: 1 }}><Text value={data.address} onChange={(v) => { upd("address", v); setLooked(false); }} placeholder="123 Maple St, Irvine, CA" /></div><Btn accent={accent} onClick={() => { if (!data.address.trim()) return; const p = lookupProperty(data.address); setData((d) => ({ ...d, ...p })); setLooked(true); }}><Search size={16} /> Find</Btn></div>
    <p style={{ fontSize: 12, color: C.ink3, marginTop: 8 }}>Demo: enter any address to continue.</p>
    {looked && (data.jobType === "replace" || data.jobType === "unsure") && (<div className="tw-pop" style={{ marginTop: 18, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, background: C.paper }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.green, fontWeight: 600, marginBottom: 12 }}><CheckCircle2 size={15} /> Found it — here's what we have on file</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>{[["Square feet", Number(data.sqft).toLocaleString()], ["Stories", data.stories], ["Built", data.yearBuilt]].map(([k, v]) => <div key={k} style={{ background: C.card, borderRadius: 10, padding: "12px 8px", textAlign: "center" }}><div style={{ fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 600, color: C.ink }}>{v}</div><div style={{ fontSize: 11.5, color: C.ink3 }}>{k}</div></div>)}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 12.5, color: C.ink3 }}>Adjust sq ft:</span><div style={{ width: 110 }}><Num value={data.sqft} onChange={(v) => upd("sqft", v || 0)} /></div><div style={{ flex: 1 }} /><Btn accent={accent} small onClick={afterAddress}>Looks right <ArrowRight size={15} /></Btn></div>
    </div>)}
    {looked && data.jobType === "repair" && <div style={{ marginTop: 16 }}><Btn accent={accent} onClick={afterAddress}>Continue <ArrowRight size={15} /></Btn></div>}
    <Back onClick={() => setStep("job")} />
  </Shell>); }

  /* priority (replace) */
  if (step === "priority") return (<Shell>
    <Steps labels={["Your home", "Your pick", "Book"]} idx={1} accent={accent} />
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 500, color: C.ink, margin: "4px 0 4px" }}>What matters most in a new system?</h2>
    <p style={{ color: C.ink2, fontSize: 14, margin: "0 0 20px" }}>We'll highlight the option that fits you best.</p>
    <OptList items={PRIORITY_OPTIONS} value={data.priority} onPick={(id) => { upd("priority", id); setStep("proposal"); }} />
    <Back onClick={() => setStep("address")} />
  </Shell>);

  /* symptom (repair + unsure) */
  if (step === "symptom") return (<Shell>
    <Steps labels={data.jobType === "unsure" ? ["About it", "Triage", "Book"] : ["About it", "Details", "Book"]} idx={0} accent={accent} />
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 500, color: C.ink, margin: "4px 0 4px" }}>What's going on with your system?</h2>
    <p style={{ color: C.ink2, fontSize: 14, margin: "0 0 20px" }}>Pick the closest.</p>
    <OptList items={SYMPTOMS} value={data.symptom} onPick={(id) => { upd("symptom", id); afterSymptom(); }} />
    <Back onClick={() => setStep("address")} />
  </Shell>);

  /* photo (repair) */
  if (step === "photo") return (<Shell>
    <Steps labels={["About it", "Details", "Book"]} idx={1} accent={accent} />
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 500, color: C.ink, margin: "4px 0 6px" }}>Want to show us your unit? <span style={{ color: C.ink3, fontSize: 16 }}>(optional)</span></h2>
    <p style={{ color: C.ink2, fontSize: 14, margin: "0 0 20px" }}>A quick photo of your system or its nameplate helps our tech show up prepared with the right parts.</p>
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "34px 20px", border: `2px dashed ${C.line2}`, borderRadius: 14, cursor: "pointer", background: data.hasPhoto ? C.green + "0D" : C.paper }}>
      <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) setData((d) => ({ ...d, hasPhoto: true, photoName: f.name })); }} />
      {data.hasPhoto ? <><CheckCircle2 size={26} color={C.green} /><span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{data.photoName}</span><span style={{ fontSize: 12.5, color: C.ink3 }}>Tap to replace</span></> : <><Camera size={26} color={C.ink3} /><span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>Add a photo</span><span style={{ fontSize: 12.5, color: C.ink3 }}>or skip — totally optional</span></>}
    </label>
    <div style={{ marginTop: 18 }}><Btn accent={accent} full onClick={() => setStep("diagnostic")}>{data.hasPhoto ? "Continue" : "Skip for now"} <ArrowRight size={16} /></Btn></div>
    <Back onClick={() => setStep("symptom")} />
  </Shell>);

  /* systemType (unsure) */
  if (step === "systemType") return (<Shell>
    <Steps labels={["About it", "Triage", "Book"]} idx={1} accent={accent} />
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 500, color: C.ink, margin: "4px 0 20px" }}>What type of system do you have?</h2>
    <OptList items={SYSTEM_TYPES} value={data.systemType} onPick={(id) => { upd("systemType", id); setStep("systemAge"); }} />
    <Back onClick={() => setStep("symptom")} />
  </Shell>);

  /* systemAge (unsure) */
  if (step === "systemAge") return (<Shell>
    <Steps labels={["About it", "Triage", "Book"]} idx={1} accent={accent} />
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 500, color: C.ink, margin: "4px 0 20px" }}>How old is it?</h2>
    <OptList items={AGE_OPTIONS} value={data.systemAge} onPick={(id) => { upd("systemAge", id); setStep("triage"); }} />
    <Back onClick={() => setStep("systemType")} />
  </Shell>);

  /* triage result (unsure) */
  if (step === "triage") { const replace = intent === "replacement"; return (<Shell>
    <Steps labels={["About it", "Triage", "Book"]} idx={1} accent={accent} />
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}><div style={{ width: 44, height: 44, borderRadius: 12, background: (replace ? C.teal : accent) + "16", display: "flex", alignItems: "center", justifyContent: "center" }}>{replace ? <RefreshCw size={22} color={C.teal} /> : <Wrench size={22} color={accent} />}</div><h2 style={{ fontFamily: "Fraunces, serif", fontSize: 23, fontWeight: 500, color: C.ink, margin: 0 }}>{replace ? "Replacement is likely the smarter spend" : "Sounds like a service call"}</h2></div>
    <p style={{ color: C.ink2, fontSize: 14.5, margin: "0 0 22px", lineHeight: 1.6 }}>{replace ? `A ${labelOf(AGE_OPTIONS, data.systemAge).toLowerCase()} ${labelOf(SYSTEM_TYPES, data.systemType).toLowerCase()} with "${labelOf(SYMPTOMS, data.symptom).toLowerCase()}" is often more cost-effective to replace than to keep repairing. Here's what a new system would look like — no obligation.` : `Based on the age and symptom, this is usually a repair, not a replacement. Let's get a technician out to diagnose it.`}</p>
    {replace ? <Btn accent={accent} full onClick={() => setStep("proposal")}>See my options <ArrowRight size={16} /></Btn> : <Btn accent={accent} full onClick={() => setStep("diagnostic")}>Book a diagnostic visit <ArrowRight size={16} /></Btn>}
    <div style={{ marginTop: 14, textAlign: "center" }}><button onClick={() => replace ? setStep("diagnostic") : setStep("proposal")} style={{ background: "none", border: "none", color: C.ink3, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{replace ? "Actually, I'd rather just book a repair visit" : "Show me replacement options anyway"}</button></div>
    <Back onClick={() => setStep("systemAge")} />
  </Shell>); }

  /* proposal (replace + unsure→replacement) */
  if (step === "proposal") { const locked = config.gate !== "open" && !unlocked; const showRange = config.gate === "range"; const lo = options[0].total, hi = options[2].total; const blur = (extra) => ({ filter: locked ? "blur(8px)" : "none", userSelect: locked ? "none" : "auto", ...extra }); return (<Shell wide>
    <Steps labels={["Your home", "Your pick", "Book"]} idx={1} accent={accent} />
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 25, fontWeight: 500, color: C.ink, margin: "4px 0 2px" }}>Your options for a <span style={{ fontStyle: "italic", color: C.teal }}>{tons}-ton</span> system</h2>
    <p style={{ color: C.ink2, fontSize: 14, margin: "0 0 6px" }}>Sized for your {Number(data.sqft).toLocaleString()} sq ft home.</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 18 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: C.green, fontWeight: 600, background: C.green + "14", padding: "5px 11px", borderRadius: 20 }}><CheckCircle2 size={14} /> Confirmed fit · {data.address || "your home"}</span>
      {showRange && <span style={{ fontSize: 13, color: C.ink2 }}>Projects like yours run <b style={{ color: C.ink }}>{money(lo)}–{money(hi)}</b>{config.financing.enabled && <span style={{ color: C.teal }}> · from {money(options[0].mo)}/mo</span>}</span>}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, alignItems: "start" }}>{options.map((p, i) => { const rec = p.key === recKey; return (<div key={p.key} className="tw-card tw-rise" style={{ animationDelay: `${i * 70}ms`, position: "relative", background: rec ? C.ink : C.card, color: rec ? "#fff" : C.ink, border: `1px solid ${rec ? C.ink : C.line}`, borderRadius: 16, padding: "22px 20px", marginTop: rec ? -8 : 0 }}>
      {rec && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: accent, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><Star size={11} /> Your pick</div>}
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: rec ? accent : C.ink3 }}>{p.tier}</div>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 21, fontWeight: 500, margin: "3px 0 1px" }}>{p.name}</div>
      <div style={{ fontSize: 12.5, color: rec ? "rgba(255,255,255,.6)" : C.ink3, marginBottom: 14 }}>{p.brand}</div>
      {config.financing.enabled ? (<><div style={blur({ display: "flex", alignItems: "baseline", gap: 6 })}><span style={{ fontFamily: "Fraunces, serif", fontSize: 32, fontWeight: 500, color: rec ? "#fff" : C.ink }}>{money(p.mo)}</span><span style={{ fontSize: 13, color: rec ? "rgba(255,255,255,.6)" : C.ink3 }}>/mo*</span></div><div style={blur({ fontSize: 12.5, color: rec ? "rgba(255,255,255,.55)" : C.ink3, marginBottom: 16 })}>or {money(p.total)} total</div></>) : (<div style={blur({ marginBottom: 16 })}><span style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 500 }}>{money(p.total)}</span></div>)}
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>{[p.seer, p.warranty, ...p.features.slice(0, 2)].map((f, j) => <li key={j} style={{ display: "flex", gap: 9, fontSize: 13, lineHeight: 1.4, color: rec ? "rgba(255,255,255,.92)" : C.ink2 }}><Check size={15} style={{ flexShrink: 0, marginTop: 1 }} color={rec ? accent : C.teal} /> {f}</li>)}</ul>
      {locked ? <button className="tw-btn" onClick={() => setStep("gate")} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: 700, borderRadius: 11, cursor: "pointer", fontFamily: "inherit", background: rec ? accent : "transparent", color: rec ? "#fff" : C.ink, border: `1.5px solid ${rec ? accent : C.line2}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Lock size={14} /> Show pricing</button> : <button className="tw-btn" onClick={() => choose(p)} style={{ width: "100%", padding: "12px", fontSize: 14.5, fontWeight: 700, borderRadius: 11, cursor: "pointer", fontFamily: "inherit", background: rec ? accent : "transparent", color: rec ? "#fff" : C.ink, border: `1.5px solid ${rec ? accent : C.line2}` }}>Choose {p.tier}</button>}
    </div>); })}</div>
    {locked && <div style={{ marginTop: 22, textAlign: "center" }}><Btn accent={accent} onClick={() => setStep("gate")}><Lock size={15} /> Show my pricing</Btn></div>}
    {config.financing.enabled && <p style={{ fontSize: 11.5, color: C.ink3, marginTop: 16 }}>*Estimated payment at {config.financing.apr}% APR over {config.financing.term} months on approved credit. Final terms set with your application.</p>}
    <Back onClick={() => setStep(data.jobType === "replace" ? "priority" : "triage")} />
  </Shell>); }

  /* gate (unlock pricing) */
  if (step === "gate") return (<Shell><ContactGate data={data} upd={upd} accent={accent} title="See your pricing" sub="Enter your details and we'll reveal personalized pricing for all three options." cta="Show my pricing" onBack={() => setStep("proposal")} onSubmit={() => { buildLead(); setUnlocked(true); setStep("proposal"); }} /></Shell>);

  /* contact (open-mode choose) */
  if (step === "contact") return (<Shell><ContactGate data={data} upd={upd} accent={accent} title="Almost there" sub="Where should we send your proposal and confirm your visit?" cta="Continue" onBack={() => setStep("proposal")} onSubmit={() => { buildLead({ selectedTier: pendingTier?.key, status: "Quoted" }); setStep("schedule"); }} /></Shell>);

  /* diagnostic (repair + unsure→diagnostic) */
  if (step === "diagnostic") { const d = config.diagnostic; return (<Shell>
    <Steps labels={data.jobType === "unsure" ? ["About it", "Triage", "Book"] : ["About it", "Details", "Book"]} idx={2} accent={accent} />
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 8 }}><div style={{ width: 44, height: 44, borderRadius: 12, background: accent + "16", display: "flex", alignItems: "center", justifyContent: "center" }}><Wrench size={22} color={accent} /></div><h2 style={{ fontFamily: "Fraunces, serif", fontSize: 23, fontWeight: 500, color: C.ink, margin: 0 }}>{d.label}</h2></div>
    <p style={{ color: C.ink2, fontSize: 14.5, margin: "0 0 18px", lineHeight: 1.6 }}>A licensed technician comes out, diagnoses the issue, and gives you a repair quote on the spot.</p>
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, background: C.paper, marginBottom: 20 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontSize: 14.5, color: C.ink2 }}>Diagnostic fee</span><span style={{ fontFamily: "Fraunces, serif", fontSize: 26, fontWeight: 600, color: C.ink }}>{money(d.fee)}</span></div>{d.waived && <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.green, fontWeight: 600, marginTop: 8 }}><CheckCircle2 size={14} /> Waived if you move forward with the repair</div>}</div>
    <Btn accent={accent} full onClick={() => setStep("contactDiag")}>Book my visit <ArrowRight size={16} /></Btn>
    <Back onClick={() => setStep(data.jobType === "repair" ? "photo" : "triage")} />
  </Shell>); }

  /* contact for diagnostic */
  if (step === "contactDiag") return (<Shell><ContactGate data={data} upd={upd} accent={accent} title="Almost there" sub="Where should we confirm your visit?" cta="Continue to scheduling" onBack={() => setStep("diagnostic")} onSubmit={() => { buildLead({ intent: "diagnostic" }); setStep("schedule"); }} /></Shell>);

  /* schedule */
  if (step === "schedule") { const url = config.calendar.url; const isRepl = intent === "replacement"; return (<Shell>
    <Steps labels={isRepl ? ["Your home", "Your pick", "Book"] : data.jobType === "unsure" ? ["About it", "Triage", "Book"] : ["About it", "Details", "Book"]} idx={2} accent={accent} />
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}><CheckCircle2 size={22} color={C.green} /><h2 style={{ fontFamily: "Fraunces, serif", fontSize: 24, fontWeight: 500, color: C.ink, margin: 0 }}>{isRepl ? "Great choice — let's book your visit" : "Let's get you on the schedule"}</h2></div>
    <p style={{ color: C.ink2, fontSize: 14.5, margin: "0 0 18px" }}>{isRepl ? <>You selected the <b style={{ color: accent }}>{chosen?.tier}</b> package ({money(chosen?.total)}{config.financing.enabled ? `, ~${money(chosen?.mo)}/mo` : ""}). Pick a time and an advisor will confirm sizing and finalize your quote.</> : <>Pick a time and a {config.company.name} technician will come diagnose your system.</>}</p>
    {isRepl && config.financing.enabled && config.financing.preApprovalUrl && <div style={{ marginBottom: 16 }}><Btn kind="ghost" onClick={() => window.open(config.financing.preApprovalUrl, "_blank")}><DollarSign size={15} /> Get pre-approved for ~{money(chosen?.mo)}/mo</Btn></div>}
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden", background: C.paper }}>{url ? <iframe title="Schedule" src={url} style={{ width: "100%", height: 440, border: 0 }} /> : <div style={{ padding: 30, textAlign: "center", color: C.ink3 }}>No scheduling link configured.</div>}</div>
    <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{url && <Btn accent={accent} onClick={() => window.open(url, "_blank")}>Open scheduler <ExternalLink size={15} /></Btn>}<Btn kind="ghost" onClick={() => { if (leadId) updateLead(leadId, { status: "Booked" }); setStep("done"); }}>I've booked my time <Check size={15} /></Btn></div>
    <p style={{ fontSize: 12.5, color: C.ink3, marginTop: 14 }}>Powered by {config.calendar.provider} · details sent to {config.company.email}</p>
  </Shell>); }

  /* done */
  return (<Shell><div style={{ textAlign: "center", padding: "20px 0" }}>
    <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.green + "1A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}><CheckCircle2 size={34} color={C.green} /></div>
    <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 27, fontWeight: 500, color: C.ink, margin: "0 0 8px" }}>You're all set, {(data.name || "").split(" ")[0] || "friend"}!</h2>
    <p style={{ color: C.ink2, fontSize: 15, margin: "0 auto 22px", maxWidth: 390, lineHeight: 1.6 }}>{config.company.name} will be in touch to confirm. A note is on its way to <b>{data.email}</b>.</p>
    <div style={{ display: "inline-flex", gap: 16, flexWrap: "wrap", justifyContent: "center", fontSize: 13.5, color: C.ink3 }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={14} /> {config.company.phone}</span><span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={14} /> {config.company.email}</span></div>
    <div style={{ marginTop: 26 }}><Btn kind="ghost" small onClick={() => { setData({ jobType: "", name: "", email: "", phone: "", address: "", sqft: 0, stories: 0, yearBuilt: 0, systemType: "", systemAge: "", priority: "", symptom: "", hasPhoto: false, photoName: "" }); setLooked(false); setUnlocked(config.gate === "open"); setChosen(null); setPendingTier(null); setLeadId(null); setStep("job"); }}>Start over</Btn></div>
  </div></Shell>);
}

/* =================================  APP  ================================== */
export default function App() {
  const [view, setView] = useState("studio");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [leads, setLeads] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { (async () => { try { const r = await window.storage.get("tradewind:config"); if (r?.value) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(r.value) }); } catch (e) {} try { const r = await window.storage.get("tradewind:leads"); if (r?.value) setLeads(JSON.parse(r.value)); } catch (e) {} setLoaded(true); })(); }, []);
  useEffect(() => { if (loaded) try { window.storage.set("tradewind:config", JSON.stringify(config)); } catch (e) {} }, [config, loaded]);
  useEffect(() => { if (loaded) try { window.storage.set("tradewind:leads", JSON.stringify(leads)); } catch (e) {} }, [leads, loaded]);
  const addLead = useCallback((lead) => setLeads((l) => [lead, ...l]), []);
  const updateLead = useCallback((id, patch) => setLeads((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x))), []);
  return (<div style={{ minHeight: "100vh", background: view === "form" ? C.paper : "#FBF8F2", fontFamily: "'Hanken Grotesk', system-ui, sans-serif", color: C.ink }}>
    <style>{FONTS}</style>
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(251,248,242,.85)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: 9, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}><Wind size={17} color="#fff" /></div><div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><span style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 600, letterSpacing: "-.01em" }}>Tradewind</span><span style={{ fontSize: 11.5, color: C.ink3, display: "flex", gap: 4, alignItems: "center" }}><Snowflake size={11} color={C.teal} /><Flame size={11} color={C.ember} /> HVAC front door</span></div></div>
        <div style={{ display: "flex", background: "#EFE8DB", borderRadius: 11, padding: 4, gap: 2 }}>{[{ id: "studio", label: "Contractor Studio", icon: Settings }, { id: "form", label: "Live Form", icon: Eye }].map((v) => { const a = view === v.id; const I = v.icon; return (<button key={v.id} className="tw-btn" onClick={() => setView(v.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", border: "none", background: a ? C.card : "transparent", color: a ? C.ink : C.ink3, boxShadow: a ? "0 1px 3px rgba(0,0,0,.08)" : "none" }}><I size={14} /> {v.label}</button>); })}</div>
      </div>
    </div>
    {view === "studio" ? <Studio config={config} setConfig={setConfig} leads={leads} setLeads={setLeads} updateLead={updateLead} /> : <CustomerForm config={config} addLead={addLead} updateLead={updateLead} />}
  </div>);
}
