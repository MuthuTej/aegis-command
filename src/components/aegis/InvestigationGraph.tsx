import { useMemo, useState } from "react";
import ReactFlow, {
  Background, BackgroundVariant, Controls, MiniMap,
  type Node, type Edge,
} from "reactflow";
import { caseGraph } from "@/data/mock";
import { EvidenceNode } from "./EvidenceNode";

const nodeTypes = { evidence: EvidenceNode };

export function InvestigationGraph({ onSelect }: { onSelect?: (id: string | null) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const ns: Node[] = caseGraph.nodes.map((n) => ({
      id: n.id,
      type: "evidence",
      position: { x: n.x, y: n.y },
      data: { label: n.label, type: n.type, meta: n.meta, danger: n.danger },
    }));
    const es: Edge[] = caseGraph.edges.map((e) => ({
      id: e.id, source: e.source, target: e.target,
      animated: true,
      className: e.danger ? "danger" : "",
      style: { strokeWidth: e.danger ? 2 : 1.4 },
    }));
    return { nodes: ns, edges: es };
  }, []);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_e, n) => { setSelected(n.id); onSelect?.(n.id); }}
        onPaneClick={() => { setSelected(null); onSelect?.(null); }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="rgba(120,200,255,0.18)" />
        <MiniMap
          maskColor="rgba(8,12,24,0.7)"
          nodeColor={(n) => (n.data?.danger ? "#ff4d6d" : "#5fd4ff")}
          style={{ background: "rgba(15,20,35,0.7)", border: "1px solid rgba(120,200,255,0.25)" }}
          pannable zoomable
        />
        <Controls position="bottom-right" showInteractive={false} />
      </ReactFlow>
      {selected && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-primary/40 bg-background/80 px-2 py-1 font-mono text-[10px] text-primary backdrop-blur">
          Selected node: {selected}
        </div>
      )}
    </div>
  );
}
