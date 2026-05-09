import { autopsy } from "@/data/mock";
import { Activity, Stethoscope } from "lucide-react";

const REGIONS: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
  head:  { cx: 100, cy:  40, rx: 22, ry: 26 },
  torso: { cx: 100, cy: 130, rx: 38, ry: 56 },
  "arm-l": { cx: 56,  cy: 130, rx: 10, ry: 50 },
  "arm-r": { cx: 144, cy: 130, rx: 10, ry: 50 },
  "leg-l": { cx: 84,  cy: 240, rx: 13, ry: 56 },
  "leg-r": { cx: 116, cy: 240, rx: 13, ry: 56 },
};

const sevColor: Record<string, string> = {
  critical: "fill-danger/40 stroke-danger",
  high:     "fill-danger/30 stroke-danger",
  medium:   "fill-warn/30 stroke-warn",
  low:      "fill-success/30 stroke-success",
};

export function AutopsyPanel() {
  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Stethoscope className="h-3.5 w-3.5 text-warn" /> Forensic Body Intelligence
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{autopsy.subject}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[200px_1fr]">
        <div className="relative mx-auto">
          <svg viewBox="0 0 200 310" className="h-[320px] w-[200px]">
            <defs>
              <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(120,200,255,0.35)" />
                <stop offset="100%" stopColor="rgba(120,200,255,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="200" height="310" fill="url(#bodyGlow)" />
            {/* body outline */}
            <ellipse cx="100" cy="40" rx="22" ry="26" className="fill-primary/5 stroke-primary/40" />
            <rect x="62" y="68" width="76" height="120" rx="22" className="fill-primary/5 stroke-primary/40" />
            <rect x="46" y="80" width="20" height="100" rx="10" className="fill-primary/5 stroke-primary/40" />
            <rect x="134" y="80" width="20" height="100" rx="10" className="fill-primary/5 stroke-primary/40" />
            <rect x="70" y="186" width="26" height="110" rx="12" className="fill-primary/5 stroke-primary/40" />
            <rect x="104" y="186" width="26" height="110" rx="12" className="fill-primary/5 stroke-primary/40" />
            {/* injuries */}
            {autopsy.injuries.map((inj, i) => {
              const r = REGIONS[inj.region];
              if (!r) return null;
              return (
                <g key={i} className={sevColor[inj.severity]}>
                  <ellipse cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} strokeWidth={2}>
                    <title>{inj.label}</title>
                  </ellipse>
                  <circle cx={r.cx} cy={r.cy} r="3" className="fill-danger" />
                </g>
              );
            })}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-warn/30 bg-warn/5 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-warn">
              <Activity className="h-3 w-3" /> Estimated Time of Death
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <div className="font-mono text-xl text-foreground">{autopsy.todRange}</div>
              <div className="text-[11px] text-muted-foreground">confidence {autopsy.todConfidence}%</div>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded bg-secondary">
              <div className="h-full bg-gradient-to-r from-warn to-primary" style={{ width: `${autopsy.todConfidence}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {autopsy.indicators.map((m) => (
              <div key={m.name} className="rounded-md border border-border/50 bg-secondary/30 p-2">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{m.name}</div>
                <div className="font-mono text-xs text-foreground">{m.value}</div>
                <div className="text-[10px] text-muted-foreground">{m.note}</div>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-border/50 p-2">
            <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">Toxicology</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {autopsy.toxicology.map((t) => (
                <div key={t.sub} className={`rounded border px-2 py-1 ${t.flag ? "border-warn/40 text-warn" : "border-border/50 text-muted-foreground"}`}>
                  <div className="text-[10px] opacity-70">{t.sub}</div>
                  <div className="font-mono text-[11px]">{t.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
