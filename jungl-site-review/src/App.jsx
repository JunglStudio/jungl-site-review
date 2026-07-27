import { useState, useRef } from "react";

const BUSINESS_TYPES = [
  "Restaurant or cafe",
  "Wellness, spa, or studio",
  "Creative agency or design studio",
  "Service business (coaching, consulting, etc.)",
  "Retail or e-commerce",
  "Photography or creative services",
  "Construction or trades",
  "Other small business",
];

const GOALS = [
  "Get more clients and inquiries",
  "Sell products online",
  "Build credibility and authority",
  "Improve overall design and feel",
  "All of the above",
];

const STEPS = [
  "Reading your URL and context...",
  "Analyzing messaging and copy...",
  "Checking design and branding...",
  "Reviewing conversion paths...",
  "Writing your report...",
];

const SEC_ICONS = {
  "Clarity & Messaging": "💬",
  "Visual Design & Brand": "🎨",
  "Trust & Credibility": "🤝",
  "Conversion & CTAs": "🎯",
  "Mobile Experience": "📱",
  "SEO Basics": "🔍",
};

// ---- REPLACE THIS with your Formspree form ID ----
// Go to formspree.io, create a free form, and paste your endpoint here
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaqyjeq";

function scoreColor(s) {
  if (s >= 8) return "#3a9e45";
  if (s >= 6) return "#c49a0a";
  if (s >= 4) return "#c96020";
  return "#c83030";
}
function scoreBg(s) {
  if (s >= 8) return "#edfaee";
  if (s >= 6) return "#fef9ec";
  if (s >= 4) return "#fef3ea";
  return "#fdeaea";
}
function gradeColor(g) {
  return ({ A: "#2d8f3a", B: "#4aa850", C: "#c49a0a", D: "#c96020", F: "#c83030" }[g] || "#c49a0a");
}

function buildPrompt(url, name, type, goal) {
  return `You are a senior web design strategist at Jungl Studio, a creative agency specializing in Squarespace websites.

Analyze the website at: ${url}
Business name: ${name || "not provided"}
Business type: ${type}
Primary goal: ${goal}

Use whatever knowledge you have about this specific site from your training data. If you don't recognize it, give your best professional assessment based on the URL, business type, and industry patterns. Be specific and honest.

Return ONLY a valid JSON object. No markdown fences. No preamble. Just the JSON:

{
  "overallScore": <integer 1-10>,
  "grade": <"A" or "B" or "C" or "D" or "F">,
  "headline": "<one punchy honest sentence about this site>",
  "sections": [
    {"name":"Clarity & Messaging","score":<1-10>,"summary":"<one honest sentence>","findings":["<specific observation>","<specific observation>"],"fix":"<most important change>"},
    {"name":"Visual Design & Brand","score":<1-10>,"summary":"<one honest sentence>","findings":["<specific observation>","<specific observation>"],"fix":"<most important change>"},
    {"name":"Trust & Credibility","score":<1-10>,"summary":"<one honest sentence>","findings":["<specific observation>","<specific observation>"],"fix":"<most important change>"},
    {"name":"Conversion & CTAs","score":<1-10>,"summary":"<one honest sentence>","findings":["<specific observation>","<specific observation>"],"fix":"<most important change>"},
    {"name":"Mobile Experience","score":<1-10>,"summary":"<one honest sentence>","findings":["<specific observation>","<specific observation>"],"fix":"<most important change>"},
    {"name":"SEO Basics","score":<1-10>,"summary":"<one honest sentence>","findings":["<specific observation>","<specific observation>"],"fix":"<most important change>"}
  ],
  "topPriority": "<the single most impactful fix, 1-2 sentences>",
  "junglTake": "<2-3 sentences. Warm, direct, honest. Use the business name if given. Not salesy. Ends with something that makes them think.>"
}

Rules: honest scores only. A mediocre site gets 4s and 5s, not 7s. Return ONLY the JSON.`;
}

const C = {
  bg: "#0e1a0e",
  card: "#162016",
  border: "#233023",
  accent: "#3d8042",
  accentHover: "#2e6132",
  text: "#deeade",
  textSub: "#8aaa8a",
  textMuted: "#546854",
  green: "#4db856",
};

// Reusable section card
function SectionCard({ sec }) {
  const pct = Math.min(100, Math.max(0, (sec.score || 5) * 10));
  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "20px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: C.text }}>
          <span>{SEC_ICONS[sec.name] || "📋"}</span>{sec.name}
        </div>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: scoreBg(sec.score), color: scoreColor(sec.score), fontSize: 12, fontWeight: 600 }}>
          {sec.score}/10
        </span>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: scoreColor(sec.score), borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 13, color: C.textSub, marginBottom: 10, lineHeight: 1.55 }}>{sec.summary}</div>
      {(sec.findings || []).map((f, j) => (
        <div key={j} style={{ display: "flex", gap: 7, marginBottom: 5, fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>
          <span style={{ color: C.textMuted, flexShrink: 0 }}>·</span><span>{f}</span>
        </div>
      ))}
      <div style={{ background: C.bg, borderRadius: 7, padding: "10px 13px", marginTop: 12 }}>
        <div style={{ fontSize: 10, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>Fix</div>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.55 }}>{sec.fix}</div>
      </div>
    </div>
  );
}

// Email gate component
function EmailGate({ onUnlock, siteUrl }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!email || !email.includes("@")) {
      setErr("Please enter a valid email address.");
      return;
    }
    setErr("");
    setSubmitting(true);
    try {
      // POST to Formspree — replace YOUR_FORM_ID in the constant above
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, site_reviewed: siteUrl, source: "Jungl Site Review Tool" }),
      });
    } catch (e) {
      // Unlock even if Formspree fails — don't penalize the user
    }
    setSubmitting(false);
    onUnlock(email);
  };

  return (
    <div style={{
      background: C.card,
      border: `1.5px solid ${C.border}`,
      borderRadius: 14,
      padding: "32px 28px",
      textAlign: "center",
      marginTop: 0,
    }}>
      <div style={{ fontSize: 28, marginBottom: 14 }}>🔓</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        Unlock your full report
      </div>
      <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.65, marginBottom: 24, maxWidth: 340, margin: "0 auto 24px" }}>
        See all 6 sections, your priority fix list, and our personal take on your site. Drop your email and we'll send it over.
      </div>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "#0e1a0e",
          border: `1.5px solid ${C.border}`,
          borderRadius: 9,
          color: C.text,
          fontSize: 14,
          outline: "none",
          marginBottom: 10,
          boxSizing: "border-box",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      />
      {err && <div style={{ color: "#f09090", fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <button
        onClick={submit}
        disabled={submitting}
        style={{
          width: "100%",
          padding: "13px",
          background: submitting ? "#2a5a30" : C.accent,
          color: "#fff",
          border: "none",
          borderRadius: 9,
          fontSize: 14,
          fontWeight: 600,
          cursor: submitting ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {submitting ? "Unlocking..." : "Send me the full report →"}
      </button>
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 12 }}>
        No spam. Unsubscribe anytime.
      </div>
    </div>
  );
}

export default function JunglSiteReview() {
  const [step, setStep] = useState("input");
  const [url, setUrl] = useState("");
  const [bname, setBname] = useState("");
  const [btype, setBtype] = useState("");
  const [goal, setGoal] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loadStep, setLoadStep] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const timerRef = useRef(null);

  const reset = () => {
    setStep("input"); setResults(null); setUrl(""); setBname("");
    setBtype(""); setGoal(""); setError(""); setUnlocked(false); setUserEmail("");
  };

  const handleUnlock = (email) => {
    setUserEmail(email);
    setUnlocked(true);
  };

  const analyze = async () => {
    if (!url.trim() || !btype || !goal) {
      setError("Please fill in your URL, business type, and goal.");
      return;
    }
    const cleanUrl = url.trim().startsWith("http") ? url.trim() : "https://" + url.trim();
    setError("");
    setStep("loading");
    setLoadStep(0);
    timerRef.current = setInterval(() => {
      setLoadStep((p) => Math.min(p + 1, STEPS.length - 1));
    }, 2400);

    try {
      const res = await fetch("/.netlify/functions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(cleanUrl, bname.trim(), btype, goal) }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API error ${res.status}: ${txt.slice(0, 120)}`);
      }
      const data = await res.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");
      if (!textBlock?.text) throw new Error("No text returned from API.");
      const cleaned = textBlock.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      clearInterval(timerRef.current);
      setResults(parsed);
      setStep("results");
    } catch (e) {
      clearInterval(timerRef.current);
      setError(e.message || "Something went wrong. Try again.");
      setStep("input");
    }
  };

  // ---- LOADING ----
  if (step === "loading") return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ padding: "18px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌿</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>JUNGL STUDIO</div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Site review</div>
        </div>
      </div>
      <div style={{ maxWidth: 380, margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 20 }}>⏳</div>
        <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 32 }}>Analyzing your site...</div>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, textAlign: "left", opacity: i <= loadStep ? 1 : 0.25, transition: "opacity 0.4s" }}>
            <span style={{ fontSize: 15, width: 20, textAlign: "center", flexShrink: 0 }}>
              {i < loadStep ? "✅" : i === loadStep ? "🔄" : "⬜"}
            </span>
            <span style={{ fontSize: 13, color: i <= loadStep ? C.text : C.textMuted }}>{s}</span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 24 }}>Usually takes 20 to 40 seconds</div>
      </div>
    </div>
  );

  // ---- RESULTS ----
  if (step === "results" && results) {
    const r = results;
    const visibleSections = (r.sections || []).slice(0, 2);
    const lockedSections = (r.sections || []).slice(2);

    const Header = () => (
      <div style={{ padding: "18px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌿</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>JUNGL STUDIO</div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Site review</div>
        </div>
      </div>
    );

    if (!unlocked) {
      return (
        <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
          <Header />
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 28px 72px" }}>
            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
              🌐 {url}
            </div>

            {/* Score card - always visible */}
            <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "28px 24px", textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Overall score</div>
              <div style={{ fontSize: 80, fontWeight: 800, color: gradeColor(r.grade), lineHeight: 1, marginBottom: 6 }}>{r.grade || "C"}</div>
              <div style={{ fontSize: 15, color: C.textSub, marginBottom: 12 }}>{r.overallScore || "?"} / 10</div>
              <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>{r.headline}</div>
            </div>

            {/* Top priority - always visible */}
            {r.topPriority && (
              <div style={{ background: "#1e2e10", border: "1.5px solid #304820", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "#9aba60", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>
                  🚨 Top priority
                </div>
                <div style={{ fontSize: 13, color: "#c8e0a0", lineHeight: 1.65 }}>{r.topPriority}</div>
              </div>
            )}

            {/* First 2 sections - visible */}
            {visibleSections.map((sec, i) => <SectionCard key={i} sec={sec} />)}

            {/* Blurred preview of remaining sections */}
            {lockedSections.length > 0 && (
              <div style={{ position: "relative", marginBottom: 0 }}>
                <div style={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none", opacity: 0.7 }}>
                  {lockedSections.map((sec, i) => <SectionCard key={i} sec={sec} />)}
                  {r.junglTake && (
                    <div style={{ background: C.card, border: "1.5px solid #2a4030", borderRadius: 10, padding: "20px", marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10 }}>🌿 Our take</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>{r.junglTake}</div>
                    </div>
                  )}
                </div>
                {/* Gradient fade */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "100%",
                  background: `linear-gradient(to bottom, transparent 0%, ${C.bg} 65%)`,
                  pointerEvents: "none",
                }} />
              </div>
            )}

            {/* Email gate */}
            <div style={{ marginTop: 8 }}>
              <EmailGate onUnlock={handleUnlock} siteUrl={url} />
            </div>
          </div>
        </div>
      );
    }

    // UNLOCKED — full results
    return (
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
        <Header />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "36px 28px 72px" }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
            🌐 {url}
          </div>

          <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "28px 24px", textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Overall score</div>
            <div style={{ fontSize: 80, fontWeight: 800, color: gradeColor(r.grade), lineHeight: 1, marginBottom: 6 }}>{r.grade || "C"}</div>
            <div style={{ fontSize: 15, color: C.textSub, marginBottom: 12 }}>{r.overallScore || "?"} / 10</div>
            <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>{r.headline}</div>
          </div>

          {r.topPriority && (
            <div style={{ background: "#1e2e10", border: "1.5px solid #304820", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "#9aba60", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>🚨 Top priority</div>
              <div style={{ fontSize: 13, color: "#c8e0a0", lineHeight: 1.65 }}>{r.topPriority}</div>
            </div>
          )}

          {(r.sections || []).map((sec, i) => <SectionCard key={i} sec={sec} />)}

          {r.junglTake && (
            <div style={{ background: C.card, border: "1.5px solid #2a4030", borderRadius: 10, padding: "20px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10 }}>🌿 Our take</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>{r.junglTake}</div>
            </div>
          )}

          <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 8 }}>Ready to fix this?</div>
            <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.65, marginBottom: 4 }}>
              We build Squarespace websites for small businesses that look great, load fast, and actually convert. Discovery call is free and takes 20 minutes.
            </div>
            <button style={{ display: "inline-block", padding: "12px 28px", background: C.accent, color: "#fff", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "inherit", marginTop: 12 }}
              onClick={() => window.open("https://www.junglstudio.com", "_blank")}>
              Book a free discovery call
            </button>
            <hr style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "16px 0" }} />
            <button style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", padding: 8, fontFamily: "inherit" }}
              onClick={reset}>
              Review another site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- INPUT ----
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", background: C.bg, minHeight: "100vh", color: C.text, WebkitFontSmoothing: "antialiased" }}>
      <div style={{ padding: "18px 28px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, background: C.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌿</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>JUNGL STUDIO</div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Free site review</div>
        </div>
      </div>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "48px 28px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>How is your website really doing?</h1>
        <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.7, marginBottom: 36 }}>
          Paste your URL and get an honest AI audit across design, messaging, trust, and conversion. Takes about 30 seconds.
        </p>

        {[
          { label: "Website URL", required: true, el: <input type="url" placeholder="https://yourwebsite.com" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()} style={{ width: "100%", padding: "12px 14px", background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box", fontFamily: "inherit" }} /> },
          { label: "Business name", required: false, el: <input type="text" placeholder="Acme Studio" value={bname} onChange={e => setBname(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box", fontFamily: "inherit" }} /> },
        ].map(({ label, required, el }) => (
          <div key={label}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7 }}>
              {label} {required ? <span style={{ color: "#f07070" }}>*</span> : <span style={{ color: C.textMuted, fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 10 }}>(optional)</span>}
            </label>
            {el}
          </div>
        ))}

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7 }}>
          Business type <span style={{ color: "#f07070" }}>*</span>
        </label>
        <select value={btype} onChange={e => setBtype(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box", fontFamily: "inherit", appearance: "none", cursor: "pointer" }}>
          <option value="">Select type...</option>
          {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSub, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 7 }}>
          Primary goal <span style={{ color: "#f07070" }}>*</span>
        </label>
        <select value={goal} onChange={e => setGoal(e.target.value)} style={{ width: "100%", padding: "12px 14px", background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 9, color: C.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box", fontFamily: "inherit", appearance: "none", cursor: "pointer" }}>
          <option value="">Select goal...</option>
          {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {error && (
          <div style={{ background: "#2a1010", border: "1.5px solid #5a2020", borderRadius: 9, padding: "12px 14px", fontSize: 13, color: "#f09090", marginBottom: 16 }}>{error}</div>
        )}

        <button onClick={analyze} style={{ width: "100%", padding: "14px", background: C.accent, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Analyze my site →
        </button>
        <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center", marginTop: 10 }}>Free. No email required to start.</div>
      </div>
    </div>
  );
}
