import { useState, useEffect, useRef } from "react";

const T = {
  bg: "#0a0a0f", surface: "#13131a", border: "rgba(255,255,255,0.08)",
  teal: "#00e5a0", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", muted: "rgba(255,255,255,0.45)", faint: "rgba(255,255,255,0.15)",
  brand: "'Syne', sans-serif", body: "'Plus Jakarta Sans', sans-serif",
};

// ─── 1. FLOW PULSE — replaces ⏳ (moderate wait) ─────────────────────────────
// Four arc segments rotating at varying speeds with amber glow on moderate
export function FlowPulse({ state = "moderate", size = 52 }) {
  const canvasRef = useRef(null);
  const frame = useRef(0);
  const raf = useRef(null);

  const colors = { good: T.teal, moderate: T.amber, critical: T.red, closed: "rgba(255,255,255,0.2)" };
  const color = colors[state] || T.amber;

  const speeds = state === "critical"
    ? [0.04, 0.07, 0.035, 0.055]
    : state === "closed"
    ? [0.004, 0.003, 0.005, 0.003]
    : [0.018, 0.03, 0.014, 0.022];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = size / 2 - 4;
    const offsets = [0, Math.PI * 0.55, Math.PI, Math.PI * 1.55];
    const arcLen = Math.PI * 0.4;
    let angles = [...offsets];

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      frame.current++;

      // Outer glow ring
      const glowAlpha = state === "closed" ? 0.04 : 0.06 + 0.03 * Math.sin(frame.current * 0.04);
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = glowAlpha;
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Four rotating arc segments
      angles = angles.map((a, i) => a + speeds[i]);
      angles.forEach((a, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, a, a + arcLen);
        const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
        grad.addColorStop(0, color + "33");
        grad.addColorStop(1, color);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.globalAlpha = state === "closed" ? 0.3 : 0.7 + 0.3 * Math.sin(frame.current * 0.06 + i);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Leading dot
        const dotX = cx + r * Math.cos(a + arcLen);
        const dotY = cy + r * Math.sin(a + arcLen);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = state === "closed" ? 0.3 : 1;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Center value dot
      const pulse = state === "closed" ? 0 : 0.4 + 0.6 * Math.abs(Math.sin(frame.current * 0.05));
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = pulse;
      ctx.fill();
      ctx.globalAlpha = 1;

      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [state, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />;
}

// ─── 2. SOLAR SWEEP — replaces 🕐 (closed / upcoming) ───────────────────────
// Horizon line with glowing sweep point; night=dim, dawn=green glow rising
export function SolarSweep({ openHour = 8, currentHour = 6, isOpen = false, width = 200, height = 52 }) {
  const canvasRef = useRef(null);
  const frame = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const horizonY = height * 0.62;
    // How close to open: -1 = far before, 0 = just about to open, 1 = open
    const hoursUntil = openHour - currentHour;
    const proximity = isOpen ? 1 : Math.max(0, 1 - hoursUntil / 4); // glows within 4hrs

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame.current++;

      const t = frame.current * 0.012;

      // Sky gradient — shifts from near-black to deep teal as open approaches
      const skyAlpha = isOpen ? 0.18 : proximity * 0.1;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, `rgba(0,0,0,0)`);
      skyGrad.addColorStop(1, `rgba(0,229,160,${skyAlpha})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Horizon line
      const horizGrad = ctx.createLinearGradient(0, 0, width, 0);
      if (isOpen) {
        horizGrad.addColorStop(0, "rgba(0,229,160,0)");
        horizGrad.addColorStop(0.3, T.teal);
        horizGrad.addColorStop(0.7, T.teal);
        horizGrad.addColorStop(1, "rgba(0,229,160,0)");
      } else {
        const gStart = Math.max(0, 0.5 - proximity * 0.5);
        horizGrad.addColorStop(0, "rgba(255,255,255,0.06)");
        horizGrad.addColorStop(gStart, "rgba(255,255,255,0.06)");
        horizGrad.addColorStop(Math.min(1, gStart + 0.3), `rgba(0,229,160,${proximity * 0.8})`);
        horizGrad.addColorStop(1, "rgba(255,255,255,0.06)");
      }
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.strokeStyle = horizGrad;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sun position
      const sunProgress = isOpen
        ? 0.3 + 0.5 * Math.abs(Math.sin(t * 0.3)) // drifts when open
        : Math.max(0.05, proximity * 0.45);          // rises as open approaches
      const sunX = width * sunProgress;
      const sunY = isOpen
        ? horizonY - 10 - 6 * Math.abs(Math.sin(t * 0.4))
        : horizonY + 8 - proximity * 18;             // rises above horizon

      // Sun glow halo
      const haloR = isOpen ? 14 + 4 * Math.sin(t) : 8 + proximity * 6;
      const haloAlpha = isOpen ? 0.15 + 0.05 * Math.sin(t) : proximity * 0.12;
      const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, haloR * 2);
      halo.addColorStop(0, `rgba(0,229,160,${haloAlpha * 3})`);
      halo.addColorStop(1, "rgba(0,229,160,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      // Sun core
      ctx.beginPath();
      ctx.arc(sunX, sunY, isOpen ? 3.5 : 2 + proximity * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = isOpen ? T.teal : `rgba(0,229,160,${0.2 + proximity * 0.8})`;
      ctx.shadowColor = T.teal;
      ctx.shadowBlur = isOpen ? 12 : proximity * 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Reflection on horizon
      if (isOpen || proximity > 0.3) {
        const reflectAlpha = isOpen ? 0.4 : proximity * 0.35;
        const reflectGrad = ctx.createLinearGradient(sunX - 30, 0, sunX + 30, 0);
        reflectGrad.addColorStop(0, "rgba(0,229,160,0)");
        reflectGrad.addColorStop(0.5, `rgba(0,229,160,${reflectAlpha})`);
        reflectGrad.addColorStop(1, "rgba(0,229,160,0)");
        ctx.beginPath();
        ctx.moveTo(sunX - 30, horizonY);
        ctx.lineTo(sunX + 30, horizonY);
        ctx.strokeStyle = reflectGrad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Status text
      ctx.font = `600 10px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = isOpen ? T.teal : `rgba(255,255,255,${0.2 + proximity * 0.4})`;
      ctx.textAlign = "right";
      ctx.fillText(isOpen ? "OPEN NOW" : `OPENS ${openHour > 12 ? openHour - 12 + "PM" : openHour + "AM"}`, width - 4, height - 4);

      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [openHour, currentHour, isOpen, width, height]);

  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
}

// ─── 3. SIGNAL WAVEFORM — replaces Bot icon ──────────────────────────────────
// Pixelated square waveform: flat hum = bot, energetic = human
export function SignalWaveform({ isHuman = false, width = 120, height = 32 }) {
  const canvasRef = useRef(null);
  const frame = useRef(0);
  const raf = useRef(null);
  const noiseRef = useRef(Array.from({ length: 40 }, () => Math.random()));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const cols = 40;
    const colW = width / cols;
    const midY = height / 2;
    const color = isHuman ? T.teal : "rgba(255,255,255,0.2)";
    const maxAmp = isHuman ? height * 0.44 : height * 0.08;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame.current++;

      // Slowly evolve noise
      if (frame.current % (isHuman ? 3 : 12) === 0) {
        const i = Math.floor(Math.random() * cols);
        noiseRef.current[i] = Math.random();
      }

      // Draw square pixel bars (matching DialTrend bar chart style)
      noiseRef.current.forEach((n, i) => {
        const t = frame.current * (isHuman ? 0.04 : 0.008);
        const wave = isHuman
          ? Math.sin(t + i * 0.4) * 0.5 + Math.sin(t * 1.7 + i * 0.25) * 0.3 + (n - 0.5) * 0.4
          : Math.sin(t * 0.5 + i * 0.8) * 0.15 + (n - 0.5) * 0.08;

        const amp = Math.abs(wave) * maxAmp;
        const x = i * colW;
        const barH = Math.max(1.5, amp);

        // Upper bar
        ctx.fillStyle = color;
        ctx.globalAlpha = isHuman ? 0.5 + Math.abs(wave) * 0.5 : 0.35;
        ctx.fillRect(Math.round(x), Math.round(midY - barH), Math.max(1, colW - 1), Math.round(barH));

        // Lower mirror
        ctx.fillRect(Math.round(x), Math.round(midY), Math.max(1, colW - 1), Math.round(barH));
        ctx.globalAlpha = 1;
      });

      // Center line
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.strokeStyle = isHuman ? `rgba(0,229,160,0.25)` : "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Scan line — only when human
      if (isHuman) {
        const scanX = ((frame.current * 1.4) % width);
        const scanGrad = ctx.createLinearGradient(scanX - 16, 0, scanX + 4, 0);
        scanGrad.addColorStop(0, "rgba(0,229,160,0)");
        scanGrad.addColorStop(1, "rgba(0,229,160,0.18)");
        ctx.fillStyle = scanGrad;
        ctx.fillRect(scanX - 16, 0, 20, height);
      }

      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [isHuman, width, height]);

  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
}

// ─── Demo showcase ────────────────────────────────────────────────────────────
export default function DialTrendAnimationsDemo() {
  const [pulseState, setPulseState] = useState("moderate");
  const [solarOpen, setSolarOpen] = useState(false);
  const [waveHuman, setWaveHuman] = useState(true);
  const [hoveredBar, setHoveredBar] = useState(null);

  const hourlyDemo = [0,0,0,0,0,0,0,0,12,16,20,24,26,22,18,15,13,16,19,16,12,10,0,0];
  const nowH = new Date().getHours();
  const max = Math.max(...hourlyDemo);

  function barColor(v) {
    const r = v / max;
    if (r < 0.4) return T.teal;
    if (r < 0.7) return T.amber;
    return T.red;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .panel { background: #13131a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 24px; }
        .tag { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 8px; border-radius: 20px; border: 1px solid currentColor; }
        .ctrl { cursor: pointer; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 6px 12px; color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
        .ctrl:hover { background: rgba(0,229,160,0.1); border-color: rgba(0,229,160,0.3); color: #00e5a0; }
        .ctrl.active { background: rgba(0,229,160,0.12); border-color: rgba(0,229,160,0.4); color: #00e5a0; }
        .bar-hover:hover { opacity: 1 !important; transform: scaleY(1.08); }
      `}</style>

      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.body, color: T.text, padding: "32px 20px" }}>

        {/* Header */}
        <div style={{ maxWidth: 760, margin: "0 auto 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {[10,16,22,16,10].map((h,i) => (
                <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: T.teal }} />
              ))}
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: T.brand }}>DialTrend</span>
            <span style={{ fontSize: 11, color: T.faint, marginLeft: 4 }}>B2B Component Library</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: T.brand, letterSpacing: "-1px", marginBottom: 8 }}>
            Functional Micro-interactions
          </h1>
          <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.6 }}>
            Three canvas-rendered animations replacing static icons for CX ops dashboards.
            All components are drop-in React exports.
          </p>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── Component 1: Flow Pulse ── */}
          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: T.amber, fontFamily: T.brand, fontSize: 13, fontWeight: 700 }}>01</span>
                  <h2 style={{ fontSize: 16, fontWeight: 800, fontFamily: T.brand }}>Flow Pulse</h2>
                  <span className="tag" style={{ color: T.amber, fontSize: 9 }}>Replaces ⏳</span>
                </div>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, maxWidth: 420 }}>
                  Four arc segments rotate at varying speeds. State changes shift both color and velocity — critical state accelerates to signal urgency.
                </p>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["good","moderate","critical","closed"].map(s => (
                  <button key={s} className={`ctrl ${pulseState === s ? "active" : ""}`} onClick={() => setPulseState(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Live demo — show all four states */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { state: "good", label: "Short wait", sub: "2–8 min", color: T.teal },
                { state: "moderate", label: "Moderate", sub: "10–20 min", color: T.amber },
                { state: "critical", label: "Long wait", sub: "20+ min", color: T.red },
                { state: "closed", label: "Bot / Closed", sub: "No agents", color: T.faint },
              ].map(({ state, label, sub, color }) => (
                <div key={state} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 12px",
                  border: `1px solid ${pulseState === state ? color + "44" : "rgba(255,255,255,0.06)"}`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  transition: "border-color 0.3s",
                }}>
                  <FlowPulse state={state} size={48} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color }}>{label}</div>
                    <div style={{ fontSize: 11, color: T.faint, marginTop: 2 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hover-accelerate demo callout */}
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 12, color: "rgba(239,68,68,0.8)" }}>
              <strong>Hover interaction:</strong> When a CX analyst hovers a "High" bar in the chart, the corresponding Flow Pulse for that company accelerates to critical speed — connecting the chart to the system status.
            </div>
          </div>

          {/* ── Component 2: Solar Sweep ── */}
          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: T.teal, fontFamily: T.brand, fontSize: 13, fontWeight: 700 }}>02</span>
                  <h2 style={{ fontSize: 16, fontWeight: 800, fontFamily: T.brand }}>Solar Sweep</h2>
                  <span className="tag" style={{ color: T.teal, fontSize: 9 }}>Replaces 🕐</span>
                </div>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, maxWidth: 420 }}>
                  Horizon line with a glowing point. The glow intensifies as opening hour approaches. Immediately glanceable across multiple time zones.
                </p>
              </div>
              <button
                className={`ctrl ${solarOpen ? "active" : ""}`}
                onClick={() => setSolarOpen(s => !s)}
              >
                {solarOpen ? "Now open" : "Toggle open"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "4 hrs until open", openHour: 8, currentHour: 4, isOpen: false },
                { label: "30 min until open", openHour: 8, currentHour: 7.5, isOpen: false },
                { label: solarOpen ? "Open now" : "Just opened", openHour: 8, currentHour: 8, isOpen: solarOpen },
              ].map(({ label, openHour, currentHour, isOpen }, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 12px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <SolarSweep openHour={openHour} currentHour={currentHour} isOpen={i === 2 ? solarOpen : isOpen} width={160} height={48} />
                  <div style={{ fontSize: 11, color: T.faint, marginTop: 8, textAlign: "center" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Component 3: Signal Waveform ── */}
          <div className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: T.teal, fontFamily: T.brand, fontSize: 13, fontWeight: 700 }}>03</span>
                  <h2 style={{ fontSize: 16, fontWeight: 800, fontFamily: T.brand }}>Signal Waveform</h2>
                  <span className="tag" style={{ color: T.teal, fontSize: 9 }}>Replaces Bot icon</span>
                </div>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6, maxWidth: 420 }}>
                  Square-pixel waveform in DialTrend's bar chart style. Flat hum = bot only. Energetic with scan line = human agent live.
                </p>
              </div>
              <button className={`ctrl ${waveHuman ? "active" : ""}`} onClick={() => setWaveHuman(s => !s)}>
                {waveHuman ? "Human active" : "Bot only"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { isHuman: false, label: "Bot / No agents", sub: "Flat signal — automated only" },
                { isHuman: true, label: "Human agent live", sub: "Active signal — real person available" },
              ].map(({ isHuman, label, sub }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px",
                  border: `1px solid ${isHuman ? "rgba(0,229,160,0.15)" : "rgba(255,255,255,0.06)"}`,
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isHuman ? T.teal : T.faint }}>{label}</div>
                    {isHuman && (
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal, boxShadow: "0 0 6px #00e5a0" }} />
                    )}
                  </div>
                  <SignalWaveform isHuman={isHuman} width={200} height={36} />
                  <div style={{ fontSize: 11, color: T.faint }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── In-context: recommendation banner using these components ── */}
          <div className="panel" style={{ border: "1px solid rgba(0,229,160,0.15)" }}>
            <div style={{ fontSize: 11, color: T.teal, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 16 }}>
              In-context preview — Company status row
            </div>

            {/* Simulated company row like B2B dashboard would show */}
            {[
              { name: "AT&T", wait: 28, state: "critical", isHuman: true, openH: 8, curH: 10, isOpen: true },
              { name: "T-Mobile", wait: 12, state: "moderate", isHuman: true, openH: 7, curH: 10, isOpen: true },
              { name: "USPS", wait: 0, state: "closed", isHuman: false, openH: 8, curH: 3, isOpen: false },
            ].map(({ name, wait, state, isHuman, openH, curH, isOpen }) => (
              <div key={name} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                borderRadius: 12, marginBottom: 8, background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "border-color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,229,160,0.2)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
              >
                <FlowPulse state={state} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{name}</div>
                  <div style={{ fontSize: 11, color: T.faint, marginTop: 2 }}>Telecom</div>
                </div>
                <SignalWaveform isHuman={isHuman} width={80} height={24} />
                <SolarSweep openHour={openH} currentHour={curH} isOpen={isOpen} width={100} height={32} />
                <div style={{ textAlign: "right", minWidth: 60 }}>
                  {wait > 0 ? (
                    <>
                      <div style={{ fontSize: 22, fontWeight: 800, color: state === "critical" ? T.red : state === "moderate" ? T.amber : T.teal, fontFamily: T.brand }}>{wait}</div>
                      <div style={{ fontSize: 10, color: T.faint }}>min wait</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: T.faint }}>Closed</div>
                  )}
                </div>
              </div>
            ))}

            <div style={{ marginTop: 10, fontSize: 11, color: T.faint, textAlign: "center" }}>
              FlowPulse · SignalWaveform · SolarSweep — all three components rendering together
            </div>
          </div>

          {/* Usage code hint */}
          <div style={{ background: "#0d1117", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(0,229,160,0.1)", fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
            <span style={{ color: "rgba(0,229,160,0.7)" }}>import</span>{" "}
            <span style={{ color: T.text }}>{"{ FlowPulse, SolarSweep, SignalWaveform }"}</span>{" "}
            <span style={{ color: "rgba(0,229,160,0.7)" }}>from</span>{" "}
            <span style={{ color: "#f59e0b" }}>'./DialTrendAnimations'</span>
            <br />
            <br />
            <span style={{ color: "rgba(255,255,255,0.25)" }}>{"// Drop in anywhere:"}</span>
            <br />
            <span style={{ color: T.text }}>{"<FlowPulse state="}<span style={{ color: "#f59e0b" }}>"critical"</span>{" size={48} />"}</span>
            <br />
            <span style={{ color: T.text }}>{"<SolarSweep openHour={8} currentHour={6} isOpen={false} />"}</span>
            <br />
            <span style={{ color: T.text }}>{"<SignalWaveform isHuman={true} />"}</span>
          </div>

        </div>
      </div>
    </>
  );
}