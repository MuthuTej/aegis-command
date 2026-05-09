import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/aegis/Shell";
import { evidenceVault } from "@/data/mock";
import { Database } from "lucide-react";

const statusColor: Record<string, string> = {
  verified:  "border-success/40 text-success",
  anomaly:   "border-danger/40 text-danger",
  review:    "border-warn/40 text-warn",
  processed: "border-primary/40 text-primary",
};

export const Route = createFileRoute("/evidence")({
  head: () => ({ meta: [{ title: "Evidence Vault — AEGIS" }, { name: "description", content: "AI-prioritized evidence vault." }] }),
  component: () => (
    <Shell>
      <div className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h1 className="text-xl font-semibold text-gradient">Evidence Vault</h1>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {evidenceVault.map((e) => (
            <div key={e.id} className="glass rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] text-muted-foreground">{e.id} · {e.case}</div>
                <span className={`rounded-md border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${statusColor[e.status]}`}>{e.status}</span>
              </div>
              <div className="mt-1 text-sm font-medium">{e.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{e.ai}</div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded bg-secondary">
                  <div className="h-full bg-gradient-to-r from-warn to-danger" style={{ width: `${e.priority}%` }} />
                </div>
                <span className="font-mono text-[11px]">{e.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  ),
});
