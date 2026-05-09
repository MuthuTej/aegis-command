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
    const suspect = movementPath.filter((p) => p.who === "suspect");

    L.polyline(victim.map((p) => [p.lat, p.lng] as [number, number]), {
      color: "#5fd4ff", weight: 3, opacity: 0.9, dashArray: "6 6",
    }).addTo(map);
    L.polyline(suspect.map((p) => [p.lat, p.lng] as [number, number]), {
      color: "#ff4d6d", weight: 3, opacity: 0.9,
    }).addTo(map);

    movementPath.forEach((p) => {
      const c = p.who === "victim" ? "#5fd4ff" : "#ff4d6d";
      L.circleMarker([p.lat, p.lng], {
        radius: 5, color: c, fillColor: c, fillOpacity: 0.9, weight: 2,
      }).bindTooltip(`${p.who} · ${p.t}`, { direction: "top" }).addTo(map);
    });

    return () => { map.remove(); };
  }, []);
  return (
    <div className="relative h-[300px] overflow-hidden rounded-xl border border-border/50">
      <div ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/20" />
      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex items-center gap-3 rounded-md border border-border/60 bg-background/70 px-2 py-1 text-[10px] backdrop-blur">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-neon" /> Victim</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" /> Suspect</span>
      </div>
    </div>
  );
}
