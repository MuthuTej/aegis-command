import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/aegis/Shell";
import { StatCard } from "@/components/aegis/StatCard";
import { RiskMap } from "@/components/aegis/RiskMap";
import { LiveFeed } from "@/components/aegis/LiveFeed";
import { CaseTable } from "@/components/aegis/CaseTable";
import {
  FolderOpen, ShieldAlert, Stethoscope, Sparkles, AlertTriangle, FileQuestion,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AEGIS — Forensic Command Center" },
      { name: "description", content: "AI-powered forensic triage & investigation intelligence platform." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Shell>
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <StatCard label="Active Cases"        value={142} icon={FolderOpen}    sub="↑ 8 today"     trend="+5.2% vs week" />
          <StatCard label="High Risk Cases"     value={37}  icon={ShieldAlert}   tone="danger"  sub="3 critical"   trend="2 escalated" />
          <StatCard label="Autopsy Pending"     value={19}  icon={Stethoscope}   tone="warn"    sub="4 overdue"    trend="avg 36h" />
          <StatCard label="AI Flagged Cases"    value={26}  icon={Sparkles}      tone="neon-2"  sub="auto-tagged"  trend="confidence ↑" />
          <StatCard label="Contradictions"      value={58}  icon={AlertTriangle} tone="danger"  sub="across cases" trend="3 new today" />
          <StatCard label="Missing Evidence"    value={11}  icon={FileQuestion}  tone="warn"    sub="DNA / CCTV"   trend="2 requested" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><RiskMap /></div>
          <LiveFeed />
        </div>

        <CaseTable />
      </div>
    </Shell>
  );
}
