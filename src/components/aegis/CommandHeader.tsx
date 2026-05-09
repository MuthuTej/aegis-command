import { Search, Mic, Sparkles, Filter, ChevronDown, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { districts } from "@/data/mock";

export function CommandHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-primary/40 bg-background/60 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="neon-text font-mono text-sm tracking-[0.3em]">AEGIS</span>
        <span className="rounded-md border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          v1.4 · TN-Forensic
        </span>
      </div>

      <div className="relative ml-4 flex-1 max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search cases, suspects, FIR, autopsy ID, location, officer…"
          className="h-10 w-full rounded-lg border border-primary/35 bg-input/50 pl-9 pr-28 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary/70 focus:ring-2 focus:ring-primary/30"
        />
        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          <motion.button whileTap={{ scale: 0.95 }} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-primary">
            <Mic className="h-4 w-4" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="flex h-7 items-center gap-1 rounded-md bg-primary/15 px-2 text-xs text-primary hover:bg-primary/25">
            <Sparkles className="h-3.5 w-3.5" /> Ask AEGIS
          </motion.button>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground">
          <Filter className="h-3.5 w-3.5" /> All districts
          <ChevronDown className="h-3 w-3" />
        </button>
        <select className="rounded-md border border-primary/30 bg-secondary/40 px-2 py-1.5 text-xs">
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="rounded-md border border-primary/30 bg-secondary/40 px-2 py-1.5 text-xs">
          <option>All severities</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <button className="relative grid h-9 w-9 place-items-center rounded-md border border-primary/30 bg-secondary/40 hover:text-primary">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger animate-pulse-ring-danger" />
        </button>
      </div>
    </header>
  );
}
