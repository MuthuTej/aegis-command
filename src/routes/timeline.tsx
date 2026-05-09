import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/aegis/Shell";
import { TimelineReplay } from "@/components/aegis/TimelineReplay";
import { MovementMap } from "@/components/aegis/MovementMap";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Timeline Replay — AEGIS" }, { name: "description", content: "Cinematic timeline & movement replay." }] }),
  component: () => (
    <Shell>
      <div className="grid gap-4 p-5 lg:grid-cols-2">
        <TimelineReplay />
        <MovementMap />
      </div>
    </Shell>
  ),
});
