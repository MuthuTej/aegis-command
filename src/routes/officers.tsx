import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/aegis/Shell";
import { officers } from "@/data/data";

export const Route = createFileRoute("/officers")({
  head: () => ({ meta: [{ title: "Officers — AEGIS" }, { name: "description", content: "Investigation officer directory." }] }),
  component: () => (
    <Shell>
      <div className="space-y-4 p-5">
        <h1 className="text-xl font-semibold text-gradient">Officers</h1>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {officers.map((o) => (
            <div key={o.id} className="glass flex items-center gap-3 rounded-xl p-3">
              <div className="relative grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary/30 to-neon-2/30 font-semibold">
                {o.name.split(" ").pop()?.slice(0,2).toUpperCase()}
                <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-background ${o.online ? "bg-success animate-pulse-ring" : "bg-muted-foreground"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{o.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{o.id} · {o.district}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base">{o.cases}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">cases</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  ),
});
