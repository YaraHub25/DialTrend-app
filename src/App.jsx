import { useState, useEffect } from "react";
import {
  Search, Clock, Phone, Shield, ChevronLeft,
  TrendingUp, Users, CheckCircle, AlertCircle, Share2,
  Bot, UserCheck, Menu, X, Info, MessageSquare, HelpCircle, ArrowRight, Zap
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const COMPANIES = [
  {
    id: "netflix", name: "Netflix", category: "Streaming",
    phone: "1-866-579-7172", hours: "Mon–Fri 8AM–11PM, Sat–Sun 9AM–9PM",
    humanHours: { start: 8, end: 23, days: [1,2,3,4,5] },
    weekendHuman: { start: 9, end: 21 },
    botOnly: "Overnight (11PM–8AM) chatbot only",
    source: "GetHuman community reports · Avg 18 min",
    hourly: [0,0,0,0,0,0,0,0,12,16,20,24,26,22,18,15,13,16,19,16,12,10,0,0],
  },
  {
    id: "apple", name: "Apple Support", category: "Tech",
    phone: "1-800-275-2273", hours: "Mon–Sun 7AM–11PM",
    humanHours: { start: 7, end: 23, days: [0,1,2,3,4,5,6] },
    botOnly: "11PM–7AM chatbot only",
    source: "GetHuman community reports · Avg 14 min",
    hourly: [0,0,0,0,0,0,0,7,16,24,28,30,27,24,20,18,17,16,14,11,9,7,0,0],
  },
  {
    id: "amazon", name: "Amazon", category: "E-commerce",
    phone: "1-888-280-4331", hours: "Mon–Sun 5AM–11PM PT",
    humanHours: { start: 5, end: 23, days: [0,1,2,3,4,5,6] },
    botOnly: "11PM–5AM chatbot only",
    source: "GetHuman community reports · Avg 8 min",
    hourly: [0,0,0,0,0,5,8,12,18,22,25,24,22,19,17,16,17,19,20,17,14,10,0,0],
  },
  {
    id: "delta", name: "Delta Airlines", category: "Airlines",
    phone: "1-800-221-1212", hours: "24/7 — Human agents always available",
    humanHours: { start: 0, end: 24, days: [0,1,2,3,4,5,6] },
    botOnly: null,
    source: "GetHuman community reports · Avg 22 min",
    hourly: [9,7,6,5,6,11,19,28,34,36,32,29,26,24,22,20,18,16,14,12,11,10,9,9],
  },
  {
    id: "att", name: "AT&T", category: "Telecom",
    phone: "1-800-288-2020", hours: "Mon–Fri 8AM–9PM, Sat 8AM–8PM",
    humanHours: { start: 8, end: 21, days: [1,2,3,4,5] },
    weekendHuman: { start: 8, end: 20 },
    botOnly: "Evenings & Sundays — automated only",
    source: "GetHuman community reports · Avg 28 min",
    hourly: [0,0,0,0,0,0,0,0,18,28,36,38,34,30,27,24,21,18,14,10,0,0,0,0],
  },
  {
    id: "boa", name: "Bank of America", category: "Banking",
    phone: "1-800-432-1000", hours: "Mon–Fri 8AM–9PM ET",
    humanHours: { start: 8, end: 21, days: [1,2,3,4,5] },
    botOnly: "Weekends & after 9PM — automated only",
    source: "GetHuman community reports · Avg 20 min",
    hourly: [0,0,0,0,0,0,0,0,16,26,34,36,30,27,24,22,20,17,13,9,0,0,0,0],
  },
  {
    id: "comcast", name: "Comcast / Xfinity", category: "Internet & Cable",
    phone: "1-800-266-2278", hours: "Mon–Sun 8AM–8PM",
    humanHours: { start: 8, end: 20, days: [0,1,2,3,4,5,6] },
    botOnly: "After 8PM — automated only",
    source: "GetHuman community reports · Avg 34 min",
    hourly: [0,0,0,0,0,0,0,0,20,30,38,40,36,32,28,25,22,20,0,0,0,0,0,0],
  },
  {
    id: "tmobile", name: "T-Mobile", category: "Telecom",
    phone: "1-800-937-8997", hours: "Mon–Sun 7AM–11PM",
    humanHours: { start: 7, end: 23, days: [0,1,2,3,4,5,6] },
    botOnly: "11PM–7AM chatbot only",
    source: "GetHuman community reports · Avg 12 min",
    hourly: [0,0,0,0,0,0,0,8,16,22,26,28,25,22,19,17,15,14,12,10,8,6,0,0],
  },
  {
    id: "united", name: "United Airlines", category: "Airlines",
    phone: "1-800-864-8331", hours: "24/7 — Human agents always available",
    humanHours: { start: 0, end: 24, days: [0,1,2,3,4,5,6] },
    botOnly: null,
    source: "GetHuman community reports · Avg 25 min",
    hourly: [8,7,6,5,6,12,20,30,36,38,34,30,27,25,22,20,18,16,13,11,10,9,8,8],
  },
  {
    id: "microsoft", name: "Microsoft", category: "Tech",
    phone: "1-800-642-7676", hours: "24/7",
    humanHours: { start: 0, end: 24, days: [0,1,2,3,4,5,6] },
    botOnly: null,
    source: "GetHuman community reports · Avg 4 min",
    hourly: [2,1,1,1,1,2,3,5,7,8,9,8,7,6,5,4,4,5,5,4,3,2,2,2],
  },
  {
    id: "wellsfargo", name: "Wells Fargo", category: "Banking",
    phone: "1-800-869-3557", hours: "Mon–Fri 7AM–11PM, Sat–Sun 8AM–10PM",
    humanHours: { start: 7, end: 23, days: [1,2,3,4,5] },
    weekendHuman: { start: 8, end: 22 },
    botOnly: "Overnight — automated only",
    source: "GetHuman community reports · Avg 14 min",
    hourly: [0,0,0,0,0,0,0,6,14,22,28,30,26,22,19,17,15,13,11,9,7,0,0,0],
  },
  {
    id: "usps", name: "USPS", category: "Postal Service",
    phone: "1-800-275-8777", hours: "Mon–Fri 8AM–8:30PM, Sat 8AM–6PM",
    humanHours: { start: 8, end: 20, days: [1,2,3,4,5] },
    weekendHuman: { start: 8, end: 18 },
    botOnly: "Evenings & Sundays — no live agents",
    source: "GetHuman community reports · Avg 28 min",
    hourly: [0,0,0,0,0,0,0,0,18,28,34,36,32,28,25,22,18,14,10,0,0,0,0,0],
  },
  {
    id: "insurance_geico", name: "GEICO", category: "Insurance",
    phone: "1-800-207-7847", hours: "24/7 — Human agents always available",
    humanHours: { start: 0, end: 24, days: [0,1,2,3,4,5,6] },
    botOnly: null,
    source: "GetHuman community reports · Avg 10 min",
    hourly: [5,4,3,3,4,6,10,16,22,26,28,26,23,20,18,16,14,13,12,10,8,7,6,5],
  },
  {
    id: "paypal", name: "PayPal", category: "Payments",
    phone: "1-888-221-1161", hours: "Mon–Sun 6AM–10PM PT",
    humanHours: { start: 6, end: 22, days: [0,1,2,3,4,5,6] },
    botOnly: "10PM–6AM automated only",
    source: "GetHuman community reports · Avg 16 min",
    hourly: [0,0,0,0,0,0,6,12,18,24,28,30,27,24,20,18,16,14,12,10,8,0,0,0],
  },
  {
    id: "wayfair", name: "Wayfair", category: "Furniture & Home",
    phone: "1-844-638-1289", hours: "Mon–Fri 8AM–8PM ET",
    humanHours: { start: 8, end: 20, days: [1,2,3,4,5] },
    botOnly: "Weekends & evenings — no live agents",
    source: "GetHuman community reports · Avg 12 min",
    hourly: [0,0,0,0,0,0,0,0,10,18,24,26,22,20,18,16,13,10,7,0,0,0,0,0],
  },
  {
    id: "homedepot", name: "Home Depot", category: "Home Improvement",
    phone: "1-800-466-3337", hours: "Mon–Sun 8AM–7PM ET",
    humanHours: { start: 8, end: 19, days: [0,1,2,3,4,5,6] },
    botOnly: "After 7PM — no live agents",
    source: "GetHuman community reports · Avg 9 min",
    hourly: [0,0,0,0,0,0,0,0,8,15,20,22,20,18,16,14,12,9,0,0,0,0,0,0],
  },
  {
    id: "instacart", name: "Instacart", category: "Grocery Delivery",
    phone: "1-888-246-7822", hours: "24/7",
    humanHours: { start: 0, end: 24, days: [0,1,2,3,4,5,6] },
    botOnly: null,
    source: "GetHuman: Avg 3.5 min · Best: Saturday",
    hourly: [2,2,1,1,1,2,3,4,5,6,7,6,5,5,4,4,4,5,5,4,3,3,2,2],
  },
  {
    id: "healthcare_gov", name: "HealthCare.gov", category: "Government / Health",
    phone: "1-800-318-2596", hours: "Mon–Fri 8AM–9PM ET",
    humanHours: { start: 8, end: 21, days: [1,2,3,4,5] },
    botOnly: "Weekends & evenings — no live agents",
    source: "GetHuman: Avg 25 min · Worst: Wednesday",
    hourly: [0,0,0,0,0,0,0,0,20,28,36,38,32,28,24,20,16,12,8,0,0,0,0,0],
  },
  {
    id: "spotify", name: "Spotify", category: "Streaming / Music",
    phone: "No direct phone — chat & callback only", hours: "Mon–Fri 9AM–6PM via chat",
    humanHours: { start: 9, end: 18, days: [1,2,3,4,5] },
    botOnly: "No phone line — chat support only",
    source: "Community reports · Avg chat wait 8 min",
    hourly: [0,0,0,0,0,0,0,0,0,10,14,16,14,12,10,8,6,0,0,0,0,0,0,0],
  },
  {
    id: "royal_caribbean", name: "Royal Caribbean", category: "Travel / Cruises",
    phone: "1-800-256-6649", hours: "Mon–Sun 7AM–2AM ET",
    humanHours: { start: 7, end: 26, days: [0,1,2,3,4,5,6] },
    botOnly: "2AM–7AM only automated",
    source: "GetHuman: Avg 4 min · Best: Monday",
    hourly: [0,0,0,0,0,0,0,4,7,10,12,11,10,9,8,7,6,6,5,5,4,4,0,0],
  },
];

const QUICK = ["Netflix", "Amazon", "AT&T", "Delta Airlines"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getBest(hourly) {
  return hourly.map((v,i) => ({v,i})).filter(x => x.v > 0).sort((a,b) => a.v - b.v).slice(0,3).map(x => x.i);
}
function getWorst(hourly) {
  return hourly.map((v,i) => ({v,i})).filter(x => x.v > 0).sort((a,b) => b.v - a.v).slice(0,3).map(x => x.i);
}
function fmt(h) {
  if (h === 0) return "12AM"; if (h < 12) return `${h}AM`;
  if (h === 12) return "12PM"; return `${h-12}PM`;
}
function barColor(v, max) {
  const r = v / max;
  if (r < 0.4) return "#00e5a0";
  if (r < 0.7) return "#f59e0b";
  return "#ef4444";
}
function waitColor(w) {
  if (w === 0) return "rgba(255,255,255,0.2)";
  if (w > 20) return "#ef4444";
  if (w > 10) return "#f59e0b";
  return "#00e5a0";
}
function getAgentStatus(company) {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const { humanHours, weekendHuman } = company;
  const isWeekend = day === 0 || day === 6;
  if (humanHours.end > 24 || (humanHours.start === 0 && humanHours.end === 24))
    return { human: true, label: "Human agent available now" };
  if (isWeekend && weekendHuman) {
    if (hour >= weekendHuman.start && hour < weekendHuman.end)
      return { human: true, label: "Human agent available now" };
    return { human: false, label: company.botOnly || "Automated only right now" };
  }
  if (humanHours.days.includes(day) && hour >= humanHours.start && hour < humanHours.end)
    return { human: true, label: "Human agent available now" };
  return { human: false, label: company.botOnly || "Automated only right now" };
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0f", surface: "#13131a", border: "rgba(255,255,255,0.08)",
  teal: "#00e5a0", tealDim: "rgba(0,229,160,0.10)", tealBorder: "rgba(0,229,160,0.25)",
  text: "#f1f5f9", muted: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.22)",
  body: "'Plus Jakarta Sans', sans-serif",
  brand: "'Syne', sans-serif",
};

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {[10,16,22,16,10].map((h,i) => (
          <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: T.teal }} />
        ))}
      </div>
      <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px", color: T.text, fontFamily: "'Syne', sans-serif" }}>
        DialTrend
      </span>
    </div>
  );
}

// ─── Agent Badge ──────────────────────────────────────────────────────────────
function AgentBadge({ company, size = "sm" }) {
  const status = getAgentStatus(company);
  const lg = size === "lg";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: lg ? "8px 14px" : "5px 10px", borderRadius: 20,
      background: status.human ? T.tealDim : "rgba(255,255,255,0.05)",
      border: `1px solid ${status.human ? T.tealBorder : T.border}`,
      fontSize: lg ? 14 : 12, fontWeight: 600,
      color: status.human ? T.teal : T.muted,
    }}>
      {status.human ? <UserCheck size={lg?15:13} /> : <Bot size={lg?15:13} />}
      {status.label}
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ hourly, compact = false }) {
  const max = Math.max(...hourly);
  const nowH = new Date().getHours();
  const chartH = compact ? 56 : 80;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: compact ? 2 : 3, height: chartH, width: "100%" }}>
        {hourly.map((v,i) => {
          const h = max > 0 ? Math.round((v/max)*(chartH-10)) + (v > 0 ? 4 : 0) : 0;
          const color = v === 0 ? "rgba(255,255,255,0.06)" : barColor(v, max);
          return (
            <div key={i} title={`${fmt(i)}: ${v > 0 ? `${v} min` : "Closed/Bot"}`} style={{
              flex: 1, height: Math.max(h, 3), borderRadius: "3px 3px 0 0",
              background: color, opacity: i === nowH ? 1 : 0.7,
              boxShadow: i === nowH ? `0 0 8px ${color}88` : "none",
              transition: "height 0.4s ease",
            }} />
          );
        })}
      </div>
      {/* Y-axis labels */}
      {!compact && max > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4, marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: T.faint }}>{max} min max</span>
        </div>
      )}
    </div>
  );
}

// ─── Live Wait Card (used in leaderboard) ─────────────────────────────────────
function LiveWaitCard({ company, rank, onClick }) {
  const nowH = new Date().getHours();
  const wait = company.hourly[nowH];
  const status = getAgentStatus(company);
  const rankColors = ["#00e5a0", "#f59e0b", "#ef4444"];
  const rankLabels = ["Good time to call", "Moderate wait", "Avoid right now"];

  return (
    <button onClick={onClick} style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 18, padding: "18px 20px", cursor: "pointer",
      fontFamily: "'Syne', sans-serif", textAlign: "left", width: "100%",
      transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 12,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = rankColors[rank]; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${rankColors[rank]}22`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: rankColors[rank], textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {rankLabels[rank]}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: T.text }}>{company.name}</div>
          <div style={{ fontSize: 12, color: T.faint, marginTop: 2 }}>{company.category}</div>
        </div>
        {/* Big wait number */}
        <div style={{ textAlign: "right" }}>
          {wait > 0 && status.human ? (
            <>
              <div style={{ fontSize: 34, fontWeight: 800, color: rankColors[rank], lineHeight: 1 }}>{wait}</div>
              <div style={{ fontSize: 11, color: T.faint }}>min wait</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: T.faint, textAlign: "right" }}>
              {status.human ? "No data" : "Bot only"}
            </div>
          )}
        </div>
      </div>

      {/* Mini chart */}
      <BarChart hourly={company.hourly} compact />

      {/* Bottom row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: status.human ? T.teal : T.faint }}>
          {status.human ? <UserCheck size={11} /> : <Bot size={11} />}
          {status.human ? "Human available" : "Automated only"}
        </div>
        <div style={{ fontSize: 12, color: rankColors[rank], fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
          Tap to call <ArrowRight size={12} />
        </div>
      </div>
    </button>
  );
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
function HowItWorksPanel({ onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: Search, title: "Search any company", body: "Type a company name — Netflix, AT&T, your bank, your airline. DialTrend shows their support line, real wait times by hour, and whether a human is available right now." },
    { icon: Clock, title: "Pick the best time to call", body: "The color-coded chart shows wait times hour by hour. Green = short wait. Red = avoid. Pick a green window and skip the hold music entirely." },
    { icon: Share2, title: "Share after you call", body: "After your call, tap how long you waited. Takes 5 seconds. Completely anonymous. Every report makes the data better for the next person." },
  ];
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 200 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 24, padding: 36, width: "90%", maxWidth: 400, zIndex: 201,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,229,160,0.06)",
        fontFamily: "'Syne', sans-serif",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: T.muted }}>
          <X size={20} />
        </button>
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {steps.map((_,i) => (
            <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? T.teal : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
          ))}
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: T.tealDim, border: `1px solid ${T.tealBorder}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
          <Icon size={24} color={T.teal} />
        </div>
        <h3 style={{ fontSize: 21, fontWeight: 800, color: T.text, marginBottom: 10 }}>{current.title}</h3>
        <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.7, marginBottom: 30 }}>{current.body}</p>
        <div style={{ display: "flex", gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s=>s-1)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.05)", color: T.muted, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Syne', sans-serif" }}>Back</button>
          )}
          <button onClick={() => isLast ? onClose() : setStep(s=>s+1)} style={{ flex: 2, padding: "12px", borderRadius: 12, border: "none", background: T.teal, color: "#0a0a0f", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "'Syne', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {isLast ? "Got it — let's go!" : <>Next <ArrowRight size={14} /></>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── About Modal ─────────────────────────────────────────────────────────────
function AboutModal({ onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 300 }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 24, padding: 36, width: "90%", maxWidth: 440, zIndex: 301,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(0,229,160,0.05)",
        fontFamily: "'Syne', sans-serif", maxHeight: "85vh", overflowY: "auto",
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: T.muted }}>
          <X size={20} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 20 }}>
          {[10,16,22,16,10].map((h,i) => (
            <div key={i} style={{ width: 4, height: h, borderRadius: 2, background: T.teal }} />
          ))}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6 }}>About DialTrend</h2>
        <p style={{ fontSize: 13, color: T.teal, fontWeight: 600, marginBottom: 20 }}>Built by a Deaf founder who got tired of waiting on hold twice.</p>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, marginBottom: 16 }}>
          Every time I called customer support through a relay interpreter, I waited once for the interpreter to connect then again on hold. I built DialTrend so nobody has to call blind again.
        </p>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.75, marginBottom: 24 }}>
          DialTrend shows you the least busy hours to call any major support line, and tells you whether a real human agent is available before you dial. The data starts from GetHuman public community reports and improves with every wait time shared by our users.
        </p>
        <div style={{ background: "rgba(0,229,160,0.06)", border: `1px solid ${T.tealBorder}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.teal, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>How our data works</div>
          {[
            ["Baseline data", "Sourced from GetHuman's public crowdsourced reports. The most established community wait time database."],
            ["Community reports", "Every time a user shares how long they waited, that report refines the hourly estimate for that company."],
            ["Always anonymous", "No account, no tracking. A report is just a number, nothing tied to you personally."],
          ].map(([title, body]) => (
            <div key={title} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 12, color: T.faint, lineHeight: 1.6 }}>{body}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.faint, textAlign: "center", paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
          dialtrend.com · Free forever · Community-powered
        </div>
      </div>
    </>
  );
}

// ─── Hamburger Menu ───────────────────────────────────────────────────────────
function HamburgerMenu({ onClose, onHowItWorks }) {
  const [showAbout, setShowAbout] = useState(false);
  const items = [
    { icon: HelpCircle, label: "How It Works", desc: "See the 3-step walkthrough", action: onHowItWorks },
    { icon: Info, label: "About DialTrend", desc: "Our story & how data is collected", action: () => setShowAbout(true) },
    { icon: MessageSquare, label: "Send Feedback", desc: "Found an error? Have a suggestion?", action: onClose },
    { icon: Shield, label: "Privacy Policy", desc: "No tracking. No accounts. Ever.", action: onClose },
  ];
  return (
    <>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 290, background: T.surface, borderLeft: `1px solid ${T.border}`, zIndex: 201, boxShadow: "-8px 0 40px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", fontFamily: "'Syne', sans-serif", animation: "slideIn 0.25s ease" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={20} /></button>
        </div>
        <div style={{ flex: 1, padding: "10px 0" }}>
          {items.map(({ icon: Icon, label, desc, action }) => (
            <button key={label} onClick={action} style={{ width: "100%", padding: "15px 22px", display: "flex", alignItems: "center", gap: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'Syne', sans-serif", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} color={T.muted} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: T.faint }}>{desc}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ padding: "18px 22px", borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.faint, textAlign: "center" }}>
          Community-powered wait times · Free
        </div>
      </div>
    </>
  );
}

// ─── Contribute Modal ─────────────────────────────────────────────────────────
function ContributeModal({ company, onClose }) {
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const ranges = ["< 5 min", "5–10 min", "10–20 min", "20–30 min", "30+ min"];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: 32, maxWidth: 400, width: "90%", fontFamily: "'Syne', sans-serif", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle size={48} color={T.teal} style={{ margin: "0 auto 16px", display: "block" }} />
            <h3 style={{ color: T.teal, fontSize: 22, marginBottom: 8 }}>Thank you!</h3>
            <p style={{ color: T.muted, fontSize: 15 }}>Your data helps others skip the wait.</p>
          </div>
        ) : (
          <>
            <h3 style={{ color: T.text, fontSize: 19, marginBottom: 6 }}>How long did you wait?</h3>
            <p style={{ color: T.muted, fontSize: 13, marginBottom: 22 }}>{company.name} · Anonymous · 5 seconds</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22 }}>
              {ranges.map(r => (
                <button key={r} onClick={() => setSel(r)} style={{ padding: "12px 16px", borderRadius: 12, border: sel===r ? `2px solid ${T.teal}` : `1px solid ${T.border}`, background: sel===r ? T.tealDim : "rgba(255,255,255,0.03)", color: sel===r ? T.teal : T.text, fontSize: 14, cursor: "pointer", textAlign: "left", fontFamily: "'Syne', sans-serif", transition: "all 0.2s" }}>{r}</button>
              ))}
            </div>
            <button onClick={() => { if (sel) { setDone(true); setTimeout(onClose, 2000); }}} disabled={!sel} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: sel ? T.teal : "rgba(255,255,255,0.08)", color: sel ? "#0a0a0f" : T.faint, fontSize: 15, fontWeight: 800, cursor: sel ? "pointer" : "not-allowed", fontFamily: "'Syne', sans-serif", transition: "all 0.2s" }}>Share & Help Others</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Company Detail ───────────────────────────────────────────────────────────
function CompanyDetail({ company, onBack }) {
  const [modal, setModal] = useState(false);
  const best = getBest(company.hourly);
  const worst = getWorst(company.hourly);
  const nowH = new Date().getHours();
  const nowWait = company.hourly[nowH];
  const max = Math.max(...company.hourly);
  const status = getAgentStatus(company);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Syne', sans-serif", color: T.text, overflowX: "hidden", width: "100%" }}>
      {modal && <ContributeModal company={company} onClose={() => setModal(false)} />}
      <header style={{ background: "rgba(10,10,15,0.92)", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 660, margin: "0 auto", padding: "15px 22px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: T.muted, fontSize: 14, fontFamily: "'Syne', sans-serif" }}>
            <ChevronLeft size={17} /> Back
          </button>
          <Logo />
        </div>
      </header>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "24px 18px 60px" }}>
        {/* Header card */}
        <div style={{ background: T.surface, borderRadius: 18, padding: 22, border: `1px solid ${T.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 7, textTransform: "uppercase" }}>{company.category}</div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: T.text }}>{company.name}</h1>
            </div>
            <AgentBadge company={company} size="lg" />
          </div>
          <div style={{ display: "flex", gap: 16, color: T.muted, fontSize: 13, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={13} color={T.faint} /> {company.phone}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} color={T.faint} /> {company.hours}</span>
          </div>
          {company.botOnly && (
            <div style={{ marginTop: 6, padding: "8px 12px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${T.border}`, fontSize: 12, color: T.faint, display: "flex", alignItems: "center", gap: 7 }}>
              <Bot size={12} color={T.faint} /> {company.botOnly}
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", gap: 5 }}>
            <Users size={11} /> {company.source}
          </div>
        </div>

        {/* Right now */}
        <div style={{ background: T.surface, borderRadius: 18, padding: 22, border: `1px solid ${T.border}`, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: T.faint, marginBottom: 7, textTransform: "uppercase", letterSpacing: 1 }}>Right now</div>
          {nowWait > 0 && status.human ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 50, fontWeight: 800, color: waitColor(nowWait) }}>{nowWait}</span>
                <span style={{ fontSize: 17, color: T.muted }}>min estimated wait</span>
              </div>
              <p style={{ color: T.faint, fontSize: 13, marginTop: 7, display: "flex", alignItems: "center", gap: 5 }}>
                <Users size={13} /> Community data · Updated hourly
              </p>
            </>
          ) : !status.human ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Bot size={26} color={T.faint} />
              <div>
                <p style={{ fontSize: 15, color: T.muted, fontWeight: 600 }}>No human agents right now</p>
                <p style={{ fontSize: 13, color: T.faint, marginTop: 3 }}>Next available: {fmt(company.humanHours.start)} · {company.humanHours.days.includes(1) ? "weekdays" : "check hours above"}</p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: T.faint }}>No wait data for this hour yet</p>
          )}
        </div>

        {/* Chart with Y-axis */}
        <div style={{ background: T.surface, borderRadius: 18, padding: 22, border: `1px solid ${T.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 1 }}>Wait times by hour</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[["#00e5a0","Low"],["#f59e0b","Medium"],["#ef4444","High"],["rgba(255,255,255,0.15)","Bot/Closed"]].map(([c,l]) => (
                <span key={l} style={{ fontSize: 11, color: c, fontWeight: 700 }}>■ {l}</span>
              ))}
            </div>
          </div>
          {/* Y-axis + chart */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            {/* Y-axis labels */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 80, paddingBottom: 4 }}>
              <span style={{ fontSize: 10, color: T.faint, lineHeight: 1 }}>{max}m</span>
              <span style={{ fontSize: 10, color: T.faint, lineHeight: 1 }}>{Math.round(max/2)}m</span>
              <span style={{ fontSize: 10, color: T.faint, lineHeight: 1 }}>0</span>
            </div>
            <div style={{ flex: 1 }}>
              <BarChart hourly={company.hourly} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, paddingLeft: 28 }}>
            {["12AM","6AM","12PM","6PM","11PM"].map(t => (
              <span key={t} style={{ fontSize: 11, color: T.faint }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Best / Worst */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div style={{ background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.18)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: T.teal, marginBottom: 9, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}><CheckCircle size={13} /> Best times</div>
            {best.map(h => <div key={h} style={{ color: T.teal, fontSize: 13, marginBottom: 5, fontWeight: 600, opacity: 0.85 }}>{fmt(h)} — {company.hourly[h]} min</div>)}
          </div>
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 9, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}><AlertCircle size={13} /> Avoid these</div>
            {worst.map(h => <div key={h} style={{ color: "#ef4444", fontSize: 13, marginBottom: 5, fontWeight: 600, opacity: 0.85 }}>{fmt(h)} — {company.hourly[h]} min</div>)}
          </div>
        </div>

        {/* CTAs */}
        <a href={`tel:${company.phone.replace(/[^0-9]/g,"")}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "16px", borderRadius: 13, background: T.teal, color: "#0a0a0f", fontSize: 15, fontWeight: 800, textDecoration: "none", marginBottom: 11, fontFamily: "'Syne', sans-serif", boxSizing: "border-box" }}>
          <Phone size={16} /> Call Now — {company.phone}
        </a>
        <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "13px", borderRadius: 13, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.border}`, color: T.muted, fontSize: 14, cursor: "pointer", fontFamily: "'Syne', sans-serif", marginBottom: 16 }}>
          <Share2 size={14} /> Share your wait time after calling
        </button>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", padding: "11px", background: "rgba(255,255,255,0.02)", borderRadius: 11, border: `1px solid ${T.border}` }}>
          {["Anonymous","No call recording","No personal data"].map(t => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 5, color: T.faint, fontSize: 12 }}><Shield size={12} color={T.faint} /> {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function DialTrendApp() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // ← AUTO-SHOW on first visit: just change false → true
  const [showOnboarding, setShowOnboarding] = useState(true);

  const nowH = new Date().getHours();

  // Compute live leaderboard: companies with human agents + actual wait data, sorted by wait ascending
  const liveRanked = COMPANIES
    .filter(c => {
      const status = getAgentStatus(c);
      return status.human && c.hourly[nowH] > 0;
    })
    .sort((a, b) => a.hourly[nowH] - b.hourly[nowH])
    .slice(0, 3);

  // Fallback: if not enough live companies, fill with lowest-wait regardless
  const leaderboard = liveRanked.length >= 3
    ? liveRanked
    : [...COMPANIES].sort((a, b) => a.hourly[nowH] - b.hourly[nowH]).slice(0, 3);

  const filtered = query.trim()
    ? COMPANIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  if (selected) return <CompanyDetail company={selected} onBack={() => setSelected(null)} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; font-family: 'Plus Jakarta Sans', sans-serif; }
        ::placeholder { color: rgba(255,255,255,0.25); font-family: 'Plus Jakarta Sans', sans-serif; }
        .ct-input:focus { outline: none; border-color: rgba(0,229,160,0.5) !important; box-shadow: 0 0 0 3px rgba(0,229,160,0.08); }
        .ct-row:hover { background: rgba(255,255,255,0.05) !important; }
        .ct-quick:hover { background: rgba(0,229,160,0.12) !important; color: #00e5a0 !important; border-color: rgba(0,229,160,0.35) !important; }
        .ct-card:hover { border-color: rgba(0,229,160,0.3) !important; transform: translateY(-2px); }
        .ct-menu:hover { background: rgba(255,255,255,0.06) !important; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .fu1 { animation: fadeUp 0.5s ease both; }
        .fu2 { animation: fadeUp 0.5s 0.1s ease both; }
        .fu3 { animation: fadeUp 0.5s 0.2s ease both; }
        .fu4 { animation: fadeUp 0.5s 0.3s ease both; }
        .fu5 { animation: fadeUp 0.5s 0.4s ease both; }
        .live-dot { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.body, color: T.text }}>
        {menuOpen && <HamburgerMenu onClose={() => setMenuOpen(false)} onHowItWorks={() => { setMenuOpen(false); setShowOnboarding(true); }} />}
        {showOnboarding && <HowItWorksPanel onClose={() => setShowOnboarding(false)} />}

        {/* Header */}
        <header style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(10,10,15,0.92)", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)", padding: "15px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShowOnboarding(true)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 13, fontWeight: 600, fontFamily: "'Syne', sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
              <HelpCircle size={15} /> How it works
            </button>
            <button onClick={() => setMenuOpen(true)} className="ct-menu" style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 9px", cursor: "pointer", display: "flex", alignItems: "center", color: T.muted, transition: "background 0.15s" }}>
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Hero — compact, action-focused */}
        <section style={{ textAlign: "center", padding: "52px 20px 36px", background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,229,160,0.07) 0%, transparent 70%)" }}>
          <h1 className="fu1" style={{ fontSize: "clamp(36px, 5.5vw, 62px)", fontWeight: 800, lineHeight: 1.1, maxWidth: 560, margin: "0 auto 16px", letterSpacing: "-1.5px", color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Before you call,{" "}
            <span style={{ background: "linear-gradient(90deg, #00e5a0, #00c4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              find a real person.
            </span>
          </h1>
          <p className="fu2" style={{ fontSize: 17, color: T.muted, maxWidth: 380, margin: "0 auto 32px", lineHeight: 1.7, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}>
            See when hold times are shortest — and skip the bot.
          </p>

          {/* Search */}
          <div className="fu3" style={{ maxWidth: 480, margin: "0 auto", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <Search size={17} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
              <input className="ct-input" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Who are you trying to call? Netflix, AT&T, Delta..."
                style={{ width: "100%", padding: "14px 20px 14px 44px", fontSize: 15, borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontFamily: T.body, transition: "all 0.2s" }} />
            </div>
            {filtered.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", zIndex: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                {filtered.map(c => {
                  const status = getAgentStatus(c);
                  const nowMin = c.hourly[nowH];
                  return (
                    <div key={c.id} className="ct-row" onClick={() => { setSelected(c); setQuery(""); }}
                      style={{ padding: "13px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, background: "transparent", transition: "background 0.15s" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: T.faint }}>{c.category}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <AgentBadge company={c} />
                        {status.human && nowMin > 0 && <div style={{ fontSize: 12, color: T.teal, fontWeight: 700 }}>{nowMin} min now</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick buttons */}
          <div className="fu4" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 9, marginTop: 12 }}>
            {QUICK.map(name => {
              const c = COMPANIES.find(x => x.name === name);
              return (
                <button key={name} className="ct-quick" onClick={() => setSelected(c)} style={{ padding: "7px 15px", borderRadius: 30, border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.04)", color: T.muted, fontSize: 13, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600, transition: "all 0.2s" }}>{name}</button>
              );
            })}
          </div>
        </section>

        {/* ★ LIVE LEADERBOARD — the new hook ★ */}
        <section style={{ padding: "40px 20px 48px", borderTop: `1px solid ${T.border}`, background: "rgba(0,229,160,0.02)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {/* Section header with live indicator */}
            <div className="fu5" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24 }}>
              <div className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: T.teal }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.teal, textTransform: "uppercase", letterSpacing: 2, fontFamily: T.body }}>Who to call right now · {fmt(nowH)}</span>
            </div>

            {/* Three ranked cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {leaderboard.map((company, i) => (
                <LiveWaitCard key={company.id} company={company} rank={i} onClick={() => setSelected(company)} />
              ))}
            </div>

            <p style={{ textAlign: "center", fontSize: 13, color: T.faint, marginTop: 16, fontFamily: T.body }}>
              Tap any card to see the full day's chart and call button
            </p>
          </div>
        </section>

        {/* Marquee */}
        <div style={{ overflow: "hidden", padding: "13px 0", background: T.surface, borderBottom: `1px solid ${T.border}`, borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", gap: 48, animation: "marquee 32s linear infinite", width: "max-content" }}>
            {[...COMPANIES, ...COMPANIES].map((c,i) => (
              <span key={i} style={{ color: T.faint, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: 2 }}>{c.name.toUpperCase()}</span>
            ))}
          </div>
        </div>

        {/* Browse all */}
        <section style={{ padding: "40px 20px 56px", background: T.surface, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 }}>Browse all 20 companies</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 9, maxWidth: 680, margin: "0 auto 12px" }}>
            {COMPANIES.map(c => {
              const status = getAgentStatus(c);
              return (
                <button key={c.id} className="ct-card" onClick={() => setSelected(c)} style={{ padding: "9px 16px", borderRadius: 11, border: `1px solid ${T.border}`, background: "rgba(255,255,255,0.03)", color: T.muted, fontSize: 13, cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600, transition: "all 0.25s", display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.human ? T.teal : "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                  {c.name}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: T.faint }}>Green dot = human agents available right now</p>
        </section>

        {/* Footer */}
        <footer style={{ padding: "22px 20px", textAlign: "center", borderTop: `1px solid ${T.border}`, background: T.bg, color: T.faint, fontSize: 13 }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}><Logo /></div>
          <div style={{ display: "flex", justifyContent: "center", gap: 22, marginBottom: 10 }}>
            {["About","Privacy","Contact"].map(l => <a key={l} href="#" style={{ color: T.faint, textDecoration: "none" }}>{l}</a>)}
          </div>
          <p>© 2026 DialTrend · Community-powered</p>
        </footer>
      </div>
    </>
  );
}