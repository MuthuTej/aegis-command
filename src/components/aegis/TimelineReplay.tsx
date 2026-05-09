import { useState } from "react";
import { timelineEvents } from "@/data/mock";
import { Play, Pause, Rewind, FastForward, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function TimelineReplay() {
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(4);

  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Timeline · Cinematic Replay</div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIdx(Math.max(0, idx - 1))} className="grid h-7 w-7 place-items-center rounded-md border border-border/60 hover:text-primary"><Rewind className="h-3.5 w-3.5" /></button>
          <button onClick={() => setPlaying((p) => !p)} className="grid h-8 w-8 place-items-center rounded-md bg-primary/20 text-primary hover:bg-primary/30">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button onClick={() => setIdx(Math.min(timelineEvents.length - 1, idx + 1))} className="grid h-7 w-7 place-items-center rounded-md border border-border/60 hover:text-primary"><FastForward className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="relative h-2 overflow-hidden rounded bg-secondary">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-neon-2"
          animate={{ width: `${((idx + 1) / timelineEvents.length) * 100}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{timelineEvents[0].t}</span><span>{timelineEvents[timelineEvents.length - 1].t}</span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {timelineEvents.map((e, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={[
              "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-[11px] transition",
              i === idx
                ? "border-primary/60 bg-primary/10 text-foreground glow-primary"
                : "border-border/40 bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            ].join(" ")}
          >
            <span className="font-mono text-[10px] text-primary">{e.t}</span>
            <span className="flex-1 truncate">{e.title}</span>
            {e.alert && <AlertTriangle className="h-3 w-3 text-danger" />}
            <span className="font-mono text-[10px] text-muted-foreground">{e.conf}%</span>
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-2 text-[12px] text-foreground/90">
        <span className="mr-2 font-mono text-[10px] text-primary">AEGIS ▸</span>
        {idx === 4
          ? "At 20:42, suspect S-118 and the victim are co-located at E-Gate 4. Altercation captured."
          : timelineEvents[idx].title + "."}
      </div>
    </div>
  );
}
