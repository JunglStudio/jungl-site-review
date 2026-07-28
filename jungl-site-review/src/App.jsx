import { useState, useEffect, useRef } from "react";

const JUNGLE_MESSAGES = [
  "Cutting through the weeds and trees...",
  "Dodging tigers and lions...",
  "Climbing over hills and mountains...",
  "Searching for a cave to sleep in...",
  "Tasting questionable mushrooms...",
  "Searching for water...",
  "Napping under the treetops...",
  "Listening for danger...",
];

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaqyjeq";

const SEC_ICONS = {
  "Clarity & Messaging": "💬",
  "Visual Design & Brand": "🎨",
  "Trust & Credibility": "🤝",
  "Conversion & CTAs": "🎯",
  "Mobile Experience": "📱",
  "SEO Basics": "🔍",
};

const C = {
  bg: "#1e3325",
  card: "#243d2c",
  border: "#2e4d37",
  lime: "#c2f04a",
  limeDark: "#1a2e1a",
  text: "#eef7ee",
  textSub: "#8aaa88",
  textMuted: "#4f6850",
  red: "#f07070",
};

function scoreColor(s) {
  if (s >= 8) return "#4db856";
  if (s >= 6) return "#c4a00a";
  if (s >= 4) return "#c96020";
  return "#c83030";
}
function scoreBg(s) {
  if (s >= 8) return "#1e3d1e";
  if (s >= 6) return "#3d3010";
  if (s >= 4) return "#3d2010";
  return "#3d1010";
}
function gradeColor(g) {
  return ({ A: "#4db856", B: "#7acc5a", C: "#c4a00a", D: "#c96020", F: "#c83030" }[g] || "#c4a00a");
}

function buildPrompt(url) {
  return `You are a senior web design strategist at Jungl Studio, a creative agency specializing in Squarespace websites for small businesses.

Analyze the website at: ${url}

Use whatever knowledge you have about this specific site from your training data. If you don't recognize it, give your best professional assessment based on the URL, domain name, and standard web design best practices. Be specific and honest.

Return ONLY a valid JSON object. No markdown fences. No preamble:

{
  "overallScore": <integer 1-10>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
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
  "junglTake": "<2-3 sentences. Warm, direct, honest. Not salesy. Ends with something that makes them think.>"
}

Rules: honest scores only. Mediocre sites get 4s and 5s, not 7s. Return ONLY the JSON.`;
}

// CSS injected once for keyframe animations
const CSS = `
  @keyframes jungleBar {
    0%   { width: 0% }
    6%   { width: 10% }
    18%  { width: 22% }
    28%  { width: 31% }
    40%  { width: 45% }
    50%  { width: 50% }
    60%  { width: 60% }
    72%  { width: 66% }
    82%  { width: 74% }
    92%  { width: 80% }
    100% { width: 85% }
  }
  @keyframes barShimmer {
    0%   { background-position: -200px 0 }
    100% { background-position: 200px 0 }
  }
  @keyframes msgIn {
    0%   { opacity: 0; transform: translateY(10px) }
    20%  { opacity: 1; transform: translateY(0) }
    80%  { opacity: 1; transform: translateY(0) }
    100% { opacity: 0; transform: translateY(-6px) }
  }
  @keyframes barDone {
    to { width: 100% }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1e3325; }
  input::placeholder { color: rgba(238,247,238,0.35); }
  input:focus { border-color: rgba(194,240,74,0.5) !important; }
`;

function SectionCard({ sec }) {
  const pct = Math.min(100, Math.max(0, (sec.score || 5) * 10));
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px", marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: C.text }}>
          <span>{SEC_ICONS[sec.name] || "📋"}</span>{sec.name}
        </div>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: scoreBg(sec.score), color: scoreColor(sec.score), fontSize: 12, fontWeight: 600 }}>
          {sec.score}/10
        </span>
      </div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: scoreColor(sec.score), borderRadius: 2 }} />
      </div>
      <div style={{ fontSize: 13, color: C.textSub, marginBottom: 10, lineHeight: 1.55 }}>{sec.summary}</div>
      {(sec.findings || []).map((f, j) => (
        <div key={j} style={{ display: "flex", gap: 7, marginBottom: 5, fontSize: 12, color: C.textSub, lineHeight: 1.5 }}>
          <span style={{ color: C.textMuted, flexShrink: 0 }}>·</span><span>{f}</span>
        </div>
      ))}
      <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "10px 13px", marginTop: 12 }}>
        <div style={{ fontSize: 10, color: C.lime, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>Fix</div>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.55 }}>{sec.fix}</div>
      </div>
    </div>
  );
}

function EmailGate({ onUnlock, siteUrl, lockedCount }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!email || !email.includes("@")) { setErr("Please enter a valid email address."); return; }
    setErr(""); setSubmitting(true);
    try {
      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, site_reviewed: siteUrl, source: "Jungl Site Review Tool" }),
      });
    } catch (e) { /* unlock anyway */ }
    setSubmitting(false);
    onUnlock(email);
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.lime, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
        {lockedCount} more insights + our take
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 10 }}>See the full picture</div>
      <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.65, marginBottom: 24, maxWidth: 340, margin: "0 auto 24px" }}>
        Drop your email to unlock the rest — plus our "what we'd do" for every item.
      </div>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        style={{ width: "100%", padding: "13px 20px", background: "rgba(0,0,0,0.2)", border: `1px solid ${C.border}`, borderRadius: 50, color: C.text, fontSize: 15, outline: "none", marginBottom: 10, fontFamily: "inherit", textAlign: "center" }}
      />
      {err && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{err}</div>}
      <button onClick={submit} disabled={submitting}
        style={{ width: "100%", padding: "13px", background: submitting ? C.border : C.lime, color: submitting ? C.textSub : C.limeDark, border: "none", borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
        {submitting ? "Unlocking..." : "Unlock"}
      </button>
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 12 }}>
        We'll add you to the Jungl list. No spam, unsubscribe anytime.
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("input");
  const [url, setUrl] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgKey, setMsgKey] = useState(0);
  const [barDone, setBarDone] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const msgTimer = useRef(null);

  // Inject CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Cycle messages during loading
  useEffect(() => {
    if (step !== "loading") return;
    setMsgIndex(0); setMsgKey(0);
    msgTimer.current = setInterval(() => {
      setMsgIndex((i) => (i + 1) % JUNGLE_MESSAGES.length);
      setMsgKey((k) => k + 1);
    }, 3500);
    return () => clearInterval(msgTimer.current);
  }, [step]);

  const reset = () => {
    setStep("input"); setResults(null); setUrl("");
    setError(""); setUnlocked(false); setBarDone(false);
  };

  const analyze = async () => {
    const cleanUrl = url.trim().replace(/^https?:\/\//, "");
    if (!cleanUrl) { setError("Please enter your website URL."); return; }
    const fullUrl = "https://" + cleanUrl;
    setError("");
    setBarDone(false);
    setStep("loading");

    try {
      const res = await fetch("/.netlify/functions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(fullUrl) }),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(`${res.status}: ${t.slice(0, 100)}`); }
      const data = await res.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");
      if (!textBlock?.text) throw new Error("No response from API.");
      const cleaned = textBlock.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(cleaned);
      clearInterval(msgTimer.current);
      setBarDone(true);
      setTimeout(() => { setResults(parsed); setStep("results"); }, 600);
    } catch (e) {
      clearInterval(msgTimer.current);
      setError(e.message || "Something went wrong. Please try again.");
      setStep("input");
    }
  };

  // ---- SHARED HEADER ----
  const Logo = () => (
    <div style={{ textAlign: "center", padding: "28px 0 0" }}>
      <span style={{ fontSize: 11, letterSpacing: "0.15em", color: C.lime, textTransform: "uppercase" }}>JUNGL STUDIO</span>
    </div>
  );

  // ---- LOADING ----
  if (step === "loading") return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.15em", color: C.lime, textTransform: "uppercase", marginBottom: 52 }}>JUNGL STUDIO</div>
      <div key={msgKey} style={{ fontSize: 20, color: C.text, fontWeight: 500, marginBottom: 56, minHeight: 32, animation: "msgIn 3.5s ease-in-out forwards", maxWidth: 420 }}>
        {JUNGLE_MESSAGES[msgIndex]}
      </div>
      <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.08)", borderRadius: 50, height: 6, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          borderRadius: 50,
          background: `linear-gradient(90deg, ${C.lime}cc, ${C.lime}, ${C.lime}cc)`,
          backgroundSize: "200px 100%",
          animation: barDone
            ? "barDone 0.5s ease-out forwards"
            : "jungleBar 35s ease-out forwards, barShimmer 1.5s linear infinite",
        }} />
      </div>
    </div>
  );

  // ---- RESULTS ----
  if (step === "results" && results) {
    const r = results;
    const visibleSections = (r.sections || []).slice(0, 2);
    const lockedSections = (r.sections || []).slice(2);

    const ScoreCard = () => (
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 24px", textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Overall score</div>
        <div style={{ fontSize: 88, fontWeight: 800, color: gradeColor(r.grade), lineHeight: 1, marginBottom: 6 }}>{r.grade || "C"}</div>
        <div style={{ fontSize: 15, color: C.textSub, marginBottom: 14 }}>{r.overallScore || "?"} / 10</div>
        <div style={{ fontSize: 15, color: C.textSub, lineHeight: 1.6, maxWidth: 420, margin: "0 auto" }}>{r.headline}</div>
      </div>
    );
    const TopPriority = () => r.topPriority ? (
      <div style={{ background: "rgba(0,0,0,0.2)", border: `1px solid #3a5a28`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.lime, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>🚨 Top priority</div>
        <div style={{ fontSize: 13, color: "#d0e8a8", lineHeight: 1.65 }}>{r.topPriority}</div>
      </div>
    ) : null;

    return (
      <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
        <Logo />
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px 72px" }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>🌐 {url}</div>
          <ScoreCard />
          <TopPriority />
          {visibleSections.map((sec, i) => <SectionCard key={i} sec={sec} />)}

          {!unlocked && lockedSections.length > 0 && (
            <>
              <div style={{ position: "relative", height: 140, overflow: "hidden", marginBottom: 0 }}>
                <div style={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none", opacity: 0.65 }}>
                  {lockedSections.map((sec, i) => <SectionCard key={i} sec={sec} />)}
                  {r.junglTake && (
                    <div style={{ background: C.card, border: `1px solid #2a4030`, borderRadius: 12, padding: "20px", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: C.lime, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10 }}>🌿 Our take</div>
                      <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>{r.junglTake}</div>
                    </div>
                  )}
                </div>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "100%", background: `linear-gradient(to bottom, transparent 10%, ${C.bg} 80%)`, pointerEvents: "none" }} />
              </div>
              <EmailGate onUnlock={() => setUnlocked(true)} siteUrl={url} lockedCount={lockedSections.length} />
            </>
          )}

          {unlocked && (
            <>
              {lockedSections.map((sec, i) => <SectionCard key={i} sec={sec} />)}
              {r.junglTake && (
                <div style={{ background: C.card, border: `1px solid #2a4030`, borderRadius: 12, padding: "20px", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: C.lime, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 10 }}>🌿 Our take</div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.75 }}>{r.junglTake}</div>
                </div>
              )}
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Want us to take it from here?</div>
                <div style={{ fontSize: 14, color: C.textSub, lineHeight: 1.65, marginBottom: 24 }}>
                  We're a Squarespace-focused creative studio based in Hamburg and Denver. Kickoff to launch in five business days, no surprises.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => window.open("https://www.junglstudio.com/contact", "_blank")}
                    style={{ padding: "12px 28px", background: C.lime, color: C.limeDark, borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit" }}>
                    Book a call
                  </button>
                  <button onClick={() => window.open("https://www.junglstudio.com/web-design", "_blank")}
                    style={{ padding: "12px 28px", background: "none", color: C.text, borderRadius: 50, fontSize: 14, fontWeight: 600, cursor: "pointer", border: `1px solid ${C.border}`, fontFamily: "inherit" }}>
                    Learn more
                  </button>
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 24, paddingTop: 16 }}>
                  <button onClick={reset} style={{ background: "none", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Review another site</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- INPUT ----
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ maxWidth: 680, width: "100%" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", color: C.lime, textTransform: "uppercase", marginBottom: 28 }}>FROM JUNGL STUDIO</div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.02em" }}>
          <span style={{ color: C.text }}>Complimentary </span>
          <span style={{ color: C.lime }}>Site Review</span>
        </h1>
        <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: C.textSub, lineHeight: 1.65, marginBottom: 48, maxWidth: 520, margin: "0 auto 48px" }}>
          Paste your URL and we'll tell you what's working, where we see opportunity, and what we'd tackle first.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 620, margin: "0 auto" }}>
          <div style={{ flex: "1 1 280px", display: "flex", alignItems: "center", padding: "17px 24px", borderRadius: 50, background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)" }}>
            <span style={{ color: "rgba(238,247,238,0.35)", fontSize: 16, flexShrink: 0, userSelect: "none" }}>https://</span>
            <input
              type="text"
              placeholder="yourwebsite.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              style={{ flex: 1, background: "none", border: "none", color: C.text, fontSize: 16, outline: "none", fontFamily: "inherit", minWidth: 0 }}
            />
          </div>
          <button onClick={analyze}
            style={{ flex: "0 0 auto", padding: "17px 32px", background: C.lime, color: C.limeDark, borderRadius: 50, fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            Review My Site
          </button>
        </div>
        {error && <div style={{ color: C.red, fontSize: 13, marginTop: 16 }}>{error}</div>}
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 16 }}>Free. No email required to start.</div>
      </div>
    </div>
  );
}
