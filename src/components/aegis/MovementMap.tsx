import { useEffect, useRef } from "react";
import L from "leaflet";
import { movementPath } from "@/data/mock";

export function MovementMap() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, {
      center: [13.082, 80.275], zoom: 14,
      scrollWheelZoom: false, zoomControl: false, attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const victim = movementPath.filter((p) => p.who === "victim");
    const suspect1 = movementPath.filter((p) => p.who === "suspect-1");
    const suspect2 = movementPath.filter((p) => p.who === "suspect-2");

    L.polyline(victim.map((p) => [p.lat, p.lng] as [number, number]), {
      color: "#5fd4ff", weight: 3, opacity: 0.9, dashArray: "6 6",
    }).addTo(map);
    L.polyline(suspect1.map((p) => [p.lat, p.lng] as [number, number]), {
      color: "#ff4d6d", weight: 3, opacity: 0.9,
    }).addTo(map);
    L.polyline(suspect2.map((p) => [p.lat, p.lng] as [number, number]), {
      color: "#f59e0b", weight: 3, opacity: 0.9,
    }).addTo(map);

    const colorMap: Record<string, string> = {
      "victim": "#5fd4ff",
      "suspect-1": "#ff4d6d",
      "suspect-2": "#f59e0b",
    };

    movementPath.forEach((p) => {
      const c = colorMap[p.who] || "#ffffff";
      L.circleMarker([p.lat, p.lng], {
        radius: 5, color: c, fillColor: c, fillOpacity: 0.9, weight: 2,
      }).bindTooltip(`${p.who} · ${p.t}`, { direction: "top" }).addTo(map);
    });

    return () => { map.remove(); };
  }, []);
  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl border border-border/50">
      <div ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/20" />
      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col gap-2 rounded-md border border-border/60 bg-background/70 px-3 py-2 text-[10px] backdrop-blur shadow-xl">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full shadow-[0_0_8px_#5fd4ff]" style={{backgroundColor: "#5fd4ff"}} /> Victim</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full shadow-[0_0_8px_#ff4d6d]" style={{backgroundColor: "#ff4d6d"}} /> Suspect 1 (S-118)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full shadow-[0_0_8px_#f59e0b]" style={{backgroundColor: "#f59e0b"}} /> Suspect 2 (S-204)</span>
      </div>
    </div>
  );
}
