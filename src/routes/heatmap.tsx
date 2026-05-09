import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/aegis/Shell";
import { RiskMap } from "@/components/aegis/RiskMap";
import { heatmapZones } from "@/data/data";

export const Route = createFileRoute("/heatmap")({
  head: () => ({ meta: [{ title: "Heatmaps — AEGIS" }, { name: "description", content: "Crime risk heatmaps across Tamil Nadu." }] }),
  component: () => (
    <Shell>
      <div className="space-y-4 p-5">
        <h1 className="text-xl font-semibold text-gradient">Risk Heatmaps</h1>
        <RiskMap />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {heatmapZones.map((z) => (
            <div key={z.district} className="glass rounded-xl p-3">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{z.district}</div>
              <div className="mt-1 font-mono text-2xl">{z.risk}</div>
              <div className="text-[11px] text-muted-foreground">{z.crimes} crimes · {z.officers} officers</div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  ),
});
