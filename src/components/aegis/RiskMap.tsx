import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { heatmapZones } from "@/data/mock";

export function RiskMap() {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-xl border border-border/50">
      <MapContainer
        center={[11.1271, 78.6569]}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {heatmapZones.map((z) => {
          const r = 8 + (z.risk / 100) * 22;
          const color = z.risk > 80 ? "#ff4d6d" : z.risk > 60 ? "#ffb454" : "#5fd4ff";
          return (
            <CircleMarker
              key={z.district}
              center={[z.lat, z.lng]}
              radius={r}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <div className="text-xs">
                  <div className="font-semibold">{z.district}</div>
                  <div>Crimes: {z.crimes}</div>
                  <div>Risk: {z.risk}</div>
                  <div>Officers: {z.officers}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-primary/20" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-border/60 bg-background/70 px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
        AI Risk Heatmap · Tamil Nadu
      </div>
    </div>
  );
}
