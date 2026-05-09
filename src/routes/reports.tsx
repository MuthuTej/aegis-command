import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/aegis/Shell";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

const trend = Array.from({ length: 14 }, (_, i) => ({
  d: `D${i+1}`, cases: 80 + Math.round(Math.sin(i/2)*20+i*2), flagged: 10 + Math.round(Math.cos(i/3)*5+i),
}));

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — AEGIS" }, { name: "description", content: "Forensic intelligence reports." }] }),
  component: () => (
    <Shell>
      <div className="space-y-4 p-5">
        <h1 className="text-xl font-semibold text-gradient">Intelligence Reports</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-xl p-4">
            <div className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">Cases trend (14 days)</div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,200,255,0.12)" />
                  <XAxis dataKey="d" stroke="#7e8aa1" fontSize={11} />
                  <YAxis stroke="#7e8aa1" fontSize={11} />
                  <Tooltip contentStyle={{ background: "rgba(15,20,35,0.9)", border: "1px solid rgba(120,200,255,0.3)" }} />
                  <Line type="monotone" dataKey="cases" stroke="#5fd4ff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="flagged" stroke="#ff4d6d" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="mb-2 text-[11px] uppercase tracking-widest text-muted-foreground">Flagged by district</div>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,200,255,0.12)" />
                  <XAxis dataKey="d" stroke="#7e8aa1" fontSize={11} />
                  <YAxis stroke="#7e8aa1" fontSize={11} />
                  <Tooltip contentStyle={{ background: "rgba(15,20,35,0.9)", border: "1px solid rgba(120,200,255,0.3)" }} />
                  <Bar dataKey="flagged" fill="#a48bff" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  ),
});
