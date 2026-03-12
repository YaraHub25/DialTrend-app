/**
 * DialTrendMotion.jsx
 *
 * Framer Motion layer for DialTrend.
 * Covers:
 *   1. useWaitTimeAnimation  — the decision hook (when to animate)
 *   2. pulseVariants          — the config object (how it looks)
 *   3. FlowPulseSVG           — motion.svg component replacing canvas FlowPulse
 *   4. AnimatedBanner         — recommendation banner with spring color shift
 *   5. AnimatedCard           — staggered entrance wrapper for detail page cards
 *   6. AnimatedWaitNumber     — spring count-up replacing useEffect manual loop
 *   7. Demo page              — shows all of these working together
 *
 * SignalWaveform and SolarSweep stay in DialTrendAnimations.jsx (canvas).
 * Import from both files as needed.
 */

import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Clock, UserCheck, Bot } from "lucide-react";

// ─── Install note ─────────────────────────────────────────────────────────────
// npm install framer-motion
// That's the only dependency. No other setup needed.

// ─── Theme (matches App.jsx) ──────────────────────────────────────────────────
const T = {
  bg: "#0a0a0f", surface: "#13131a", border: "rgba(255,255,255,0.08)",
  teal: "#00e5a0", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", muted: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.22)",
  brand: "'Syne', sans-serif", body: "'Plus Jakarta Sans', sans-serif",
};

// ═════════════════════════════════════════════════════════════════════════════
// 1. THE DECISION HOOK — "when to animate"
//    Drop this in any component. Pass in waitTime, get back a status string.
//    This is the single source of truth for all animation states.
// ═════════════════════════════════════════════════════════════════════════════
export function useWaitTimeAnimation(waitTime, isHuman = true) {
  if (!isHuman) return "closed";
  if (waitTime === 0) return "closed";
  if (waitTime > 25) return "critical";
  if (waitTime > 12) return "warning";
  return "stable";
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. VARIANTS CONFIG — "how it looks"
//    One object, all states. Change values here and every component updates.
//    This is the "separate config file" pattern your advisor recommended.
// ═════════════════════════════════════════════════════════════════════════════
export const pulseVariants = {
  // The ring rotation — speed changes by state
  ring: {
    stable:   { rotate: 360, transition: { duration: 8,  repeat: Infinity, ease: "linear" } },
    warning:  { rotate: 360, transition: { duration: 3,  repeat: Infinity, ease: "linear" } },
    critical: { rotate: 360, transition: { duration: 0.9,repeat: Infinity, ease: "linear" } },
    closed:   { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: "linear" } },
  },
  // The glow color behind the ring
  glow: {
    stable:   { opacity: 0.15, scale: 1 },
    warning:  { opacity: [0.15, 0.35, 0.15], scale: [1, 1.08, 1],
                transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } },
    critical: { opacity: [0.2, 0.5, 0.2],   scale: [1, 1.14, 1],
                transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" } },
    closed:   { opacity: 0.06, scale: 1 },
  },
  // The center dot
  dot: {
    stable:   { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
    warning:  { scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5],
                transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } },
    critical: { scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4],
                transition: { duration: 0.55,repeat: Infinity, ease: "easeInOut" } },
    closed:   { scale: 1, opacity: 0.2 },
  },
  // Color map (used inline — Framer Motion can't animate CSS color via variants alone)
  colors: {
    stable:   T.teal,
    warning:  T.amber,
    critical: T.red,
    closed:   "rgba(255,255,255,0.2)",
  },
};

// Banner background/border colors
export const bannerVariants = {
  stable:   { background: "rgba(0,229,160,0.08)",  borderColor: "rgba(0,229,160,0.25)" },
  warning:  { background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" },
  critical: { background: "rgba(239,68,68,0.08)",  borderColor: "rgba(239,68,68,0.25)" },
  closed:   { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.1)" },
};

// ═════════════════════════════════════════════════════════════════════════════
// 3. FLOWPULSE SVG — Framer Motion version
//    Props: waitTime (number), size (px)
//    The status is computed internally from waitTime via the hook.
// ═════════════════════════════════════════════════════════════════════════════
export function FlowPulseSVG({ waitTime = 12, isHuman = true, size = 48 }) {
  const status = useWaitTimeAnimation(waitTime, isHuman);
  const color = pulseVariants.colors[status];
  const cx = size / 2;
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;

  // Four arc segments: each is a fraction of the full circumference
  const segments = [
    { offset: 0,                       length: circumference * 0.22 },
    { offset: circumference * 0.27,    length: circumference * 0.18 },
    { offset: circumference * 0.52,    length: circumference * 0.25 },
    { offset: circumference * 0.83,    length: circumference * 0.14 },
  ];

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Glow layer behind the SVG */}
      <motion.div
        animate={pulseVariants.glow[status]}
        style={{
          position: "absolute", inset: -4, borderRadius: "50%",
          background: color, filter: "blur(8px)",
        }}
      />

      {/* Rotating SVG ring */}
      <motion.svg
        width={size} height={size}
        animate={pulseVariants.ring[status]}
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Background circle — very faint */}
        <circle cx={cx} cy={cx} r={r} fill="none"
          stroke="rgba(255,255,255,0.05)" strokeWidth={1.5} />

        {/* Four arc segments */}
        {segments.map((seg, i) => (
          <circle key={i}
            cx={cx} cy={cx} r={r}
            fill="none"
            stroke={color}
            strokeWidth={i === 0 ? 2 : 1.5}
            strokeDasharray={`${seg.length} ${circumference - seg.length}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
            opacity={i === 0 ? 0.9 : 0.45 + i * 0.1}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        ))}
      </motion.svg>

      {/* Center dot */}
      <motion.div
        animate={pulseVariants.dot[status]}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: 5, height: 5,
          borderRadius: "50%",
          background: color,
          transform: "translate(-50%, -50%)",
          zIndex: 2,
        }}
      />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. ANIMATED BANNER — recommendation banner with spring color transition
//    Replaces the static colored div in CompanyDetail.
//    Pass status string, icon, and message — it handles the rest.
// ═════════════════════════════════════════════════════════════════════════════
export function AnimatedBanner({ status = "stable", icon, message }) {
  const variant = bannerVariants[status] || bannerVariants.stable;
  const color = pulseVariants.colors[status];

  return (
    <motion.div
      animate={variant}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        borderRadius: 16, padding: "14px 18px", marginBottom: 12,
        display: "flex", alignItems: "center", gap: 12,
        border: "1px solid",
        fontFamily: T.body,
      }}
      // Entrance animation — slides up and fades in
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <FlowPulseSVG waitTime={
        status === "critical" ? 30 : status === "warning" ? 18 : status === "closed" ? 0 : 6
      } size={36} />
      <p style={{ fontSize: 15, color, fontWeight: 600, lineHeight: 1.4 }}>
        {message}
      </p>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. ANIMATED CARD — staggered entrance wrapper
//    Wrap any card in <AnimatedCard delay={0.1}> to get spring entrance.
//    Used in CompanyDetail to replace the manual CSS animation classes.
// ═════════════════════════════════════════════════════════════════════════════
export function AnimatedCard({ children, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 260,   // higher = snappier
        damping: 22,      // higher = less bounce
      }}
      whileHover={{ y: -2, transition: { type: "spring", stiffness: 400, damping: 20 } }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. ANIMATED WAIT NUMBER — spring count-up
//    Replaces the manual useEffect interval counter in CompanyDetail.
//    Framer Motion handles the interpolation internally.
// ═════════════════════════════════════════════════════════════════════════════
export function AnimatedWaitNumber({ value, color }) {
  // useSpring gives us a smoothly interpolating number value
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  // useTransform rounds it for display
  const display = useTransform(spring, v => Math.round(v));
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => { spring.set(value); }, [value]);
  useEffect(() => display.on("change", v => setDisplayVal(v)), [display]);

  return (
    <span style={{
      fontSize: 64, fontWeight: 800, color,
      fontFamily: T.brand, lineHeight: 1,
      textShadow: `0 0 40px ${color}44`,
    }}>
      {displayVal}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. DEMO PAGE — shows all components working together interactively
// ═════════════════════════════════════════════════════════════════════════════
export default function DialTrendMotionDemo() {
  const [waitTime, setWaitTime] = useState(12);
  const status = useWaitTimeAnimation(waitTime, waitTime > 0);

  const getMsg = () => {
    if (waitTime === 0) return "No human agents right now. Try at 8AM.";
    if (waitTime > 25) return `Long wait. Try calling at 9PM instead.`;
    if (waitTime > 12) return `Moderate wait. If it's urgent, go ahead.`;
    return `Good time to call — short wait right now.`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #00e5a0; cursor: pointer; }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.body, color: T.text, padding: "32px 20px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              {[10,16,22,16,10].map((h,i) => (
                <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: T.teal }} />
              ))}
              <span style={{ fontSize: 20, fontWeight: 800, fontFamily: T.brand }}>DialTrend</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, fontFamily: T.brand, letterSpacing: "-0.5px", marginBottom: 8 }}>
              Framer Motion Layer
            </h1>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7 }}>
              Drag the slider to change wait time. Every component reacts automatically
              through the <code style={{ color: T.teal, fontSize: 13 }}>useWaitTimeAnimation</code> hook —
              no manual color or speed updates needed.
            </p>
          </div>

          {/* LIVE CONTROL */}
          <AnimatedCard delay={0}>
            <div style={{ background: T.surface, borderRadius: 16, padding: 22, border: `1px solid ${T.border}`, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>Simulated wait time</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <AnimatedWaitNumber value={waitTime} color={pulseVariants.colors[status]} />
                  <span style={{ fontSize: 16, color: T.muted }}>min</span>
                </div>
              </div>
              <input
                type="range" min={0} max={40} value={waitTime}
                onChange={e => setWaitTime(Number(e.target.value))}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {[
                  { label: "Closed", val: 0 },
                  { label: "Stable", val: 6 },
                  { label: "Warning", val: 18 },
                  { label: "Critical", val: 32 },
                ].map(({ label, val }) => (
                  <button key={label} onClick={() => setWaitTime(val)} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 11, color: waitTime === val ? T.teal : T.faint,
                    fontFamily: T.body, fontWeight: 600,
                    transition: "color 0.2s",
                  }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* STATUS — auto-updates from hook */}
          <AnimatedCard delay={0.06}>
            <div style={{ background: T.surface, borderRadius: 16, padding: "14px 18px", border: `1px solid ${T.border}`, marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 1, width: 90, flexShrink: 0 }}>Status from hook</div>
              <motion.div
                key={status}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ fontSize: 13, fontWeight: 700, color: pulseVariants.colors[status], fontFamily: T.brand, letterSpacing: 1, textTransform: "uppercase" }}
              >
                {status}
              </motion.div>
              <div style={{ fontSize: 11, color: T.faint, marginLeft: "auto" }}>
                ← useWaitTimeAnimation({waitTime})
              </div>
            </div>
          </AnimatedCard>

          {/* FLOWPULSE — reacts live */}
          <AnimatedCard delay={0.1}>
            <div style={{ background: T.surface, borderRadius: 16, padding: 22, border: `1px solid ${T.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                FlowPulseSVG — all four states
              </div>
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                {/* Live reactive one */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <FlowPulseSVG waitTime={waitTime} isHuman={waitTime > 0} size={52} />
                  <span style={{ fontSize: 11, color: T.teal, fontWeight: 700 }}>LIVE</span>
                </div>
                <div style={{ width: 1, height: 52, background: T.border }} />
                {/* Static previews */}
                {[
                  { wait: 5,  label: "stable" },
                  { wait: 18, label: "warning" },
                  { wait: 35, label: "critical" },
                  { wait: 0,  label: "closed" },
                ].map(({ wait, label }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <FlowPulseSVG waitTime={wait} isHuman={wait > 0} size={40} />
                    <span style={{ fontSize: 10, color: T.faint }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* ANIMATED BANNER — updates automatically */}
          <AnimatedCard delay={0.14}>
            <AnimatedBanner status={status} message={getMsg()} />
          </AnimatedCard>

          {/* ARCHITECTURE EXPLAINER */}
          <AnimatedCard delay={0.18}>
            <div style={{ background: T.surface, borderRadius: 16, padding: 22, border: `1px solid ${T.border}`, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14, fontFamily: T.brand }}>
                How to drop this into App.jsx
              </div>
              <div style={{ background: "#0d1117", borderRadius: 10, padding: "14px 16px", fontFamily: "monospace", fontSize: 12, lineHeight: 1.9, color: "rgba(255,255,255,0.5)", overflowX: "auto" }}>
                <div><span style={{ color: "#7ee787" }}>import</span> <span style={{ color: T.text }}>{"{ FlowPulseSVG, AnimatedBanner, AnimatedCard,"}</span></div>
                <div><span style={{ color: T.text }}>{"  AnimatedWaitNumber, useWaitTimeAnimation }"}</span></div>
                <div><span style={{ color: "#7ee787" }}>from</span> <span style={{ color: "#f59e0b" }}>'./DialTrendMotion'</span>;</div>
                <br />
                <div><span style={{ color: "rgba(255,255,255,0.25)" }}>// In CompanyDetail, replace the old card divs:</span></div>
                <div>{"<"}<span style={{ color: T.teal }}>AnimatedCard</span> <span style={{ color: "#79c0ff" }}>delay</span>={"{0.15}"}{">"}</div>
                <div style={{ paddingLeft: 16 }}>{"<"}<span style={{ color: T.teal }}>AnimatedBanner</span> <span style={{ color: "#79c0ff" }}>status</span>={"{status}"} <span style={{ color: "#79c0ff" }}>message</span>={"{rec.msg}"} {"/>"}</div>
                <div>{"</"}<span style={{ color: T.teal }}>AnimatedCard</span>{">"}</div>
                <br />
                <div><span style={{ color: "rgba(255,255,255,0.25)" }}>// Replace the count-up number:</span></div>
                <div>{"<"}<span style={{ color: T.teal }}>AnimatedWaitNumber</span> <span style={{ color: "#79c0ff" }}>value</span>={"{nowWait}"} <span style={{ color: "#79c0ff" }}>color</span>={"{waitColor(nowWait)}"} {"/>"}</div>
              </div>
            </div>
          </AnimatedCard>

          {/* WHEN TO USE WHAT */}
          <AnimatedCard delay={0.22}>
            <div style={{ background: T.surface, borderRadius: 16, padding: 22, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14, fontFamily: T.brand }}>
                Framer Motion vs Canvas — when to use which
              </div>
              {[
                { tool: "Framer Motion", use: "State-driven UI transitions, spring entrances, color shifts, badge/label changes", good: true },
                { tool: "Canvas (keep)", use: "SignalWaveform, SolarSweep — 60fps continuous frame loops on pixel data", good: true },
                { tool: "Framer Motion ✗", use: "Do NOT use for waveforms or particle effects — library overhead kills framerate", good: false },
              ].map(({ tool, use, good }) => (
                <div key={tool} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: good ? T.teal : T.red, flexShrink: 0, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: good ? T.text : T.muted, marginBottom: 2 }}>{tool}</div>
                    <div style={{ fontSize: 12, color: T.faint, lineHeight: 1.6 }}>{use}</div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>

        </div>
      </div>
    </>
  );
}