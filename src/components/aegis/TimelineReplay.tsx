import React, { useState, useEffect, useRef, useMemo } from "react";
import { fetchTimeline, type TimelineEvent } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, ChevronLeft, ChevronRight,
  AlertTriangle, Brain, Eye, Camera, Smartphone,
  Banknote, Dna, Car, User, Clock, FlaskConical,
  Hammer, Activity, Radio, Home, MapPin, Target,
  SkipBack, SkipForward, TrendingUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type EventType =
  | "movement" | "financial" | "cctv" | "phone"
  | "witness" | "forensic" | "ai" | "vehicle"
  | "analysis" | "anomaly";

type MiniNodeType =
  | "victim" | "suspect" | "witness" | "cctv" | "phone"
  | "forensic" | "financial" | "dna" | "vehicle"
  | "anomaly" | "weapon" | "ai" | "tower";

interface MiniNode { id: string; typeKey: MiniNodeType; label: string; sublabel?: string }
interface MiniEdge { from: string; to: string; label?: string; type: "solid" | "dashed" | "suspicious" }

interface ReplayStep {
  id: number; time: string; title: string;
  eventType: EventType; description: string;
  confidence: number; severity: "normal" | "suspicious" | "critical";
  aiInsight: string;
  nodes?: MiniNode[]; edges?: MiniEdge[];
  special?: "ai-hypothesis" | "movement" | "contradiction" | "narrative";
}

// ── Style Maps ────────────────────────────────────────────────────────────────
const EVENT_COLORS: Record<EventType, { ring: string; text: string; bg: string; dot: string }> = {
  movement:  { ring: "border-blue-400/70",    text: "text-blue-300",    bg: "bg-blue-900/30",    dot: "bg-blue-400"    },
  financial: { ring: "border-yellow-400/70",  text: "text-yellow-300",  bg: "bg-yellow-900/30",  dot: "bg-yellow-400"  },
  cctv:      { ring: "border-slate-400/70",   text: "text-slate-300",   bg: "bg-slate-800/30",   dot: "bg-slate-400"   },
  phone:     { ring: "border-sky-400/70",     text: "text-sky-300",     bg: "bg-sky-900/30",     dot: "bg-sky-400"     },
  witness:   { ring: "border-emerald-400/70", text: "text-emerald-300", bg: "bg-emerald-900/30", dot: "bg-emerald-400" },
  forensic:  { ring: "border-violet-400/70",  text: "text-violet-300",  bg: "bg-violet-900/30",  dot: "bg-violet-400"  },
  ai:        { ring: "border-fuchsia-400/70", text: "text-fuchsia-300", bg: "bg-fuchsia-900/30", dot: "bg-fuchsia-400" },
  vehicle:   { ring: "border-orange-400/70",  text: "text-orange-300",  bg: "bg-orange-900/30",  dot: "bg-orange-400"  },
  analysis:  { ring: "border-teal-400/70",    text: "text-teal-300",    bg: "bg-teal-900/30",    dot: "bg-teal-400"    },
  anomaly:   { ring: "border-orange-500/70",  text: "text-orange-400",  bg: "bg-orange-900/30",  dot: "bg-orange-500"  },
};

const NODE_STYLES: Record<MiniNodeType, { border: string; bg: string; labelColor: string; typeTag: string }> = {
  victim:   { border: "border-cyan-400/80",    bg: "bg-cyan-950/80",    labelColor: "text-cyan-300",   typeTag: "VICTIM"    },
  suspect:  { border: "border-red-500/80",     bg: "bg-red-950/80",     labelColor: "text-red-300",    typeTag: "SUSPECT"   },
  witness:  { border: "border-emerald-400/70", bg: "bg-emerald-950/70", labelColor: "text-emerald-300",typeTag: "WITNESS"   },
  cctv:     { border: "border-blue-400/60",    bg: "bg-blue-950/70",    labelColor: "text-blue-300",   typeTag: "CCTV"      },
  phone:    { border: "border-sky-400/60",     bg: "bg-sky-950/70",     labelColor: "text-sky-300",    typeTag: "PHONE"     },
  forensic: { border: "border-violet-400/60",  bg: "bg-violet-950/70",  labelColor: "text-violet-300", typeTag: "FORENSIC"  },
  financial:{ border: "border-emerald-400/70", bg: "bg-emerald-950/70", labelColor: "text-emerald-300",typeTag: "FINANCIAL" },
  dna:      { border: "border-cyan-300/80",    bg: "bg-cyan-950/80",    labelColor: "text-cyan-200",   typeTag: "DNA"       },
  vehicle:  { border: "border-teal-400/60",    bg: "bg-teal-950/70",    labelColor: "text-teal-300",   typeTag: "VEHICLE"   },
  anomaly:  { border: "border-orange-500/70",  bg: "bg-orange-950/70",  labelColor: "text-orange-300", typeTag: "ANOMALY"   },
  weapon:   { border: "border-orange-400/70",  bg: "bg-orange-950/70",  labelColor: "text-orange-300", typeTag: "WEAPON"    },
  ai:       { border: "border-fuchsia-400/70", bg: "bg-fuchsia-950/70", labelColor: "text-fuchsia-300",typeTag: "AI"        },
  tower:    { border: "border-sky-400/60",     bg: "bg-sky-950/70",     labelColor: "text-sky-300",    typeTag: "TOWER"     },
};

const NODE_ICON: Record<MiniNodeType, React.ReactNode> = {
  victim:   <User className="h-3 w-3 text-cyan-300" />,
  suspect:  <AlertTriangle className="h-3 w-3 text-red-400" />,
  witness:  <Eye className="h-3 w-3 text-emerald-300" />,
  cctv:     <Camera className="h-3 w-3 text-blue-300" />,
  phone:    <Smartphone className="h-3 w-3 text-sky-300" />,
  forensic: <FlaskConical className="h-3 w-3 text-violet-300" />,
  financial:<Banknote className="h-3 w-3 text-emerald-300" />,
  dna:      <Dna className="h-3 w-3 text-cyan-200" />,
  vehicle:  <Car className="h-3 w-3 text-teal-300" />,
  anomaly:  <AlertTriangle className="h-3 w-3 text-orange-400" />,
  weapon:   <Hammer className="h-3 w-3 text-orange-300" />,
  ai:       <Brain className="h-3 w-3 text-fuchsia-300" />,
  tower:    <Radio className="h-3 w-3 text-sky-300" />,
};

// ── Timeline Step Data (18 steps) ─────────────────────────────────────────────
const STEPS: ReplayStep[] = [
  {
    id: 1, time: "18:10", title: "Victim leaves home", eventType: "movement",
    description: "R. Suresh departs Triplicane residence",
    confidence: 92, severity: "normal",
    aiInsight: "Normal movement pattern detected. Victim headed towards Chennai Central on foot.",
    nodes: [{ id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" }],
    edges: [],
  },
  {
    id: 2, time: "19:42", title: "UPI Transfer to Suspect S-118", eventType: "financial",
    description: "₹40,000 transferred from victim to Vetri",
    confidence: 88, severity: "suspicious",
    aiInsight: "Financial link established. ₹40,000 UPI transfer from R. Suresh to Vetri (S-118) sets up financial motive 90 min before TOD.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "t", typeKey: "financial", label: "UPI Transfer", sublabel: "₹40,000 · 20:22" },
      { id: "s", typeKey: "suspect", label: "SUSPECT", sublabel: "S-118 (Vetri)" },
    ],
    edges: [
      { from: "v", to: "t", label: "Financial Link", type: "dashed" },
      { from: "t", to: "s", type: "dashed" },
    ],
  },
  {
    id: 3, time: "20:14", title: "CCTV Spots Victim at E-Gate 4", eventType: "cctv",
    description: "Victim captured at Chennai Central E-Gate 4",
    confidence: 95, severity: "normal",
    aiInsight: "Victim seen at E-Gate 4. CCTV-0412 timestamp verified. Consistent with movement trajectory from Triplicane.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "c", typeKey: "cctv", label: "CCTV", sublabel: "E-Gate 4 · 20:14" },
    ],
    edges: [{ from: "v", to: "c", label: "Captured at 20:14", type: "solid" }],
  },
  {
    id: 4, time: "20:22", title: "Phone Tower Overlap", eventType: "phone",
    description: "Victim and S-118 phones on same tower",
    confidence: 81, severity: "suspicious",
    aiInsight: "Both phones in same tower area. Victim and Vetri (S-118) within 500m of each other from 20:22–20:51. Proximity confirmed.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "t", typeKey: "tower", label: "Tower Overlap", sublabel: "20:22" },
      { id: "s", typeKey: "suspect", label: "SUSPECT", sublabel: "S-118 (Vetri)" },
    ],
    edges: [
      { from: "v", to: "t", type: "solid" },
      { from: "t", to: "s", type: "dashed" },
    ],
  },
  {
    id: 5, time: "20:42", title: "Altercation Captured", eventType: "cctv",
    description: "Physical altercation captured on CCTV-0412",
    confidence: 90, severity: "critical",
    aiInsight: "Victim and suspect co-located. Altercation captured in 6 clear frames at 20:42. Key evidence of physical confrontation.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "c", typeKey: "cctv", label: "CCTV-0412", sublabel: "20:42" },
      { id: "s", typeKey: "suspect", label: "SUSPECT", sublabel: "S-118 (Vetri)" },
    ],
    edges: [
      { from: "v", to: "c", type: "solid" },
      { from: "c", to: "s", label: "Physical Altercation", type: "suspicious" },
    ],
  },
  {
    id: 6, time: "20:48", title: "Timestamp Anomaly Found", eventType: "anomaly",
    description: "CCTV-0418 clock drifts +6 min from master clock",
    confidence: 47, severity: "suspicious",
    aiInsight: "Possible timestamp manipulation. +6 minute drift detected. Could create false alibi window. Under forensic review.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "c", typeKey: "cctv", label: "CCTV-0418", sublabel: "20:48" },
      { id: "a", typeKey: "anomaly", label: "Timestamp", sublabel: "Anomaly ⚠" },
    ],
    edges: [
      { from: "v", to: "c", type: "dashed" },
      { from: "c", to: "a", label: "+6 min drift", type: "suspicious" },
    ],
  },
  {
    id: 7, time: "20:51", title: "Victim Phone Last Ping", eventType: "phone",
    description: "Last phone activity from victim's device",
    confidence: 84, severity: "suspicious",
    aiInsight: "Likely last phone activity. Victim's device goes dark at 20:51 — consistent with incapacitation during altercation window.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "p", typeKey: "phone", label: "Phone Last Ping", sublabel: "20:51" },
    ],
    edges: [{ from: "v", to: "p", label: "Signal lost", type: "solid" }],
  },
  {
    id: 8, time: "21:10", title: "Witness Statement Added", eventType: "witness",
    description: "Anandhi K. confirms victim at E-Gate 4 at 20:14",
    confidence: 76, severity: "normal",
    aiInsight: "Witness saw argument near station. Anandhi K. (stall owner) statement consistent with CCTV-0412. Reliable eyewitness.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "w", typeKey: "witness", label: "WITNESS", sublabel: "Anandhi K. · 21:10" },
    ],
    edges: [{ from: "v", to: "w", label: "Eyewitness Statement", type: "dashed" }],
  },
  {
    id: 9, time: "21:30", title: "Estimated Time of Death", eventType: "forensic",
    description: "Autopsy narrows TOD window to 19:30–21:00",
    confidence: 76, severity: "normal",
    aiInsight: "TOD window narrowed. Vitreous K+ 6.1 mmol/L + rigor mortis → TOD 19:30–21:00. Consistent with altercation at 20:42.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "t", typeKey: "forensic", label: "TOD Estimation", sublabel: "21:00–21:30 · 76%" },
    ],
    edges: [{ from: "v", to: "t", label: "Forensic Correlation", type: "dashed" }],
  },
  {
    id: 10, time: "22:14", title: "Vehicle Leaves Crime Area", eventType: "vehicle",
    description: "TN-09-AC-4421 spotted leaving 22:14",
    confidence: 72, severity: "suspicious",
    aiInsight: "Suspect vehicle identified. TN-09-AC-4421 linked to S-118 associate. Exits scene 73 min post estimated TOD.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "vh", typeKey: "vehicle", label: "VEHICLE", sublabel: "TN-09-AC-4421 · 22:14" },
      { id: "s", typeKey: "suspect", label: "SUSPECT", sublabel: "S-118 (Vetri)" },
    ],
    edges: [
      { from: "v", to: "vh", type: "dashed" },
      { from: "vh", to: "s", label: "Linked to", type: "suspicious" },
    ],
  },
  {
    id: 11, time: "22:40", title: "DNA Match Confirmed", eventType: "forensic",
    description: "DNA Sample D-77 matches S-118 at 99.2%",
    confidence: 99, severity: "critical",
    aiInsight: "Strong biological evidence. STR profiling confirms DNA from occipital wound = Vetri (S-118) at 99.2%. Primary forensic link.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "d", typeKey: "dna", label: "DNA Sample D-77", sublabel: "Match 99.2%" },
      { id: "s", typeKey: "suspect", label: "SUSPECT", sublabel: "S-118 (Vetri)" },
    ],
    edges: [
      { from: "v", to: "d", type: "solid" },
      { from: "d", to: "s", label: "DNA Match · 99.2%", type: "solid" },
    ],
  },
  {
    id: 12, time: "23:02", title: "Witness #2 Reports Incident", eventType: "witness",
    description: "Auto driver places S-204 at scene at 22:10",
    confidence: 71, severity: "suspicious",
    aiInsight: "Second witness corroborates but contradicts. Places S-204 at scene — however S-204's phone shows no tower activity. Inconsistency flagged.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "w", typeKey: "witness", label: "WITNESS", sublabel: "Auto Driver T. · 23:02" },
    ],
    edges: [{ from: "v", to: "w", label: "Statement (Disputed)", type: "dashed" }],
  },
  {
    id: 13, time: "00:15", title: "Toxicology Report Added", eventType: "forensic",
    description: "Diazepam trace detected in victim's blood",
    confidence: 82, severity: "critical",
    aiInsight: "Drug traces detected. Diazepam trace suggests pre-assault sedation. Consistent with S-118's background as drug supplier.",
    nodes: [
      { id: "v", typeKey: "victim", label: "VICTIM", sublabel: "R. Suresh" },
      { id: "t", typeKey: "forensic", label: "Toxicology T-2041", sublabel: "Diazepam trace" },
      { id: "s", typeKey: "suspect", label: "SUSPECT", sublabel: "S-118 (Vetri)" },
    ],
    edges: [
      { from: "v", to: "t", type: "solid" },
      { from: "t", to: "s", label: "Drug Connection", type: "suspicious" },
    ],
  },
  {
    id: 14, time: "01:00", title: "AI Hypothesis Generated", eventType: "ai",
    description: "Financial dispute escalated into homicide",
    confidence: 78, severity: "normal",
    aiInsight: "Motive hypothesis generated. Financial dispute over ₹40,000 likely escalated into premeditated assault. S-118 is primary suspect per AI model.",
    special: "ai-hypothesis",
  },
  {
    id: 15, time: "02:30", title: "Movement Reconstruction Complete", eventType: "analysis",
    description: "Victim and suspect routes reconstructed",
    confidence: 86, severity: "normal",
    aiInsight: "Routes overlap at E-Gate 4. Movement reconstruction confirms both victim and suspect converged at 20:42 — matching altercation time exactly.",
    special: "movement",
  },
  {
    id: 16, time: "03:10", title: "Contradiction Detected", eventType: "anomaly",
    description: "Witness timing conflicts with CCTV evidence",
    confidence: 58, severity: "suspicious",
    aiInsight: "Witness timing conflicts with CCTV-0418. Statement conflict between Anandhi K. testimony and auto driver's timeline. Contradiction flagged.",
    special: "contradiction",
  },
  {
    id: 17, time: "04:00", title: "Crime Scene Reconstruction", eventType: "forensic",
    description: "Weapon → injury → blood sample chain established",
    confidence: 89, severity: "critical",
    aiInsight: "Cause of death linked. Iron rod → head trauma → blood sample B-09 chain established. Weapon discarded 100m post-assault.",
    nodes: [
      { id: "v",  typeKey: "victim",   label: "VICTIM",         sublabel: "R. Suresh"     },
      { id: "w",  typeKey: "weapon",   label: "Weapon",         sublabel: "Blunt Object"  },
      { id: "i",  typeKey: "forensic", label: "Injury Pattern", sublabel: "Head Trauma"   },
      { id: "b",  typeKey: "dna",      label: "Blood Sample B-09", sublabel: "Partial match" },
    ],
    edges: [
      { from: "v", to: "w", type: "solid" },
      { from: "w", to: "i", label: "Injury Pattern", type: "solid" },
      { from: "i", to: "b", type: "dashed" },
    ],
  },
  {
    id: 18, time: "05:30", title: "Final AI Narrative Generated", eventType: "ai",
    description: "Complete reconstruction — 90% confidence",
    confidence: 90, severity: "critical",
    aiInsight: "Victim left home at 18:10. He reached E-Gate 4 by 20:14 where he met suspect S-118. A financial dispute likely escalated into a physical altercation captured on CCTV. Victim was assaulted with a blunt object causing fatal head trauma. TOD estimated between 21:00–21:30. Strong forensic and digital evidence link suspect to the crime.",
    special: "narrative",
  },
];

// ── Step Badge ────────────────────────────────────────────────────────────────
function StepBadge({
  number, eventType, active, past,
}: { number: number; eventType: EventType; active: boolean; past: boolean }) {
  const c = EVENT_COLORS[eventType];
  return (
    <div className={[
      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all",
      active ? `${c.ring} ${c.bg} ${c.text} shadow-lg` : past ? "border-white/20 bg-white/5 text-slate-500" : "border-white/15 bg-transparent text-slate-600",
    ].join(" ")}>
      {number}
    </div>
  );
}

// ── Type Icon ─────────────────────────────────────────────────────────────────
function TypeIcon({ type, className = "h-3 w-3" }: { type: EventType; className?: string }) {
  const icons: Record<EventType, React.ReactNode> = {
    movement: <User className={className} />,
    financial: <Banknote className={className} />,
    cctv: <Camera className={className} />,
    phone: <Smartphone className={className} />,
    witness: <Eye className={className} />,
    forensic: <FlaskConical className={className} />,
    ai: <Brain className={className} />,
    vehicle: <Car className={className} />,
    analysis: <Activity className={className} />,
    anomaly: <AlertTriangle className={className} />,
  };
  return <>{icons[type]}</>;
}

// ── Mini Node Card ────────────────────────────────────────────────────────────
function MiniNodeCard({ node }: { node: MiniNode }) {
  const s = NODE_STYLES[node.typeKey];
  return (
    <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 min-w-[80px] max-w-[105px] shrink-0 ${s.border} ${s.bg}`}>
      <div className="shrink-0">{NODE_ICON[node.typeKey]}</div>
      <div className="min-w-0">
        <div className={`text-[8px] font-bold uppercase tracking-wider ${s.labelColor} leading-none mb-0.5`}>{node.label}</div>
        {node.sublabel && (
          <div className="text-[9px] text-slate-300 leading-tight truncate">{node.sublabel}</div>
        )}
      </div>
    </div>
  );
}

// ── Edge Connector ────────────────────────────────────────────────────────────
function EdgeConnector({ label, type }: { label?: string; type: "solid" | "dashed" | "suspicious" }) {
  const cfg = {
    solid:      { lineClass: "bg-cyan-400/70",   arrowColor: "text-cyan-400",   glow: false  },
    dashed:     { lineClass: "bg-white/25",       arrowColor: "text-slate-400",  glow: false  },
    suspicious: { lineClass: "bg-red-500/80",     arrowColor: "text-red-400",    glow: true   },
  }[type];

  return (
    <div className="flex flex-col items-center justify-center w-14 shrink-0 px-1">
      {label && (
        <span className="text-[7px] text-slate-400 text-center leading-tight mb-0.5 max-w-[52px] truncate" title={label}>
          {label}
        </span>
      )}
      <div className="flex items-center w-full">
        <div
          className={`flex-1 h-px ${type === "dashed" ? "border-t border-dashed border-slate-400/50" : cfg.lineClass}`}
          style={cfg.glow ? { boxShadow: "0 0 4px rgba(239,68,68,0.5)" } : undefined}
        />
        <span className={`text-[11px] leading-none -ml-0.5 ${cfg.arrowColor}`}>›</span>
      </div>
    </div>
  );
}

// ── Mini Graph Row ────────────────────────────────────────────────────────────
function MiniGraphRow({ step }: { step: ReplayStep }) {
  if (!step.nodes?.length) return null;
  const { nodes, edges = [] } = step;

  // Build node map for edge lookups
  const edgeFor = (fromId: string) => edges.find(e => e.from === fromId);

  return (
    <div className="flex items-center gap-0 flex-nowrap overflow-x-auto">
      {nodes.map((node, i) => (
        <React.Fragment key={node.id}>
          <MiniNodeCard node={node} />
          {i < nodes.length - 1 && (() => {
            const edge = edgeFor(node.id);
            return edge ? (
              <EdgeConnector label={edge.label} type={edge.type} />
            ) : (
              <div className="w-4 shrink-0" />
            );
          })()}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Special Graph Views ───────────────────────────────────────────────────────
function AIHypothesisView() {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-start gap-2 rounded-lg border border-fuchsia-500/40 bg-fuchsia-950/50 px-3 py-2 min-w-[160px]">
        <Brain className="h-4 w-4 text-fuchsia-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-[8px] font-bold uppercase text-fuchsia-400 tracking-wider">AI Hypothesis</div>
          <div className="text-[10px] text-white font-medium leading-snug mt-0.5">
            Financial dispute escalated into homicide
          </div>
        </div>
      </div>
      <div className="text-[8px] uppercase tracking-widest text-slate-500 font-semibold">Supporting Evidence</div>
      <div className="flex items-center gap-1.5">
        {[
          { icon: <Camera className="h-3.5 w-3.5" />, c: "text-blue-400" },
          { icon: <Dna className="h-3.5 w-3.5" />, c: "text-cyan-400" },
          { icon: <Car className="h-3.5 w-3.5" />, c: "text-teal-400" },
          { icon: <FlaskConical className="h-3.5 w-3.5" />, c: "text-violet-400" },
          { icon: <Eye className="h-3.5 w-3.5" />, c: "text-emerald-400" },
        ].map((item, i) => (
          <div key={i} className={`rounded-lg border border-white/10 bg-slate-900/60 p-1.5 ${item.c}`}>
            {item.icon}
          </div>
        ))}
      </div>
    </div>
  );
}

function MovementView() {
  const waypoints = [
    { label: "Home",       who: "victim",  dot: "bg-cyan-400" },
    { label: "",           who: "victim",  dot: "bg-cyan-400" },
    { label: "E-Gate 4",  who: "both",    dot: "bg-yellow-400" },
    { label: "",           who: "suspect", dot: "bg-red-500" },
    { label: "Crime Scene", who: "suspect", dot: "bg-red-500" },
  ];
  return (
    <div className="w-full">
      <div className="text-[8px] uppercase tracking-widest text-slate-500 font-semibold mb-2 text-center">
        Movement Paths Reconstructed
      </div>
      <div className="flex items-center justify-between gap-0 px-1">
        <div className="flex flex-col items-center gap-0.5">
          <Home className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[8px] text-slate-400">Home</span>
        </div>
        {/* Victim path (cyan) */}
        <div className="flex-1 flex items-center">
          <div className="flex-1 h-px bg-cyan-400/60" />
          <div className="h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
          <div className="flex-1 h-px bg-cyan-400/60" />
          <div className="h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30" />
          <div className="flex-1 h-px bg-cyan-400/60" />
        </div>
        {/* E-Gate 4 */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="h-3 w-3 rounded-full bg-yellow-400 ring-2 ring-yellow-400/30" />
          <span className="text-[7px] text-yellow-400 whitespace-nowrap">E-Gate 4</span>
        </div>
        {/* Suspect path (red) - offset below */}
        <div className="flex-1 flex items-center">
          <div className="flex-1 h-px bg-red-500/60 mt-2 border-t border-dashed border-red-500/60 bg-transparent" />
          <div className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-500/30 mt-2" />
          <div className="flex-1 h-px border-t border-dashed border-red-500/60" />
          <div className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-500/30" />
          <div className="flex-1 h-px border-t border-dashed border-red-500/60" />
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <MapPin className="h-3.5 w-3.5 text-red-400" />
          <span className="text-[7px] text-red-400 whitespace-nowrap">Crime Scene</span>
        </div>
      </div>
      <div className="flex justify-between px-8 mt-1">
        <span className="text-[7px] text-cyan-400">— Victim Route</span>
        <span className="text-[7px] text-red-400">- - Suspect Route</span>
      </div>
    </div>
  );
}

function ContradictionView() {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex items-center gap-1.5 rounded-lg border border-emerald-400/60 bg-emerald-950/60 px-2 py-1.5 shrink-0">
        <Eye className="h-3 w-3 text-emerald-300" />
        <div>
          <div className="text-[8px] font-bold text-emerald-300 uppercase">WITNESS</div>
          <div className="text-[9px] text-slate-300">Anandhi K.</div>
        </div>
      </div>
      <div className="flex flex-col items-center w-16 shrink-0">
        <span className="text-[7px] text-slate-500 mb-0.5">Statement</span>
        <div className="flex items-center w-full">
          <div className="flex-1 border-t-2 border-dashed border-red-500/70" style={{ boxShadow: "0 0 4px rgba(239,68,68,0.4)" }} />
          <span className="text-red-400 text-[10px]">›</span>
        </div>
        <span className="text-[7px] text-red-400">Conflict</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg border border-orange-500/60 bg-orange-950/60 px-2 py-1.5 shrink-0">
        <AlertTriangle className="h-3 w-3 text-orange-400" />
        <div>
          <div className="text-[8px] font-bold text-orange-300 uppercase">ANOMALY</div>
          <div className="text-[9px] text-slate-300">Statement Conflict</div>
        </div>
      </div>
      <div className="flex flex-col items-center w-14 shrink-0">
        <div className="flex items-center w-full">
          <div className="flex-1 border-t-2 border-dashed border-red-500/70" />
          <span className="text-red-400 text-[10px]">›</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg border border-blue-400/60 bg-blue-950/60 px-2 py-1.5 shrink-0">
        <Camera className="h-3 w-3 text-blue-300" />
        <div>
          <div className="text-[8px] font-bold text-blue-300 uppercase">CCTV</div>
          <div className="text-[9px] text-slate-300">CCTV-CHN-0418</div>
        </div>
      </div>
    </div>
  );
}

function NarrativeView({ insight }: { insight: string }) {
  return (
    <div className="flex items-stretch gap-3 w-full">
      <div className="flex-1 rounded-lg border border-fuchsia-500/30 bg-fuchsia-950/30 px-3 py-2 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Brain className="h-3 w-3 text-fuchsia-400" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-fuchsia-400">AI Narrative</span>
        </div>
        <p className="text-[9px] leading-relaxed text-slate-200 line-clamp-3">{insight}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 shrink-0 min-w-[100px]">
        <span className="text-[7px] uppercase tracking-widest text-red-400 mb-0.5">Prime Suspect</span>
        <span className="text-[11px] font-bold text-white text-center">S-118 (Vetri)</span>
        <div className="mt-1.5 flex items-center gap-1">
          <div className="h-5 w-5 rounded-full border-2 border-red-500 flex items-center justify-center">
            <span className="text-[8px] font-black text-red-400">90</span>
          </div>
          <span className="text-[7px] text-red-400 font-semibold">High</span>
        </div>
      </div>
    </div>
  );
}

// ── Center Cell ───────────────────────────────────────────────────────────────
function CenterCell({ step }: { step: ReplayStep }) {
  if (step.special === "ai-hypothesis") return <AIHypothesisView />;
  if (step.special === "movement")      return <MovementView />;
  if (step.special === "contradiction") return <ContradictionView />;
  if (step.special === "narrative")     return <NarrativeView insight={step.aiInsight} />;
  return <MiniGraphRow step={step} />;
}

// ── AI Insight Cell ───────────────────────────────────────────────────────────
function InsightCell({ step }: { step: ReplayStep }) {
  const confColor = step.confidence >= 90 ? "text-emerald-400" :
    step.confidence >= 70 ? "text-cyan-400" :
    step.confidence >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] leading-snug text-slate-200">{step.aiInsight}</p>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-px bg-slate-800" />
        <span className={`font-mono text-[10px] font-semibold ${confColor}`}>
          Confidence: {step.confidence}%
        </span>
      </div>
    </div>
  );
}

// ── Bottom Legend ─────────────────────────────────────────────────────────────
const BOTTOM_LEGEND = [
  { label: "Victim", color: "bg-cyan-400" },
  { label: "Suspect", color: "bg-red-500" },
  { label: "Witness", color: "bg-emerald-400" },
  { label: "Location", color: "bg-blue-400" },
  { label: "CCTV", color: "bg-slate-400" },
  { label: "Phone", color: "bg-sky-400" },
  { label: "Vehicle", color: "bg-teal-400" },
  { label: "DNA", color: "bg-cyan-300" },
  { label: "Financial", color: "bg-yellow-400" },
  { label: "Forensic", color: "bg-violet-400" },
  { label: "AI Insight", color: "bg-fuchsia-400" },
  { label: "Anomaly", color: "bg-orange-500" },
];

function mapSeverity(s: string): ReplayStep["severity"] | undefined {
  const m: Record<string, ReplayStep["severity"]> = {
    low: "normal", medium: "suspicious", high: "suspicious", critical: "critical",
    normal: "normal", suspicious: "suspicious",
  };
  return m[s];
}

// ── Main Component ────────────────────────────────────────────────────────────
export function TimelineReplay() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [backendEvents, setBackendEvents] = useState<TimelineEvent[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch backend timeline and merge into STEPS (preserving nodes/edges/special)
  useEffect(() => {
    fetchTimeline("C-2041")
      .then((r) => setBackendEvents(r.timeline))
      .catch(() => { /* keep static STEPS */ });
  }, []);

  const steps = useMemo<ReplayStep[]>(() => {
    if (backendEvents.length === 0) return STEPS;
    const byId = new Map(backendEvents.map((e) => [Number(e.id), e]));
    return STEPS.map((s) => {
      const b = byId.get(s.id);
      if (!b) return s;
      return {
        ...s,
        time:        b.time        ?? s.time,
        title:       b.title       ?? s.title,
        description: b.description ?? s.description,
        confidence:  b.confidence  ?? s.confidence,
        severity:    mapSeverity(b.severity) ?? s.severity,
        aiInsight:   b.aiInsight   ?? s.aiInsight,
      };
    });
  }, [backendEvents]);

  // Auto-scroll to current row
  useEffect(() => {
    rowRefs.current[current]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [current]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    const delay = 2200 / speed;
    const timer = setInterval(() => {
      setCurrent(prev => {
        if (prev >= steps.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, delay);
    return () => clearInterval(timer);
  }, [playing, speed, steps.length]);

  const step = steps[current];
  const progress = ((current + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/8 bg-[#060a18]" style={{ height: "760px" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2 shrink-0 bg-slate-950/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">Timeline Replay</span>
            <span className="text-[9px] text-slate-600">·</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest">Case C-2041</span>
          </div>
          <div className="text-[9px] text-slate-500 tracking-wide">Step by Step Investigation Roadmap</div>
        </div>

        <div className="flex items-center gap-3">
          {/* Relation legend */}
          <div className="hidden lg:flex items-center gap-3 border-r border-white/8 pr-3">
            <div className="flex items-center gap-1">
              <div className="w-6 h-px bg-cyan-400/80" /><span className="text-[8px] text-slate-400">Direct</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-px border-t border-dashed border-slate-400/70" /><span className="text-[8px] text-slate-400">Indirect</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-px border-t-2 border-dashed border-red-500/80" style={{ boxShadow: "0 0 4px rgba(239,68,68,0.4)" }} />
              <span className="text-[8px] text-slate-400">Suspicious</span>
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setPlaying(p => !p); }}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-900/30 px-2.5 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-900/50 transition-colors"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pause" : "Auto Play"}
            </button>
            <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-slate-900/60 px-1 py-1">
              {[0.5, 1, 2].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`rounded px-2 py-0.5 text-[9px] font-bold transition-colors ${speed === s ? "bg-cyan-500/20 text-cyan-300" : "text-slate-500 hover:text-slate-300"}`}>
                  {s}x
                </button>
              ))}
            </div>
            <button onClick={() => { setCurrent(s => Math.max(s - 1, 0)); setPlaying(false); }}
              className="grid h-7 w-7 place-items-center rounded-md border border-white/10 hover:bg-white/8 text-slate-400 transition-colors">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { setCurrent(s => Math.min(s + 1, steps.length - 1)); setPlaying(false); }}
              className="grid h-7 w-7 place-items-center rounded-md border border-white/10 hover:bg-white/8 text-slate-400 transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Column Headers ── */}
      <div className="grid shrink-0 border-b border-white/6 bg-slate-950/40"
        style={{ gridTemplateColumns: "44px 58px 190px 1fr 195px" }}>
        {["STEP", "TIME", "EVENT", "GRAPH STATE (EVIDENCE ADDED STEP BY STEP)", "AI INSIGHT / IMPACT"].map(h => (
          <div key={h} className="px-2 py-1.5 text-[8px] font-bold uppercase tracking-widest text-slate-600 border-r border-white/5 last:border-r-0">
            {h}
          </div>
        ))}
      </div>

      {/* ── Rows ── */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto">
        {steps.map((s, i) => {
          const ec = EVENT_COLORS[s.eventType];
          const isActive = i === current;
          const isPast = i < current;
          return (
            <motion.div
              key={s.id}
              ref={el => { rowRefs.current[i] = el; }}
              onClick={() => { setCurrent(i); setPlaying(false); }}
              className={[
                "grid cursor-pointer border-b border-white/5 transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-cyan-950/25 to-transparent border-l-2 border-l-cyan-500/80"
                  : isPast
                    ? "bg-slate-950/20 border-l-2 border-l-white/5 hover:bg-white/2"
                    : "border-l-2 border-l-transparent hover:bg-white/2",
              ].join(" ")}
              style={{ gridTemplateColumns: "44px 58px 190px 1fr 195px" }}
              animate={isActive ? { backgroundColor: "rgba(8,50,60,0.25)" } : {}}
            >
              {/* Step # */}
              <div className="flex items-start justify-center pt-2.5 px-1 border-r border-white/5">
                <StepBadge number={s.id} eventType={s.eventType} active={isActive} past={isPast} />
              </div>

              {/* Time */}
              <div className="flex items-start pt-2.5 px-2 border-r border-white/5">
                <span className={`font-mono text-[11px] font-bold ${isActive ? ec.text : isPast ? "text-slate-600" : "text-slate-500"}`}>
                  {s.time}
                </span>
              </div>

              {/* Event */}
              <div className="flex flex-col justify-start px-2 py-2 border-r border-white/5 min-w-0">
                <div className={`text-[11px] font-semibold leading-tight mb-0.5 ${isActive ? "text-white" : isPast ? "text-slate-500" : "text-slate-400"}`}>
                  {s.title}
                </div>
                <div className={`text-[9px] leading-snug mb-1 ${isActive ? "text-slate-400" : "text-slate-600"} line-clamp-2`}>
                  {s.description}
                </div>
                <div className={`flex items-center gap-1 ${isActive ? ec.text : "text-slate-600"}`}>
                  <TypeIcon type={s.eventType} className="h-2.5 w-2.5" />
                  <span className="text-[8px] capitalize font-medium">{s.eventType}</span>
                </div>
              </div>

              {/* Center: mini graph */}
              <div className="flex items-center px-3 py-2 min-w-0 border-r border-white/5 overflow-hidden">
                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full"
                    >
                      <CenterCell step={s} />
                    </motion.div>
                  ) : (
                    <motion.div key="inactive" className="w-full opacity-40">
                      <CenterCell step={s} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right: AI Insight */}
              <div className="px-2 py-2">
                <InsightCell step={s} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Progress Bar ── */}
      <div className="shrink-0 border-t border-white/6 px-4 py-1.5 flex items-center gap-3 bg-slate-950/50">
        <span className="font-mono text-[9px] text-slate-600">Step {current + 1} / {steps.length}</span>
        <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
        <span className="font-mono text-[9px] text-slate-500">{step.time}</span>
        <span className={`font-mono text-[9px] font-semibold ${
          step.severity === "critical" ? "text-red-400" :
          step.severity === "suspicious" ? "text-orange-400" : "text-emerald-400"
        }`}>{step.severity.toUpperCase()}</span>
      </div>

      {/* ── Bottom Legend ── */}
      <div className="shrink-0 border-t border-white/5 px-3 py-1.5 flex flex-wrap gap-x-3 gap-y-1 bg-slate-950/60">
        {BOTTOM_LEGEND.map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
            <span className="text-[8px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
