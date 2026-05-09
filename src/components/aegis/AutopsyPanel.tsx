import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Heart, AlertTriangle, CheckCircle2, X,
  Zap, Shield, Activity, ChevronDown, ChevronUp, FileText,
} from "lucide-react";

// ── Static forensic data ───────────────────────────────────────────────────

const VICTIM = {
  name: "R. Suresh", age: 34, sex: "Male", height: "174 cm",
  weight: "69 kg", bmi: "22.8", bmiLabel: "Normal",
  caseId: "C-2041", reportDate: "26 Apr 2025 · 23:47",
  pmi: "8 – 10 Hours",
  causeOfDeath: "Blunt force trauma to occipital region with depressed skull fracture and subdural hemorrhage.",
  summary: "Multiple traumatic injuries with signs of internal hemorrhage. Livor mortis inconsistency confirms post-mortem relocation. Cause of death: hemorrhagic shock secondary to blunt force trauma.",
};

type Sev = "critical" | "high" | "medium" | "low";

interface Organ {
  id: string; name: string; weight: string;
  cx: number; cy: number; rx: number; ry: number;
  severity: Sev; anomaly: string;
  detail: string; aiNote: string;
}

const ORGANS: Organ[] = [
  { id: "brain",    name: "Brain",        weight: "1,350g", cx: 100, cy: 40,  rx: 18, ry: 20,  severity: "medium",   anomaly: "Mild cerebral edema",              detail: "Mild diffuse cerebral edema noted. No herniation. Subarachnoid hemorrhage present in occipital sulci.", aiNote: "Edema pattern consistent with blunt impact 8–10h prior." },
  { id: "heart",    name: "Heart",        weight: "320g",   cx: 98,  cy: 116, rx: 9,  ry: 10,  severity: "low",      anomaly: "Normal",                           detail: "Heart 320g, within normal limits. Coronary arteries patent. No myocardial infarction.", aiNote: "No cardiac contribution to death detected." },
  { id: "lung-r",   name: "Right Lung",   weight: "620g",   cx: 118, cy: 118, rx: 12, ry: 18,  severity: "medium",   anomaly: "Subpleural hemorrhage",            detail: "Right lung 620g. Subpleural hemorrhage along inferior lobe. Mild contusion pattern.", aiNote: "Hemorrhage consistent with blunt thoracic force." },
  { id: "lung-l",   name: "Left Lung",    weight: "580g",   cx: 82,  cy: 118, rx: 12, ry: 18,  severity: "medium",   anomaly: "Right lung contusion",             detail: "Left lung 580g. Congested, no laceration. Minor atelectasis noted at base.", aiNote: "Secondary congestion from traumatic shock." },
  { id: "liver",    name: "Liver",        weight: "1,480g", cx: 112, cy: 150, rx: 16, ry: 12,  severity: "critical", anomaly: "Capsular tear · internal bleeding", detail: "Liver 1,480g. Capsular tear 6.5 cm on right lobe. Hemoperitoneum ~1,200 ml. Active bleeding at recovery.", aiNote: "Liver laceration is secondary cause of death. Critical finding." },
  { id: "spleen",   name: "Spleen",       weight: "150g",   cx: 83,  cy: 151, rx: 8,  ry: 9,   severity: "low",      anomaly: "Normal",                           detail: "Spleen 150g, normal size and consistency. No laceration.", aiNote: "No splenic involvement detected." },
  { id: "kidney-r", name: "Right Kidney", weight: "130g",   cx: 116, cy: 166, rx: 6,  ry: 9,   severity: "low",      anomaly: "Normal",                           detail: "Right kidney 130g, normal capsule, no cortical injury.", aiNote: "Renal function indicators within normal range." },
  { id: "kidney-l", name: "Left Kidney",  weight: "136g",   cx: 84,  cy: 166, rx: 6,  ry: 9,   severity: "low",      anomaly: "Normal",                           detail: "Left kidney 136g, normal appearance.", aiNote: "No renal pathology identified." },
  { id: "stomach",  name: "Stomach",      weight: "—",      cx: 100, cy: 160, rx: 10, ry: 8,   severity: "low",      anomaly: "Partially digested food",          detail: "Stomach contains partially digested rice and vegetables. Last meal approximately 2h before TOD.", aiNote: "Meal timing corroborates 19:30–21:00 TOD window." },
];

interface Injury {
  id: string; label: string; type: string;
  size: string; depth: string; bleeding: string;
  severity: Sev; fracture: string; observation: string;
  cx: number; cy: number;
  cardSide: "left" | "right"; cardY: number;
}

const INJURIES: Injury[] = [
  { id: "i-head",    label: "Head / Scalp",      type: "Blunt Force Trauma",   size: "4.2 cm",    depth: "2.1 cm",  bleeding: "Severe",          severity: "critical", fracture: "Depressed skull fracture",  observation: "Primary COD. 3 patterned impacts consistent with iron rod (87 cm). Subdural hematoma confirmed.", cx: 100, cy: 25,  cardSide: "left",  cardY: 4  },
  { id: "i-lung",    label: "Right Lung",         type: "Contusion",            size: "25%",       depth: "N/A",     bleeding: "Yes",             severity: "medium",   fracture: "None",                      observation: "Subpleural hemorrhage, right inferior lobe. Blunt thoracic force corroborates assault trajectory.", cx: 124, cy: 112, cardSide: "right", cardY: 6  },
  { id: "i-liver",   label: "Liver",              type: "Laceration",           size: "6.5 cm",    depth: "2.1 cm",  bleeding: "Severe",          severity: "critical", fracture: "None",                      observation: "Capsular tear with hemoperitoneum ~1,200 ml. Secondary cause of death.", cx: 116, cy: 150, cardSide: "left",  cardY: 30 },
  { id: "i-arm",     label: "Left Arm",           type: "Defensive Bruise",     size: "12.0 cm",   depth: "Surface", bleeding: "Minor",           severity: "low",      fracture: "None",                      observation: "Soft tissue contusion. Defensive posture confirmed. Victim was conscious during initial attack.", cx: 54,  cy: 138, cardSide: "right", cardY: 34 },
  { id: "i-abdomen", label: "Abdominal Cavity",   type: "Internal Bleeding",    size: "~1,200 ml", depth: "N/A",     bleeding: "Critical",        severity: "critical", fracture: "None",                      observation: "Hemoperitoneum. Source: liver laceration + mesenteric tear. Hemoperitoneum confirmed at recovery.", cx: 100, cy: 172, cardSide: "left",  cardY: 56 },
  { id: "i-leg",     label: "Left Thigh",         type: "Post-mortem Abrasion", size: "8.0 cm",    depth: "1.3 cm",  bleeding: "None (PM)",       severity: "medium",   fracture: "None",                      observation: "Post-mortem drag mark. Body relocated after death — confirms livor mortis inconsistency.", cx: 90,  cy: 246, cardSide: "right", cardY: 60 },
];

const KEY_OBS = [
  "Multiple blunt force injuries observed — consistent with single weapon (iron rod).",
  "Internal bleeding in abdominal cavity (~1,200 ml hemoperitoneum).",
  "Liver laceration is likely a major secondary contributor to death.",
  "No evidence of firearm injury or sharp force trauma.",
  "Defensive wounds on left arm confirm victim was conscious initially.",
  "Post-mortem relocation confirmed by fixed livor mortis inconsistency.",
  "Toxicology: trace diazepam detected — potential incapacitation pre-assault.",
];

// ── Severity helpers ───────────────────────────────────────────────────────

const SEV_COLOR: Record<Sev, { glow: string; fill: string; stroke: string; badge: string; text: string; dot: string }> = {
  critical: { glow: "rgba(239,68,68,0.7)",  fill: "rgba(239,68,68,0.25)",  stroke: "#ef4444", badge: "bg-red-600/90 text-white",           text: "text-red-400",    dot: "bg-red-500"    },
  high:     { glow: "rgba(249,115,22,0.7)", fill: "rgba(249,115,22,0.22)", stroke: "#f97316", badge: "bg-orange-500/80 text-white",         text: "text-orange-400", dot: "bg-orange-500" },
  medium:   { glow: "rgba(234,179,8,0.6)",  fill: "rgba(234,179,8,0.18)",  stroke: "#eab308", badge: "bg-yellow-500/80 text-black",         text: "text-yellow-400", dot: "bg-yellow-500" },
  low:      { glow: "rgba(34,197,94,0.5)",  fill: "rgba(34,197,94,0.12)",  stroke: "#22c55e", badge: "bg-emerald-600/80 text-white",        text: "text-emerald-400",dot: "bg-emerald-500"},
};

function SeverityBadge({ sev }: { sev: Sev }) {
  return <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${SEV_COLOR[sev].badge}`}>{sev}</span>;
}

// ── Organ icon map ─────────────────────────────────────────────────────────

const ORGAN_ICONS: Record<string, React.ReactNode> = {
  brain: <Brain className="h-3.5 w-3.5" />,
  heart: <Heart className="h-3.5 w-3.5" />,
  "lung-r": <Activity className="h-3.5 w-3.5" />,
  "lung-l": <Activity className="h-3.5 w-3.5" />,
  liver: <Shield className="h-3.5 w-3.5" />,
  spleen: <Activity className="h-3.5 w-3.5" />,
  "kidney-r": <Activity className="h-3.5 w-3.5" />,
  "kidney-l": <Activity className="h-3.5 w-3.5" />,
  stomach: <Activity className="h-3.5 w-3.5" />,
};

// ── Detail modal ───────────────────────────────────────────────────────────

function DetailModal({ item, onClose }: { item: Organ | Injury | null; onClose: () => void }) {
  if (!item) return null;
  const isOrgan = "rx" in item;
  const sev: Sev = item.severity;
  const c = SEV_COLOR[sev];

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key="modal-box"
          className="relative w-[340px] rounded-xl border bg-[#060d1f] p-5 shadow-2xl"
          style={{ borderColor: c.stroke + "80" }}
          initial={{ scale: 0.88, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute -inset-px rounded-xl opacity-30" style={{ boxShadow: `0 0 32px ${c.glow}` }} />
          <button onClick={onClose} className="absolute right-3 top-3 text-slate-500 hover:text-white"><X className="h-4 w-4" /></button>

          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg p-2" style={{ background: c.fill, border: `1px solid ${c.stroke}40` }}>
              {isOrgan ? ORGAN_ICONS[item.id] ?? <Activity className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{item.name ?? (item as Injury).label}</div>
              <SeverityBadge sev={sev} />
            </div>
          </div>

          {isOrgan ? (
            <div className="space-y-2 text-[11px]">
              <Row label="Weight" value={(item as Organ).weight} />
              <Row label="Anomaly" value={(item as Organ).anomaly} color={c.text} />
              <p className="text-slate-300 leading-relaxed pt-1">{(item as Organ).detail}</p>
              <div className="mt-3 rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/30 p-2.5">
                <div className="flex items-center gap-1.5 mb-1 text-fuchsia-400 text-[10px] font-bold uppercase tracking-wider"><Zap className="h-3 w-3" />AI Observation</div>
                <p className="text-fuchsia-200 text-[10px] leading-relaxed">{(item as Organ).aiNote}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-[11px]">
              <Row label="Injury Type"  value={(item as Injury).type} />
              <Row label="Size / Extent" value={(item as Injury).size} />
              <Row label="Depth"        value={(item as Injury).depth} />
              <Row label="Bleeding"     value={(item as Injury).bleeding} color={c.text} />
              <Row label="Fracture"     value={(item as Injury).fracture} />
              <p className="text-slate-300 leading-relaxed pt-1">{(item as Injury).observation}</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 text-slate-500 uppercase tracking-wider text-[9px] mt-0.5">{label}</span>
      <span className={`font-medium ${color ?? "text-slate-300"}`}>{value}</span>
    </div>
  );
}

// ── Animated body SVG ──────────────────────────────────────────────────────

function BodySVG({
  selectedId,
  onOrgan,
  onInjury,
}: {
  selectedId: string | null;
  onOrgan: (o: Organ) => void;
  onInjury: (i: Injury) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <svg viewBox="0 0 200 320" className="h-full w-full" style={{ filter: "drop-shadow(0 0 18px rgba(34,211,238,0.18))" }}>
      <defs>
        <radialGradient id="bodyBg" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id="organGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
        {/* Scan line gradient */}
        <linearGradient id="scanLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,211,238,0)" />
          <stop offset="50%" stopColor="rgba(34,211,238,0.55)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </linearGradient>
        <filter id="glow-cyan">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {ORGANS.map(o => (
          <radialGradient key={`rg-${o.id}`} id={`rg-${o.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={SEV_COLOR[o.severity].stroke} stopOpacity="0.45" />
            <stop offset="100%" stopColor={SEV_COLOR[o.severity].stroke} stopOpacity="0.05" />
          </radialGradient>
        ))}
      </defs>

      {/* Body background glow */}
      <ellipse cx="100" cy="170" rx="70" ry="140" fill="url(#bodyBg)" />

      {/* ── Body outline (X-ray style) ── */}
      {/* Head */}
      <ellipse cx="100" cy="40" rx="22" ry="26"
        className="fill-cyan-900/10 stroke-cyan-400/30" strokeWidth="0.8" />
      {/* Neck */}
      <rect x="92" y="64" width="16" height="16" rx="6"
        className="fill-cyan-900/10 stroke-cyan-400/25" strokeWidth="0.8" />
      {/* Torso */}
      <rect x="62" y="78" width="76" height="118" rx="20"
        className="fill-cyan-900/10 stroke-cyan-400/30" strokeWidth="0.8" />
      {/* Left arm */}
      <rect x="46" y="82" width="18" height="102" rx="9"
        className="fill-cyan-900/8 stroke-cyan-400/20" strokeWidth="0.7" />
      {/* Right arm */}
      <rect x="136" y="82" width="18" height="102" rx="9"
        className="fill-cyan-900/8 stroke-cyan-400/20" strokeWidth="0.7" />
      {/* Left leg */}
      <rect x="68" y="194" width="26" height="118" rx="12"
        className="fill-cyan-900/8 stroke-cyan-400/20" strokeWidth="0.7" />
      {/* Right leg */}
      <rect x="106" y="194" width="26" height="118" rx="12"
        className="fill-cyan-900/8 stroke-cyan-400/20" strokeWidth="0.7" />

      {/* ── Spine ── */}
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x="97.5" y={82 + i * 11} width="5" height="7" rx="1.5"
          fill="rgba(34,211,238,0.08)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
      ))}

      {/* ── Rib cage lines ── */}
      {[0,1,2,3].map((i) => (
        <g key={`rib-${i}`}>
          <path d={`M 98 ${95 + i*12} Q 78 ${92 + i*12} 68 ${98 + i*12}`}
            fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="0.7" />
          <path d={`M 102 ${95 + i*12} Q 122 ${92 + i*12} 132 ${98 + i*12}`}
            fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="0.7" />
        </g>
      ))}

      {/* ── Organs ── */}
      {ORGANS.map((o) => {
        const isHov = hovered === o.id;
        const isSel = selectedId === o.id;
        const c = SEV_COLOR[o.severity];
        return (
          <g key={o.id}
            style={{ cursor: "pointer" }}
            onClick={() => onOrgan(o)}
            onMouseEnter={() => setHovered(o.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <ellipse cx={o.cx} cy={o.cy} rx={o.rx + (isHov ? 2 : 0)} ry={o.ry + (isHov ? 2 : 0)}
              fill={`url(#rg-${o.id})`}
              stroke={c.stroke}
              strokeWidth={isSel ? 2 : isHov ? 1.5 : 0.8}
              strokeOpacity={isSel || isHov ? 0.9 : 0.5}
              style={{ filter: (isSel || isHov) ? `drop-shadow(0 0 6px ${c.glow})` : undefined, transition: "all 0.2s" }}
            />
            {/* Organ label dot */}
            <circle cx={o.cx} cy={o.cy} r="2"
              fill={c.stroke} opacity={0.85}
              style={{ filter: `drop-shadow(0 0 4px ${c.glow})` }}
            />
          </g>
        );
      })}

      {/* ── Injury markers ── */}
      {INJURIES.map((inj) => {
        const c = SEV_COLOR[inj.severity];
        const isSel = selectedId === inj.id;
        return (
          <g key={inj.id}
            style={{ cursor: "pointer" }}
            onClick={() => onInjury(inj)}
            onMouseEnter={() => setHovered(inj.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Outer pulse ring */}
            <circle cx={inj.cx} cy={inj.cy} r={inj.severity === "critical" ? 9 : 7}
              fill="none" stroke={c.stroke} strokeWidth="0.6" strokeOpacity="0.4">
              <animate attributeName="r"
                values={`${inj.severity === "critical" ? 9 : 7};${inj.severity === "critical" ? 14 : 11};${inj.severity === "critical" ? 9 : 7}`}
                dur={inj.severity === "critical" ? "1.4s" : "2s"} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur={inj.severity === "critical" ? "1.4s" : "2s"} repeatCount="indefinite" />
            </circle>
            {/* Core marker */}
            <circle cx={inj.cx} cy={inj.cy} r={inj.severity === "critical" ? 5 : 3.5}
              fill={c.fill} stroke={c.stroke} strokeWidth={isSel ? 2 : 1.2}
              style={{ filter: `drop-shadow(0 0 5px ${c.glow})`, transition: "all 0.2s" }}
            />
            <circle cx={inj.cx} cy={inj.cy} r="1.5" fill={c.stroke} opacity="0.9" />
          </g>
        );
      })}

      {/* ── Scan line animation ── */}
      <rect x="62" width="76" height="18" fill="url(#scanLine)" opacity="0.6">
        <animateTransform attributeName="transform" type="translate"
          values="0,70;0,195;0,70" dur="4s" repeatCount="indefinite" />
      </rect>

      {/* ── Grid overlay ── */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`hl-${i}`} x1="0" y1={40 * i} x2="200" y2={40 * i}
          stroke="rgba(34,211,238,0.04)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`vl-${i}`} x1={40 * i} y1="0" x2={40 * i} y2="320"
          stroke="rgba(34,211,238,0.04)" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

// ── Organ analysis row ─────────────────────────────────────────────────────

function OrganRow({ organ, onClick }: { organ: Organ; onClick: () => void }) {
  const [open, setOpen] = useState(false);
  const c = SEV_COLOR[organ.severity];
  return (
    <div className="rounded-lg border border-white/5 bg-slate-900/40 overflow-hidden">
      <button
        onClick={() => { setOpen(!open); onClick(); }}
        className="flex w-full items-center gap-2 px-2.5 py-2 hover:bg-white/5 transition-colors text-left"
      >
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${c.text}`}
          style={{ background: SEV_COLOR[organ.severity].fill, border: `1px solid ${SEV_COLOR[organ.severity].stroke}40` }}>
          {ORGAN_ICONS[organ.id] ?? <Activity className="h-3 w-3" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-white">{organ.name}</div>
          <div className="text-[9px] text-slate-500">Weight: {organ.weight}</div>
        </div>
        <div className="flex items-center gap-1.5">
          {organ.severity !== "low" ? (
            <AlertTriangle className={`h-3 w-3 ${c.text}`} />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          )}
          {open ? <ChevronUp className="h-3 w-3 text-slate-500" /> : <ChevronDown className="h-3 w-3 text-slate-500" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-2 text-[10px] text-slate-400 border-t border-white/5 pt-1.5">
              <span className={`font-semibold ${c.text}`}>Anomaly: </span>{organ.anomaly}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Floating injury card (left/right of body) ──────────────────────────────

function InjuryCard({ inj, onClick }: { inj: Injury; onClick: () => void }) {
  const c = SEV_COLOR[inj.severity];
  return (
    <motion.div
      initial={{ opacity: 0, x: inj.cardSide === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      onClick={onClick}
      className="cursor-pointer rounded-lg border bg-[#060d1f]/90 px-2.5 py-2 backdrop-blur-sm w-[155px] hover:border-opacity-80 transition-all"
      style={{ borderColor: c.stroke + "60", boxShadow: `0 0 12px ${c.glow}30` }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{inj.label}</span>
        <SeverityBadge sev={inj.severity} />
      </div>
      <div className="space-y-0.5 text-[9px]">
        <div><span className="text-slate-500">Injury: </span><span className={c.text}>{inj.type}</span></div>
        <div><span className="text-slate-500">Size: </span><span className="text-slate-300">{inj.size}</span></div>
        <div><span className="text-slate-500">Bleeding: </span><span className="text-slate-300">{inj.bleeding}</span></div>
      </div>
      <button className="mt-1.5 text-[8px] uppercase tracking-widest font-bold text-cyan-400 hover:text-cyan-300">VIEW →</button>
    </motion.div>
  );
}

// ── Mini severity map ──────────────────────────────────────────────────────

function SeverityMap() {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Injury Severity Map</div>
      <div className="flex gap-3">
        <svg viewBox="0 0 60 96" className="h-[96px] w-[60px] shrink-0">
          <ellipse cx="30" cy="11" rx="8" ry="9" fill="rgba(34,211,238,0.07)" stroke="rgba(34,211,238,0.3)" strokeWidth="0.6" />
          <rect x="18" y="21" width="24" height="36" rx="8" fill="rgba(34,211,238,0.07)" stroke="rgba(34,211,238,0.3)" strokeWidth="0.6" />
          <rect x="9" y="24" width="10" height="30" rx="5" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
          <rect x="41" y="24" width="10" height="30" rx="5" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
          <rect x="19" y="56" width="10" height="36" rx="5" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
          <rect x="31" y="56" width="10" height="36" rx="5" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.2)" strokeWidth="0.5" />
          {/* Injury dots */}
          <circle cx="30" cy="8"  r="3.5" fill="#ef4444" opacity="0.9"><animate attributeName="r" values="3.5;5;3.5" dur="1.6s" repeatCount="indefinite" /></circle>
          <circle cx="36" cy="34" r="3"   fill="#ef4444" opacity="0.9"><animate attributeName="r" values="3;4.5;3" dur="1.4s" repeatCount="indefinite" /></circle>
          <circle cx="30" cy="52" r="3"   fill="#ef4444" opacity="0.9" />
          <circle cx="22" cy="27" r="2.5" fill="#eab308" opacity="0.8" />
          <circle cx="14" cy="42" r="2"   fill="#22c55e" opacity="0.8" />
          <circle cx="27" cy="74" r="2.5" fill="#eab308" opacity="0.8" />
        </svg>
        <div className="space-y-1.5 pt-1">
          {(["critical","high","medium","low"] as Sev[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${SEV_COLOR[s].dot}`} />
              <span className="text-[9px] capitalize text-slate-400">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function AutopsyPanel() {
  const [selected, setSelected] = useState<Organ | Injury | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function selectOrgan(o: Organ) { setSelected(o); setSelectedId(o.id); }
  function selectInjury(i: Injury) { setSelected(i); setSelectedId(i.id); }
  function clearSelection() { setSelected(null); setSelectedId(null); }

  const leftInjuries  = INJURIES.filter(i => i.cardSide === "left");
  const rightInjuries = INJURIES.filter(i => i.cardSide === "right");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-xl border border-cyan-900/30 bg-[#04091a] overflow-hidden"
      style={{ boxShadow: "0 0 60px rgba(34,211,238,0.06) inset" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">Autopsy Visualization</span>
            <span className="rounded border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 font-mono text-[9px] text-cyan-400">CASE ID: {VICTIM.caseId}</span>
          </div>
          <div className="text-[9px] text-slate-500 tracking-wide">Report generated: {VICTIM.reportDate}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold text-cyan-400 tracking-widest">AI ANALYSIS ACTIVE</span>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-[220px_1fr_230px] gap-0 min-h-[620px]">

        {/* ── Left panel: victim profile ── */}
        <div className="border-r border-white/5 p-3 space-y-3 overflow-y-auto">
          <Section title="Victim Profile">
            <ProfileRow label="NAME"   value={VICTIM.name}     />
            <ProfileRow label="AGE"    value={String(VICTIM.age)} />
            <ProfileRow label="SEX"    value={VICTIM.sex}      />
            <ProfileRow label="HEIGHT" value={VICTIM.height}   />
            <ProfileRow label="WEIGHT" value={VICTIM.weight}   />
            <div className="flex justify-between">
              <span className="text-[9px] uppercase tracking-wider text-slate-500">BMI</span>
              <span className="text-[11px] font-mono text-white">{VICTIM.bmi} <span className="text-emerald-400 text-[9px]">{VICTIM.bmiLabel}</span></span>
            </div>
          </Section>

          <div className="rounded-lg border border-cyan-500/25 bg-cyan-950/20 p-2.5">
            <div className="text-[9px] uppercase tracking-widest text-cyan-500/80 mb-1">Postmortem Interval</div>
            <div className="font-mono text-base font-bold text-cyan-300">{VICTIM.pmi}</div>
          </div>

          <Section title="Overall Summary">
            <p className="text-[10px] text-slate-400 leading-relaxed">{VICTIM.summary}</p>
          </Section>

          <button className="w-full rounded-lg border border-cyan-500/40 bg-cyan-950/30 py-2 text-[10px] font-bold uppercase tracking-widest text-cyan-400 hover:bg-cyan-900/40 transition-colors flex items-center justify-center gap-2">
            <FileText className="h-3.5 w-3.5" /> View Detailed Report
          </button>
        </div>

        {/* ── Center: body + floating cards ── */}
        <div className="relative flex items-center justify-center py-4">
          {/* Left floating cards */}
          <div className="absolute left-2 top-0 flex flex-col justify-around h-full py-8 gap-3 z-10">
            {leftInjuries.map(inj => (
              <InjuryCard key={inj.id} inj={inj} onClick={() => selectInjury(inj)} />
            ))}
          </div>

          {/* Body SVG */}
          <div className="relative z-0" style={{ height: "560px", width: "200px" }}>
            <BodySVG selectedId={selectedId} onOrgan={selectOrgan} onInjury={selectInjury} />
          </div>

          {/* Right floating cards */}
          <div className="absolute right-2 top-0 flex flex-col justify-around h-full py-8 gap-3 z-10">
            {rightInjuries.map(inj => (
              <InjuryCard key={inj.id} inj={inj} onClick={() => selectInjury(inj)} />
            ))}
          </div>

          {/* Detail modal overlay */}
          {selected && <DetailModal item={selected} onClose={clearSelection} />}
        </div>

        {/* ── Right panel: organ analysis + severity map + observations ── */}
        <div className="border-l border-white/5 p-3 space-y-3 overflow-y-auto">
          <Section title="Organ Analysis">
            <div className="space-y-1">
              {ORGANS.map(o => (
                <OrganRow key={o.id} organ={o} onClick={() => selectOrgan(o)} />
              ))}
            </div>
          </Section>

          <SeverityMap />

          <Section title="Key Observations">
            <ul className="space-y-1.5">
              {KEY_OBS.map((obs, i) => (
                <li key={i} className="flex gap-2 text-[10px] text-slate-400 leading-snug">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500/70" />
                  {obs}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      {/* ── Bottom injury table ── */}
      <div className="border-t border-white/5 p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Detailed Injury Table</div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-white/5">
                {["Region","Injury","Size / Extent","Severity","Anomalies","Weight"].map(h => (
                  <th key={h} className="pb-1.5 text-left font-semibold uppercase tracking-wider text-slate-500 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INJURIES.map((inj, i) => {
                const c = SEV_COLOR[inj.severity];
                const organMatch = ORGANS.find(o => inj.id.includes(o.id.replace("-","").replace("r","").replace("l","")) || inj.label.toLowerCase().includes(o.name.toLowerCase().split(" ")[0]));
                return (
                  <tr key={inj.id}
                    onClick={() => selectInjury(inj)}
                    className={`border-b border-white/4 cursor-pointer hover:bg-white/4 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`}
                  >
                    <td className="py-1.5 pr-4 font-medium text-white">{inj.label}</td>
                    <td className="py-1.5 pr-4 text-slate-400">{inj.type}</td>
                    <td className="py-1.5 pr-4 font-mono text-slate-300">{inj.size}</td>
                    <td className="py-1.5 pr-4"><SeverityBadge sev={inj.severity} /></td>
                    <td className={`py-1.5 pr-4 ${c.text}`}>{inj.fracture !== "None" ? inj.fracture : inj.observation.split(".")[0]}</td>
                    <td className="py-1.5 font-mono text-slate-500">{organMatch?.weight ?? "N/A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tiny layout helpers ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</div>
      <div>{children}</div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5 border-b border-white/4">
      <span className="text-[9px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-[11px] font-medium text-white">{value}</span>
    </div>
  );
}
