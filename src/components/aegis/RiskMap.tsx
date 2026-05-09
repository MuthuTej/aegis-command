import { useEffect, useRef } from "react";
import L from "leaflet";
import { heatmapZones } from "@/data/mock";

export function RiskMap() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, {
      center: [11.1271, 78.6569],
      zoom: 6,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    heatmapZones.forEach((z) => {
      const r = 8 + (z.risk / 100) * 22;
      const color = z.risk > 80 ? "#ff4d6d" : z.risk > 60 ? "#ffb454" : "#5fd4ff";
      const m = L.circleMarker([z.lat, z.lng], { radius: r, color, fillColor: color, fillOpacity: 0.35, weight: 2 }).addTo(map);
      m.bindTooltip(
        `<div style="font-size:11px"><b>${z.district}</b><br/>Crimes: ${z.crimes}<br/>Risk: ${z.risk}<br/>Officers: ${z.officers}</div>`,
        { direction: "top" }
      );
    });
    return () => { map.remove(); };
  }, []);
  return (
    <div className="relative h-[360px] overflow-hidden rounded-xl border border-border/50">
      <div ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/20" />
      <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-md border border-border/60 bg-background/70 px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
        AI Risk Heatmap · Tamil Nadu
      </div>
    </div>
  );
}
