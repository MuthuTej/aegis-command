import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background, BackgroundVariant, Controls, MiniMap,
  type Node, type Edge,
  EdgeLabelRenderer, getBezierPath,
  type EdgeProps,
} from "reactflow";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, Brain, AlertTriangle, Clock, ShieldCheck, TrendingUp,
} from "lucide-react";
import { caseGraph, type ForensicNode, type ForensicEdge, type RelationType } from "@/data/mock";
import { EvidenceNode } from "./EvidenceNode";

// ── Node Types ────────────────────────────────────────────────────────────────
const nodeTypes = { evidence: EvidenceNode };

// ── Edge Color / Style Map ────────────────────────────────────────────────────
const EDGE_STYLE: Record<RelationType, {
  stroke: string; dashArray?: string; animated: boolean;
  glow: string; labelBg: string; labelText: string; particle: string;
}> = {
  dna:           { stroke: "#22d3ee", dashArray: undefined, animated: true,  glow: "drop-shadow(0 0 8px rgba(34,211,238,0.9))",  labelBg: "rgba(8,50,60,0.95)",   labelText: "#67e8f9", particle: "#22d3ee" },
  confirmed:     { stroke: "#38bdf8", dashArray: undefined, animated: true,  glow: "drop-shadow(0 0 6px rgba(56,189,248,0.7))",  labelBg: "rgba(5,40,60,0.9)",    labelText: "#7dd3fc", particle: "#38bdf8" },
  suspicious:    { stroke: "#ef4444", dashArray: "8 5",    animated: true,  glow: "drop-shadow(0 0 8px rgba(239,68,68,0.8))",   labelBg: "rgba(40,5,5,0.95)",    labelText: "#fca5a5", particle: "#ef4444" },
  behavioral:    { stroke: "#f97316", dashArray: "6 4",    animated: true,  glow: "drop-shadow(0 0 6px rgba(249,115,22,0.7))",  labelBg: "rgba(40,15,0,0.9)",    labelText: "#fdba74", particle: "#f97316" },
  financial:     { stroke: "#eab308", dashArray: "5 4",    animated: true,  glow: "drop-shadow(0 0 6px rgba(234,179,8,0.7))",   labelBg: "rgba(40,35,0,0.9)",    labelText: "#fde047", particle: "#eab308" },
  timeline:      { stroke: "#a78bfa", dashArray: undefined, animated: true,  glow: "drop-shadow(0 0 7px rgba(167,139,250,0.7))", labelBg: "rgba(25,10,50,0.9)",   labelText: "#c4b5fd", particle: "#a78bfa" },
  environmental: { stroke: "#34d399", dashArray: "4 6",    animated: false, glow: "drop-shadow(0 0 5px rgba(52,211,153,0.5))",  labelBg: "rgba(5,35,20,0.9)",    labelText: "#6ee7b7", particle: "#34d399" },
  weak:          { stroke: "#475569", dashArray: "3 6",    animated: false, glow: "",                                           labelBg: "rgba(15,20,30,0.85)",  labelText: "#94a3b8", particle: "#64748b" },
};

// ── Custom Forensic Edge ──────────────────────────────────────────────────────
function ForensicEdge({
  id, sourceX, sourceY, targetX, targetY, data,
  sourcePosition, targetPosition, selected,
}: EdgeProps) {
  const rt: RelationType = data?.relationType ?? "confirmed";
  const style = EDGE_STYLE[rt];
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const isActive = data?.highlighted || selected;

  const strokeOpacity = data?.dimmed ? 0.08 : isActive ? 1 : 0.65;
  const strokeWidth = isActive ? 2.2 : 1.4;

  return (
    <>
      {/* Glow layer */}
      {style.glow && !data?.dimmed && (
        <path
          d={edgePath}
          fill="none"
          stroke={style.stroke}
          strokeWidth={strokeWidth + 4}
          strokeOpacity={isActive ? 0.25 : 0.12}
          strokeDasharray={style.dashArray}
          style={{ filter: style.glow }}
        />
      )}
      {/* Main path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={style.stroke}
        strokeWidth={strokeWidth}
        strokeOpacity={strokeOpacity}
        strokeDasharray={style.dashArray}
        className={style.animated && !data?.dimmed ? "forensic-edge-animated" : ""}
        style={{ transition: "stroke-opacity 0.3s, stroke-width 0.2s" }}
      />
      {/* Particle dot */}
      {style.animated && !data?.dimmed && (
        <circle r="3.5" fill={style.particle} opacity={data?.dimmed ? 0 : 0.9} className="forensic-particle">
          <animateMotion dur={rt === "suspicious" ? "1.4s" : rt === "dna" ? "1.8s" : "2.2s"} repeatCount="indefinite">
            <mpath href={`#${id}`} />
          </animateMotion>
        </circle>
      )}
      {/* Edge Label */}
      {!data?.dimmed && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan forensic-edge-label"
            style={{
              position: "absolute",
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              cursor: "pointer",
            }}
            onClick={data?.onEdgeClick}
          >
            <div
              className="flex items-center gap-1 rounded-full px-2 py-0.5 border text-[9px] font-semibold tracking-wide whitespace-nowrap select-none"
              style={{
                background: style.labelBg,
                color: style.labelText,
                borderColor: style.stroke + "55",
                boxShadow: isActive ? `0 0 12px ${style.stroke}44` : "none",
                opacity: strokeOpacity > 0.3 ? 1 : 0,
                transition: "opacity 0.3s, box-shadow 0.2s",
              }}
            >
              {data?.label}
              <span className="ml-1 opacity-70">{data?.confidence}%</span>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = { forensic: ForensicEdge };

// ── AI Insight Panel ──────────────────────────────────────────────────────────
function AIInsightPanel({ node, onClose }: { node: ForensicNode; onClose: () => void }) {
  const isSuspect = node.zone === "suspect";
  const isVictim  = node.zone === "victim";
  return (
    <motion.div
      initial={{ opacity: 0, x: -32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="pointer-events-auto absolute bottom-4 left-4 z-50 w-72 rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl"
    >
      {/* Header */}
      <div className={`flex items-center justify-between rounded-t-xl px-3 py-2 ${
        isVictim ? "bg-cyan-900/40" : isSuspect ? "bg-red-900/40" : "bg-slate-800/60"
      }`}>
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">AI Insight</span>
        </div>
        <button onClick={onClose} className="rounded p-0.5 hover:bg-white/10 transition-colors">
          <X className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
      {/* Node identity */}
      <div className="px-3 pt-2.5 pb-2 border-b border-white/8">
        <div className="text-sm font-bold text-white">{node.label}</div>
        {node.sublabel && <div className="text-[10px] text-slate-400 mt-0.5">{node.sublabel}</div>}
        {node.riskLevel && (
          <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
            node.riskLevel === "critical" ? "bg-red-600/80 text-white" :
            node.riskLevel === "high"     ? "bg-orange-500/70 text-white" :
            "bg-yellow-500/60 text-black"
          }`}>{node.riskLevel} RISK</span>
        )}
      </div>
      {/* Insight */}
      <div className="px-3 py-2.5">
        <div className="flex gap-2">
          <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-slate-200">{node.aiInsight ?? "No insight available."}</p>
        </div>
      </div>
      {/* Stats row */}
      {node.confidence != null && (
        <div className="border-t border-white/8 px-3 py-2 flex items-center gap-3">
          <TrendingUp className="h-3 w-3 text-emerald-400" />
          <span className="text-[9px] text-slate-400 uppercase tracking-wider">AI Confidence</span>
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400" style={{ width: `${node.confidence}%` }} />
          </div>
          <span className="text-[10px] text-emerald-300 font-mono">{node.confidence}%</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Evidence Explanation Panel ────────────────────────────────────────────────
function EvidencePanel({ edge, onClose }: { edge: ForensicEdge; onClose: () => void }) {
  const rt = edge.relationType;
  const style = EDGE_STYLE[rt];
  return (
    <motion.div
      initial={{ opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="pointer-events-auto absolute bottom-4 right-4 z-50 w-72 rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl"
    >
      <div className="flex items-center justify-between rounded-t-xl px-3 py-2 bg-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: style.stroke, boxShadow: `0 0 6px ${style.stroke}` }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: style.labelText }}>
            {edge.label}
          </span>
        </div>
        <button onClick={onClose} className="rounded p-0.5 hover:bg-white/10 transition-colors">
          <X className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>
      <div className="px-3 py-2.5 space-y-2">
        <InfoRow icon={<ShieldCheck className="h-3 w-3 text-emerald-400" />} label="Confidence" value={`${edge.confidence}%`} />
        {edge.timestamp && <InfoRow icon={<Clock className="h-3 w-3 text-violet-400" />} label="Timestamp" value={edge.timestamp} />}
        {edge.source_ref && <InfoRow icon={<AlertTriangle className="h-3 w-3 text-yellow-400" />} label="Source" value={edge.source_ref} />}
        <div className="border-t border-white/8 pt-2">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Forensic Reasoning</div>
          <p className="text-[11px] leading-relaxed text-slate-200">{edge.reasoning ?? "—"}</p>
        </div>
        <div className="mt-1">
          <div className="text-[9px] text-slate-500 uppercase mb-0.5">Relation Type</div>
          <span className="rounded px-2 py-0.5 text-[9px] font-semibold uppercase" style={{ background: style.labelBg, color: style.labelText, border: `1px solid ${style.stroke}44` }}>
            {rt}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="text-[9px] uppercase text-slate-500 w-16 shrink-0 mt-0.5">{label}</span>
      <span className="text-[11px] text-slate-200 font-medium">{value}</span>
    </div>
  );
}

// ── Mini Legend ───────────────────────────────────────────────────────────────
const LEGEND_ITEMS: { label: string; rt: RelationType }[] = [
  { label: "DNA / Biometric",  rt: "dna"           },
  { label: "Confirmed",        rt: "confirmed"     },
  { label: "Suspicious",       rt: "suspicious"    },
  { label: "Behavioral",       rt: "behavioral"    },
  { label: "Financial",        rt: "financial"     },
  { label: "Timeline",         rt: "timeline"      },
  { label: "Environmental",    rt: "environmental" },
  { label: "Weak Evidence",    rt: "weak"          },
];
const ZONE_LEGEND = [
  { label: "Victim",      color: "#22d3ee" },
  { label: "Suspect",     color: "#ef4444" },
  { label: "Forensic",    color: "#38bdf8" },
  { label: "Timeline",    color: "#a78bfa" },
  { label: "Environment", color: "#34d399" },
];

function MiniLegend() {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute top-3 right-3 z-40 pointer-events-auto">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-950/80 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 backdrop-blur hover:bg-slate-900/90 transition-colors"
      >
        <div className="h-2 w-2 rounded-full bg-cyan-400" />
        LEGEND
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 w-48 rounded-xl border border-white/10 bg-slate-950/97 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-2 text-[9px] uppercase tracking-widest text-slate-500 font-semibold">Edge Relations</div>
            <div className="space-y-1.5">
              {LEGEND_ITEMS.map(({ label, rt }) => {
                const s = EDGE_STYLE[rt];
                return (
                  <div key={rt} className="flex items-center gap-2">
                    <div className="flex h-2 w-8 items-center">
                      <div className="h-px flex-1" style={{ background: s.stroke, opacity: 0.85,
                        backgroundImage: s.dashArray ? `repeating-linear-gradient(to right, ${s.stroke} 0, ${s.stroke} 4px, transparent 4px, transparent 8px)` : undefined }} />
                    </div>
                    <span className="text-[9px] text-slate-300">{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-2.5 border-t border-white/8 pt-2">
              <div className="mb-1.5 text-[9px] uppercase tracking-widest text-slate-500 font-semibold">Node Zones</div>
              {ZONE_LEGEND.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                  <span className="text-[9px] text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function InvestigationGraph({ onSelect }: { onSelect?: (id: string | null) => void }) {
  const [selectedNodeId, setSelectedNodeId]   = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId]   = useState<string | null>(null);
  const [hoveredNodeId,  setHoveredNodeId]    = useState<string | null>(null);

  const selectedNode = useMemo(
    () => caseGraph.nodes.find(n => n.id === selectedNodeId) ?? null,
    [selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => caseGraph.edges.find(e => e.id === selectedEdgeId) ?? null,
    [selectedEdgeId],
  );

  // ── Build adjacency map for hover highlighting ─────────────────────────────
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of caseGraph.edges) {
      if (!map.has(e.source)) map.set(e.source, new Set());
      if (!map.has(e.target)) map.set(e.target, new Set());
      map.get(e.source)!.add(e.target);
      map.get(e.target)!.add(e.source);
    }
    return map;
  }, []);

  // ── Build connected edge IDs for hovered node ─────────────────────────────
  const connectedEdgeIds = useMemo<Set<string>>(() => {
    if (!hoveredNodeId) return new Set();
    const s = new Set<string>();
    for (const e of caseGraph.edges) {
      if (e.source === hoveredNodeId || e.target === hoveredNodeId) s.add(e.id);
    }
    return s;
  }, [hoveredNodeId]);

  const connectedNodeIds = useMemo<Set<string>>(() => {
    if (!hoveredNodeId) return new Set();
    const neighbors = adjacencyMap.get(hoveredNodeId) ?? new Set();
    return new Set([hoveredNodeId, ...neighbors]);
  }, [hoveredNodeId, adjacencyMap]);

  // ── Build ReactFlow nodes ─────────────────────────────────────────────────
  const nodes: Node[] = useMemo(() => caseGraph.nodes.map(n => {
    const isDimmed = hoveredNodeId !== null && !connectedNodeIds.has(n.id);
    return {
      id: n.id,
      type: "evidence",
      position: { x: n.x, y: n.y },
      data: {
        ...n,
        dimmed: isDimmed,
      },
      style: {
        opacity: isDimmed ? 0.2 : 1,
        transition: "opacity 0.3s",
      },
      selected: n.id === selectedNodeId,
    };
  }), [hoveredNodeId, connectedNodeIds, selectedNodeId]);

  // ── Build ReactFlow edges ─────────────────────────────────────────────────
  const edges: Edge[] = useMemo(() => caseGraph.edges.map(e => {
    const isDimmed = hoveredNodeId !== null && !connectedEdgeIds.has(e.id);
    const isHighlighted = hoveredNodeId !== null && connectedEdgeIds.has(e.id);
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: "forensic",
      data: {
        ...e,
        dimmed: isDimmed,
        highlighted: isHighlighted,
        onEdgeClick: () => { setSelectedEdgeId(e.id); setSelectedNodeId(null); },
      },
      selected: e.id === selectedEdgeId,
    };
  }), [hoveredNodeId, connectedEdgeIds, selectedEdgeId]);

  const onNodeClick = useCallback((_: React.MouseEvent, n: Node) => {
    setSelectedNodeId(n.id);
    setSelectedEdgeId(null);
    onSelect?.(n.id);
  }, [onSelect]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    onSelect?.(null);
  }, [onSelect]);

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, n: Node) => {
    setHoveredNodeId(n.id);
  }, []);
  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.3}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        defaultEdgeOptions={{ type: "forensic" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="rgba(100,180,255,0.12)" />
        <MiniMap
          maskColor="rgba(6,10,20,0.75)"
          nodeColor={n => {
            const zone = n.data?.zone;
            if (zone === "victim")        return "#22d3ee";
            if (zone === "suspect")       return "#ef4444";
            if (zone === "forensic")      return "#38bdf8";
            if (zone === "timeline")      return "#a78bfa";
            if (zone === "environmental") return "#34d399";
            return "#94a3b8";
          }}
          style={{
            background: "rgba(8,12,24,0.85)",
            border: "1px solid rgba(100,180,255,0.15)",
            borderRadius: 10,
          }}
          pannable
          zoomable
        />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>

      {/* Mini Legend */}
      <MiniLegend />

      {/* AI Insight Panel */}
      <AnimatePresence>
        {selectedNode && (
          <AIInsightPanel
            node={selectedNode}
            onClose={() => { setSelectedNodeId(null); onSelect?.(null); }}
          />
        )}
      </AnimatePresence>

      {/* Evidence Explanation Panel */}
      <AnimatePresence>
        {selectedEdge && (
          <EvidencePanel
            edge={selectedEdge}
            onClose={() => setSelectedEdgeId(null)}
          />
        )}
      </AnimatePresence>

      {/* Header badge */}
      <div className="pointer-events-none absolute left-3 top-3 z-40">
        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-slate-950/80 px-3 py-1.5 backdrop-blur">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
            Living Evidence Canvas
          </span>
          <span className="text-[10px] text-slate-500">· Case C-2041</span>
        </div>
      </div>
    </div>
  );
}
