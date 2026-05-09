import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { heatmapZones, movementPath } from "@/data/data";
import { useDistrictFilter } from "@/contexts/DistrictFilterContext";
import { fetchMovement, type MovementPoint } from "@/lib/api";

/** Mock movement replay is anchored to case C-2041 (Chennai). */
const MOVEMENT_DISTRICT = "Chennai";

function buildMap(container: HTMLDivElement, points: MovementPoint[]) {
  const map = L.map(container, {
    center: [13.082, 80.275], zoom: 14,
    scrollWheelZoom: false, zoomControl: false, attributionControl: false,
  });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  const victim  = points.filter((p) => p.type === "victim");
  const suspect = points.filter((p) => p.type === "suspect");
  const crime   = points.filter((p) => p.type === "crime");

  if (victim.length > 1)
    L.polyline(victim.map((p) => [p.lat, p.lng] as [number, number]), {
      color: "#5fd4ff", weight: 3, opacity: 0.9, dashArray: "6 6",
    }).addTo(map);

  if (suspect.length > 1)
    L.polyline(suspect.map((p) => [p.lat, p.lng] as [number, number]), {
      color: "#ff4d6d", weight: 3, opacity: 0.9,
    }).addTo(map);

  const colorMap: Record<string, string> = {
    victim:  "#5fd4ff",
    suspect: "#ff4d6d",
    crime:   "#f59e0b",
  };

  [...victim, ...suspect, ...crime].forEach((p) => {
    const c = colorMap[p.type ?? "victim"] ?? "#ffffff";
    L.circleMarker([p.lat, p.lng], {
      radius: 5, color: c, fillColor: c, fillOpacity: 0.9, weight: 2,
    }).bindTooltip(`${p.label} · ${p.time}`, { direction: "top" }).addTo(map);
  });

  return map;
}

// Convert legacy format to MovementPoint format
function legacyToPoints(path: typeof movementPath): MovementPoint[] {
  return path.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    label: p.action,
    time: p.t,
    type: p.who === "victim" ? "victim" : "suspect",
  }));
}

export function MovementMap() {
  const { district: districtFilter } = useDistrictFilter();
  const ref = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<MovementPoint[]>(legacyToPoints(movementPath));

  const showReplay =
    districtFilter === null || districtFilter === MOVEMENT_DISTRICT;

  useEffect(() => {
    fetchMovement("C-2041")
      .then((r) => setPoints(r.movement))
      .catch(() => { /* keep fallback data */ });
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const effectivePoints = showReplay ? points : [];
    const map = buildMap(ref.current, effectivePoints);

    if (!showReplay && districtFilter) {
      const z = heatmapZones.find((x) => x.district === districtFilter);
      if (z) map.setView([z.lat, z.lng], 11);
      else map.setView([11.1271, 78.6569], 6);
    }

    return () => {
      map.remove();
    };
  }, [points, showReplay, districtFilter]);

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-xl border border-border/50">
      <div ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/20" />
      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col gap-2 rounded-md border border-border/60 bg-background/70 px-3 py-2 text-[10px] backdrop-blur shadow-xl">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full shadow-[0_0_8px_#5fd4ff]" style={{ backgroundColor: "#5fd4ff" }} /> Victim</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full shadow-[0_0_8px_#ff4d6d]" style={{ backgroundColor: "#ff4d6d" }} /> Suspect (S-118)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full shadow-[0_0_8px_#f59e0b]" style={{ backgroundColor: "#f59e0b" }} /> Crime Scene</span>
      </div>
      {!showReplay && districtFilter && (
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[500] rounded-md border border-primary/35 bg-background/85 px-3 py-2 text-center text-[11px] text-muted-foreground backdrop-blur">
          Movement replay is only modeled for <span className="font-medium text-foreground">{MOVEMENT_DISTRICT}</span> (C-2041).
          Map centered on <span className="font-medium text-foreground">{districtFilter}</span>.
        </div>
      )}
    </div>
  );
}
