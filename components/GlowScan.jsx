"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { BRAND } from "@/lib/brand";

// ═══════════════════════════════════════════════════════
//  GlowScan — AI Skin & Hair Assessment (white-label demo)
//  Flow: Welcome → Capture → Analyzing → Lead gate → Results
// ═══════════════════════════════════════════════════════

const SKIN_METRICS = [
  { key: "texture", label: "Skin Texture" },
  { key: "tone", label: "Tone Evenness" },
  { key: "hydration", label: "Hydration" },
  { key: "firmness", label: "Firmness" },
  { key: "radiance", label: "Radiance" },
  { key: "clarity", label: "Clarity & Pores" },
  { key: "lines", label: "Fine Lines" },
  { key: "dark_areas", label: "Under-Eye Area" },
];

const HAIR_METRICS = [
  { key: "density", label: "Hair Density" },
  { key: "scalp_coverage", label: "Scalp Coverage" },
  { key: "hairline", label: "Hairline Integrity" },
  { key: "shine", label: "Shine & Vitality" },
  { key: "damage", label: "Damage & Breakage" },
  { key: "smoothness", label: "Smoothness" },
];

const SKIN_TREATMENTS = {
  hydration: ["HydraFacial", "Moisture Infusion", "HA Boosters"],
  texture: ["Microneedling", "Chemical Peels", "Laser Resurfacing"],
  tone: ["IPL Photofacial", "Brightening Peel", "Vitamin C Infusion"],
  firmness: ["RF Microneedling", "Ultherapy", "PDO Threads"],
  radiance: ["Oxygen Facial", "LED Light Therapy", "DiamondGlow"],
  clarity: ["Deep Cleanse", "Salicylic Peel", "Pore Laser"],
  lines: ["Anti-wrinkle Injections", "Dermal Fillers", "Fractional Laser"],
  dark_areas: ["Under-Eye Filler", "PRP Treatment", "Carboxytherapy"],
};

const HAIR_TREATMENTS = {
  damage: ["Bond Repair", "Keratin Treatment", "Deep Conditioning"],
  shine: ["Gloss Treatment", "Scalp Detox", "Hair Botox"],
  density: ["PRP Hair Therapy", "Scalp Microneedling", "Biotin Infusion"],
};

function lvl(s) { return s >= 80 ? "excellent" : s >= 60 ? "good" : s >= 40 ? "fair" : "low"; }
function lvlLabel(s) { return s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Fair" : "Needs Love"; }

function Metric({ label, score, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  const l = lvl(score);
  return (
    <div className="metric" style={{ opacity: show ? 1 : 0, transform: show ? "none" : "translateY(6px)", transition: "all 0.5s ease" }}>
      <div className="body">
        <div className="meta">
          <span className="name">{label}</span>
          <span className={`lvl lvl-${l}`}>{lvlLabel(score)}</span>
        </div>
        <div className="bar"><div className={`fill fill-${l}`} style={{ width: show ? `${score}%` : "0%" }} /></div>
      </div>
      <div className="num">{score}</div>
    </div>
  );
}

function ScoreRing({ score }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf; const t0 = performance.now();
    const tick = (n) => { const p = Math.min((n - t0) / 1400, 1); setV(Math.round((1 - Math.pow(1 - p, 3)) * score)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [score]);
  const circ = 2 * Math.PI * 70;
  const off = circ - (v / 100) * circ;
  return (
    <div className="ring-wrap">
      <div style={{ position: "relative", width: 150, height: 150 }}>
        <svg width="150" height="150" style={{ transform: "rotate(-90deg)" }}>
          <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#818CF8" /></linearGradient></defs>
          <circle cx="75" cy="75" r="70" stroke="#F4F3FB" strokeWidth="10" fill="none" />
          <circle cx="75" cy="75" r="70" stroke="url(#ring)" strokeWidth="10" fill="none"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
            style={{ transition: "stroke-dashoffset 0.04s linear" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="ring-num">{v}</div>
          <div className="ring-sub">OUT OF 100</div>
        </div>
      </div>
    </div>
  );
}

export default function GlowScan() {
  const [step, setStep] = useState("welcome"); // welcome, capture, analyzing, lead, results
  const [lead, setLead] = useState({ name: "", email: "", phone: "", age: "" });
  const [consent, setConsent] = useState(false);
  const [image, setImage] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [drag, setDrag] = useState(false);
  const [cam, setCam] = useState(null);
  const [camOk, setCamOk] = useState(false);
  const [mIdx, setMIdx] = useState(0);
  const fRef = useRef(null), vRef = useRef(null), cRef = useRef(null);

  const msgs = [
    "Mapping skin texture (Glogau scale)...",
    "Evaluating tone evenness (Fitzpatrick)...",
    "Reading hydration levels...",
    "Checking firmness & elasticity...",
    "Assessing radiance factors...",
    "Analyzing hair density (Sinclair / Ludwig)...",
    "Checking hairline integrity (Norwood)...",
    "Building your profile...",
  ];
  useEffect(() => { if (step !== "analyzing") return; const iv = setInterval(() => setMIdx(p => (p + 1) % msgs.length), 2200); return () => clearInterval(iv); }, [step, msgs.length]);

  const onFile = useCallback((f) => {
    if (!f?.type.startsWith("image/")) return; setError(null);
    const r = new FileReader();
    r.onload = (e) => { setImage(e.target.result); setImgData({ b64: e.target.result.split(",")[1], type: f.type }); };
    r.readAsDataURL(f);
  }, []);

  const openCam = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } } });
      setCam(s); setTimeout(() => { if (vRef.current) { vRef.current.srcObject = s; vRef.current.onloadedmetadata = () => setCamOk(true); } }, 80);
    } catch { setError("Camera access denied — upload a photo instead."); }
  };
  const closeCam = () => { cam?.getTracks().forEach(t => t.stop()); setCam(null); setCamOk(false); };
  const snap = () => {
    if (!vRef.current || !cRef.current) return;
    const v = vRef.current, c = cRef.current; c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const u = c.toDataURL("image/jpeg", 0.9);
    setImage(u); setImgData({ b64: u.split(",")[1], type: "image/jpeg" }); closeCam();
  };

  const analyze = async () => {
    if (!imgData) return; setStep("analyzing"); setError(null); setMIdx(0);
    try {
      // Only the image goes to our own API route; the prompt and API key stay on the server.
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imgData.b64, mediaType: imgData.type }),
      });
      const parsed = await res.json();
      if (!res.ok) { setError(parsed.error || "Something went wrong — try again."); setStep("capture"); return; }
      if (parsed.overall_score === 0) { setError(parsed.skin_note || "We need a clearer photo — try again with good lighting!"); setStep("capture"); }
      else { setResults(parsed); setStep("lead"); }
    } catch (e) { console.error(e); setError("Something went wrong — try a well-lit selfie."); setStep("capture"); }
  };

  const reset = () => { setImage(null); setImgData(null); setResults(null); setError(null); setStep("welcome"); setLead({ name: "", email: "", phone: "", age: "" }); setConsent(false); closeCam(); };
  const goStep = (s) => { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const leadReady = lead.name && lead.email && consent;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="glowscan-root">
        <div className="wrap">

          {step === "welcome" && (
            <div className="card center" style={{ animation: "fu .5s ease both" }}>
              {BRAND.logo && <img className="logo" src={BRAND.logo} alt={BRAND.clinicName} />}
              <div className="eyebrow">AI Skin & Hair Assessment · {BRAND.clinicName}</div>
              <h1>GlowScan</h1>
              <p className="lede">Fun, instant AI analysis of your skin and hair to discover the cosmetic treatments you'd love.</p>
              <div className="pill-row">
                <span className="pill">Skin + Hair</span>
                <span className="pill">AI-Powered</span>
                <span className="pill">Evidence-Informed</span>
                <span className="pill">Free</span>
              </div>
              <button className="btn" onClick={() => goStep("capture")}>Start My Skin Assessment</button>
              <p className="small">For cosmetic informational purposes only.</p>
            </div>
          )}

          {step === "capture" && (
            <div className="card" style={{ animation: "fu .5s ease both" }}>
              <button className="back" onClick={() => { closeCam(); setImage(null); setImgData(null); goStep("welcome"); }}>← Back</button>
              <h2>Take Your Selfie</h2>
              <p className="lede" style={{ textAlign: "left", margin: "0 0 24px" }}>Face the camera with hair visible. Good lighting. No sunglasses, hats, or filters.</p>

              {!cam && !image && (
                <>
                  <div className={`dropzone${drag ? " drag" : ""}`}
                    onClick={() => fRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}>
                    <div className="ico">📸</div>
                    <div className="t">Upload a photo</div>
                    <div className="h">or drag & drop</div>
                  </div>
                  <input ref={fRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => onFile(e.target.files[0])} />
                  <div className="or"><div className="l" /><span>OR</span><div className="l" /></div>
                  <button className="btn btn-ghost" onClick={openCam}>📷 Use Camera</button>
                </>
              )}

              {cam && (
                <>
                  <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 14, border: "1px solid var(--border)", position: "relative" }}>
                    <video ref={vRef} autoPlay playsInline muted style={{ width: "100%", display: "block", transform: "scaleX(-1)" }} />
                    <div style={{ position: "absolute", top: "8%", left: "18%", width: "64%", height: "84%", border: "2px dashed rgba(99,102,241,0.3)", borderRadius: "50%", pointerEvents: "none" }} />
                  </div>
                  <canvas ref={cRef} hidden />
                  <div className="row">
                    <button className="btn btn-ghost" onClick={closeCam}>Cancel</button>
                    <button className="btn" onClick={snap} disabled={!camOk} style={{ opacity: camOk ? 1 : 0.4 }}>Capture</button>
                  </div>
                </>
              )}

              {image && !cam && (
                <>
                  <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 14, border: "1px solid var(--border)" }}>
                    <img src={image} alt="" style={{ width: "100%", display: "block" }} />
                  </div>
                  <div className="row">
                    <button className="btn btn-ghost" onClick={() => { setImage(null); setImgData(null); }}>Retake</button>
                    <button className="btn" onClick={analyze}>Analyze My Skin →</button>
                  </div>
                </>
              )}

              {error && (
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "#FEF2F1", border: "1px solid #FCDBD8", color: "var(--red)", fontSize: 12, textAlign: "center" }}>{error}</div>
              )}
            </div>
          )}

          {step === "analyzing" && (
            <div className="card center" style={{ padding: "60px 32px", animation: "fu .4s ease both" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 24px", border: "3px solid var(--subtle)", borderTopColor: "var(--primary)", animation: "sp .9s linear infinite" }} />
              <h2 style={{ fontSize: 26 }}>Analyzing your skin & hair...</h2>
              <p className="lede" style={{ margin: "10px auto 0", minHeight: 22 }} key={mIdx}>{msgs[mIdx]}</p>
            </div>
          )}

          {step === "lead" && (
            <div className="card" style={{ animation: "fu .5s ease both" }}>
              <div className="center" style={{ marginBottom: 28 }}>
                <span className="pill" style={{ color: "var(--green)", background: "rgba(22,163,74,.08)", borderColor: "rgba(22,163,74,.19)" }}>✓ Analysis complete</span>
                <h2 style={{ marginTop: 16 }}>Your results are ready</h2>
                <p className="lede">Where should we send your personalised GlowScan report and treatment ideas?</p>
              </div>
              <div className="grid-fields">
                <input className="field" placeholder="Full name" value={lead.name} onChange={e => setLead(p => ({ ...p, name: e.target.value }))} />
                <input className="field" type="email" placeholder="Email address" value={lead.email} onChange={e => setLead(p => ({ ...p, email: e.target.value }))} />
                <input className="field" type="tel" placeholder="Phone (optional)" value={lead.phone} onChange={e => setLead(p => ({ ...p, phone: e.target.value }))} />
                <select className="field" value={lead.age} onChange={e => setLead(p => ({ ...p, age: e.target.value }))} style={{ color: lead.age ? "var(--text)" : "var(--dim)" }}>
                  <option value="" disabled>Age range</option>
                  {["18–25", "26–35", "36–45", "46–55", "55+"].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <label className="consent">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                <span>I agree that {BRAND.clinicName} may use my details to send my results and relevant treatment information. My photo was analysed in real time and not stored. <a href={BRAND.privacyUrl} target="_blank" rel="noreferrer">Privacy policy</a>.</span>
              </label>
              <button className="btn" onClick={() => { if (leadReady) goStep("results"); }}
                style={{ opacity: leadReady ? 1 : 0.4, cursor: leadReady ? "pointer" : "not-allowed" }}>
                Reveal My Results ✦
              </button>
            </div>
          )}

          {step === "results" && results && (
            <div style={{ display: "grid", gap: 20, animation: "fu .5s ease both" }}>
              <div className="card center">
                <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--muted)", marginBottom: 4 }}>Your Skin Profile</h2>
                <ScoreRing score={results.overall_score} />
                <div className="verdict">
                  {results.overall_score >= 80 ? "Radiant" : results.overall_score >= 65 ? "Healthy Glow" : results.overall_score >= 50 ? "Solid Foundation" : "Ready to Glow Up"}
                </div>
                <div className="stat-row">
                  <div className="stat"><div className="lbl">Type</div><div className="val">{results.skin_type}</div></div>
                  <div className="stat"><div className="lbl">Skin Age</div><div className="val">{results.skin_age_range}</div></div>
                </div>
              </div>

              {results.skin_highlight && (
                <div className="card quote"><div style={{ fontSize: 22 }}>✦</div><p>"{results.skin_highlight}"</p></div>
              )}

              <div className="card note">{results.skin_note}</div>

              <div className="card">
                <h3>Skin Breakdown</h3>
                <p className="small" style={{ margin: "0 0 14px" }}>Higher is better</p>
                {SKIN_METRICS.map((m, i) => (
                  <Metric key={m.key} label={m.label} score={results.skin_scores?.[m.key] || 0} delay={200 + i * 80} />
                ))}
              </div>

              <div className="card">
                <div className="hair-head">
                  <h3>Hair Breakdown</h3>
                  <span className="pill">{results.hair_type || "—"}</span>
                </div>
                <p className="small" style={{ margin: "0 0 14px" }}>Density, damage & shine — Sinclair / Ludwig / Norwood reference</p>
                {HAIR_METRICS.map((m, i) => (
                  <Metric key={m.key} label={m.label} score={results.hair_scores?.[m.key] || 0} delay={800 + i * 80} />
                ))}
                {results.hair_note && <p className="note" style={{ marginTop: 16 }}>{results.hair_note}</p>}
                {results.hair_highlight && <div className="hair-highlight">✦ "{results.hair_highlight}"</div>}
                {results.hair_interests?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div className="small" style={{ margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Hair treatments to explore</div>
                    {results.hair_interests.map((interest, i) => {
                      const mk = Object.keys(HAIR_TREATMENTS).find(k => interest.toLowerCase().includes(k));
                      const tx = HAIR_TREATMENTS[mk] || HAIR_TREATMENTS.shine;
                      return (
                        <div className="treatment" key={i}>
                          <div className="title">{interest}</div>
                          <div className="chips">{tx.map(t => <span className="pill" key={t}>{t}</span>)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {results.skin_interests?.length > 0 && (
                <div className="card">
                  <h3>Treatments You Might Love</h3>
                  <p className="small" style={{ margin: "0 0 18px" }}>Popular options based on your profile</p>
                  {results.skin_interests.map((interest, i) => {
                    const mk = Object.keys(SKIN_TREATMENTS).find(k => interest.toLowerCase().includes(k) || k.includes(interest.toLowerCase().split(" ")[0]));
                    const tx = SKIN_TREATMENTS[mk] || SKIN_TREATMENTS.radiance;
                    return (
                      <div className="treatment" key={i}>
                        <div className="title">{interest}</div>
                        <div className="chips">{tx.map(t => <span className="pill" key={t}>{t}</span>)}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {results.fun_fact && (
                <div className="card tip"><div className="label">Skin Tip</div><p>{results.fun_fact}</p></div>
              )}

              <div className="card cta center">
                <h3>Ready to enhance your glow?</h3>
                <p>Book a free consultation with a specialist to explore the treatments that interest you.</p>
                <button className="btn btn-on-dark" onClick={() => window.open(BRAND.bookingUrl, "_blank")}>Book Your Free Consultation ✦</button>
              </div>

              <button className="btn btn-ghost" style={{ background: "transparent" }} onClick={reset}>Start Over</button>

              <div className="legal">
                <p>This assessment is for cosmetic informational and entertainment purposes only. It is not a medical examination, diagnosis or prescription. Scores are AI-generated estimates informed by published frameworks (Fitzpatrick, Glogau, Sinclair, Ludwig, Norwood) and should not replace professional advice. Your photo is processed in real time and not stored. © {BRAND.clinicName}.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        .glowscan-root {
          --bg:#FAFAFE; --card:#FFFFFF; --subtle:#F4F3FB;
          --border:rgba(20,17,55,0.08); --text:#13112B; --muted:#5C5A75; --dim:#9C9AB2;
          --primary:#6366F1; --primary-dark:#4F46E5; --primary-light:#818CF8;
          --primary-dim:rgba(99,102,241,0.08); --primary-border:rgba(99,102,241,0.22);
          --green:#16A34A; --amber:#D97706; --red:#DC2626;
          --display:'Plus Jakarta Sans',sans-serif; --body:'Inter',sans-serif;
          min-height:100vh; background:radial-gradient(1200px 600px at 50% -10%, var(--primary-dim), transparent 60%), var(--bg);
          color:var(--text); font-family:var(--body); -webkit-font-smoothing:antialiased; padding:32px 16px;
        }
        .glowscan-root * { box-sizing:border-box; }
        .wrap{max-width:580px;margin:0 auto;display:grid;gap:20px}
        .card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:32px;box-shadow:0 4px 24px -8px rgba(20,17,55,0.06)}
        .center{text-align:center}
        .logo{height:28px;margin:0 auto 28px;display:block}
        .eyebrow{font-size:11px;letter-spacing:2px;color:var(--primary);font-weight:600;text-transform:uppercase;margin-bottom:14px}
        .glowscan-root h1{font-family:var(--display);font-size:42px;font-weight:700;line-height:1.05;letter-spacing:-1px;margin:0 0 16px}
        .glowscan-root h2{font-family:var(--display);font-size:30px;font-weight:700;letter-spacing:-.5px;margin:0 0 8px}
        .glowscan-root h3{font-family:var(--display);font-size:22px;font-weight:700;margin:0 0 4px}
        .lede{font-size:15px;color:var(--muted);line-height:1.6;margin:0 auto 28px;max-width:420px}
        .pill{display:inline-block;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:500;color:var(--primary);background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.19)}
        .pill-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:28px}
        .btn{width:100%;padding:15px 24px;border:none;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--primary-light));color:#fff;font-size:14.5px;font-weight:600;cursor:pointer;font-family:var(--body);letter-spacing:.2px;transition:all .25s;box-shadow:0 8px 24px -8px rgba(99,102,241,.4)}
        .btn:hover{filter:brightness(1.05);transform:translateY(-1px)}
        .btn-ghost{background:#fff;border:1px solid var(--border);color:var(--muted);box-shadow:none}
        .btn-ghost:hover{border-color:var(--primary);color:var(--primary)}
        .btn-on-dark{background:#fff;color:var(--primary);box-shadow:0 8px 24px -8px rgba(0,0,0,.3)}
        .small{font-size:11px;color:var(--dim);margin-top:20px;line-height:1.6}
        .legal{font-size:11px;color:var(--dim);line-height:1.7;padding:0 8px}
        .back{background:none;border:none;color:var(--dim);font-size:12px;cursor:pointer;font-family:var(--body);padding:0;margin-bottom:24px}
        .dropzone{border:1.5px dashed var(--border);border-radius:16px;padding:44px 20px;text-align:center;cursor:pointer;background:var(--subtle);transition:all .25s;margin-bottom:16px}
        .dropzone.drag{border-color:var(--primary);background:var(--primary-dim)}
        .dropzone .ico{font-size:32px;margin-bottom:12px}
        .dropzone .t{font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px}
        .dropzone .h{font-size:12px;color:var(--muted)}
        .or{display:flex;align-items:center;gap:12px;margin:16px 0;color:var(--dim);font-size:11px}
        .or .l{flex:1;height:1px;background:var(--border)}
        .row{display:flex;gap:10px}
        .row > *{flex:1}
        .field{width:100%;padding:13px 16px;border-radius:10px;border:1px solid var(--border);background:#fff;color:var(--text);font-size:14px;font-family:var(--body);outline:none;transition:border-color .2s;box-sizing:border-box}
        .field:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-dim)}
        .grid-fields{display:grid;gap:12px;margin-bottom:18px}
        .consent{display:flex;gap:10px;align-items:flex-start;font-size:12px;color:var(--muted);line-height:1.6;margin:0 0 18px}
        .consent input{margin-top:3px}
        .consent a{color:var(--primary)}
        .ring-wrap{display:flex;justify-content:center;margin:20px 0}
        .ring-num{font-family:var(--display);font-size:42px;font-weight:700;color:var(--text)}
        .ring-sub{font-size:10px;color:var(--dim);letter-spacing:1.5px}
        .verdict{font-family:var(--display);font-size:28px;font-weight:700;margin-bottom:18px;letter-spacing:-.5px}
        .stat-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .stat{padding:10px 18px;background:var(--subtle);border-radius:12px;min-width:130px}
        .stat .lbl{font-size:10px;color:var(--dim);letter-spacing:1px;margin-bottom:4px;text-transform:uppercase}
        .stat .val{font-size:14px;color:var(--text);font-weight:600}
        .quote{display:flex;gap:14px;align-items:flex-start;padding:22px;background:linear-gradient(135deg,var(--primary-dim),transparent);border-color:var(--primary-border)}
        .quote p{font-family:var(--display);font-size:18px;font-weight:500;line-height:1.4;color:var(--text);font-style:italic;margin:0}
        .note{font-size:14.5px;line-height:1.7;color:var(--muted)}
        .metric{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)}
        .metric:last-child{border-bottom:none}
        .metric .meta{display:flex;justify-content:space-between;margin-bottom:6px}
        .metric .name{font-size:13.5px;color:var(--text);font-weight:500}
        .metric .lvl{font-size:11px;font-weight:600}
        .metric .bar{height:6px;background:var(--subtle);border-radius:4px;overflow:hidden}
        .metric .fill{height:100%;border-radius:4px;transition:width 1.2s cubic-bezier(.2,.8,.2,1)}
        .metric .body{flex:1}
        .metric .num{width:36px;text-align:right;font-size:14px;color:var(--text);font-weight:600;font-variant-numeric:tabular-nums}
        .lvl-excellent{color:var(--green)} .lvl-good{color:var(--primary)} .lvl-fair{color:var(--amber)} .lvl-low{color:var(--red)}
        .fill-excellent{background:linear-gradient(90deg,var(--green),#16a34acc)}
        .fill-good{background:linear-gradient(90deg,var(--primary),#6366f1cc)}
        .fill-fair{background:linear-gradient(90deg,var(--amber),#d97706cc)}
        .fill-low{background:linear-gradient(90deg,var(--red),#dc2626cc)}
        .treatment{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)}
        .treatment:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
        .treatment .title{font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px}
        .chips{display:flex;flex-wrap:wrap;gap:6px}
        .tip{background:var(--subtle);padding:22px}
        .tip .label{font-size:11px;letter-spacing:1.5px;color:var(--primary);font-weight:600;margin-bottom:8px;text-transform:uppercase}
        .tip p{font-size:14px;color:var(--text);line-height:1.6;margin:0}
        .cta{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:#fff;border:none}
        .cta h3{color:#fff;font-size:26px;margin-bottom:10px}
        .cta p{font-size:14px;line-height:1.6;margin-bottom:22px;opacity:.92}
        .hair-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;gap:12px}
        .hair-highlight{margin-top:14px;padding:14px;border-radius:12px;background:var(--primary-dim);border:1px solid var(--primary-border);font-family:var(--display);font-style:italic;font-size:15px;color:var(--text)}
        select option{background:white}
        ::placeholder{color:var(--dim)}
        @keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sp{to{transform:rotate(360deg)}}
      `}</style>
    </>
  );
}
