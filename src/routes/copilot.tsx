import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/aegis/Shell";
import { Copilot } from "@/components/aegis/Copilot";

export const Route = createFileRoute("/copilot")({
  head: () => ({ meta: [{ title: "AI Copilot — AEGIS" }, { name: "description", content: "Holographic investigation assistant." }] }),
  component: () => (
    <Shell>
      <div className="grid place-items-center p-10">
        <div className="glass-strong max-w-xl rounded-2xl p-8 text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-primary">AEGIS Copilot</div>
          <h1 className="mt-2 text-3xl font-semibold text-gradient">Your investigation co-pilot</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Summarize evidence, explain theories, recommend next steps and surface suspicious patterns.
            Open the floating assistant in the bottom-right to begin.
          </p>
        </div>
      </div>
      <Copilot />
    </Shell>
  ),
});
