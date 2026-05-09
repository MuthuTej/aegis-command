import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const SUGGESTIONS = [
  "Show strongest suspect",
  "Why is CCTV-0418 suspicious?",
  "Replay victim movements",
  "Find contradictions",
];

const REPLIES: Record<string, string> = {
  default: "Cross-referencing graph, autopsy, and timeline… The strongest suspect is S-118 (Vetri) at 87% confidence — supported by DNA match D-77 (99.2%), UPI ₹40,000 transfer at 20:22, and tower overlap during 20:14–20:51.",
  "Why is CCTV-0418 suspicious?": "CCTV-0418 shows a 6-minute timestamp drift vs the station master clock and produces an impossible travel-time chain (Central → Royapuram in 4m). Likelihood of tampering: 73%.",
  "Replay victim movements": "Loading reconstructed movement: Triplicane 18:10 → Central E-Gate 4 20:14 → altercation 20:42 → last ping 20:51. Suspect S-118 enters tower overlap by 20:22.",
  "Find contradictions": "4 contradictions detected: TOD vs witness #2; CCTV-0418 timestamp drift; impossible travel time; livor mortis pattern vs supine recovery position.",
  "Show strongest suspect": "Suspect S-118 'Vetri' — 87% confidence. Forensic ties: DNA, UPI lure pattern, tower overlap, defensive injuries on victim consistent with right-handed assailant.",
};

export function Copilot() {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [log, setLog] = useState<{ who: "user" | "ai"; text: string }[]>([
    { who: "ai", text: "AEGIS Copilot online. I have indexed 24 evidence items across C-2041. Ask me anything." },
  ]);

  function send(text: string) {
    if (!text.trim()) return;
    const reply = REPLIES[text] ?? REPLIES.default;
    setLog((l) => [...l, { who: "user", text }, { who: "ai", text: reply }]);
    setInput("");
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-neon-2 text-primary-foreground shadow-lg glow-primary animate-float"
      >
        <Bot className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="glass-strong fixed bottom-20 right-5 z-40 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2.5">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-primary/20 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-sm font-medium">AEGIS Copilot</div>
                <div className="font-mono text-[10px] text-muted-foreground">holographic assistant · online</div>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {log.map((m, i) => (
                <div key={i} className={m.who === "user" ? "ml-auto max-w-[85%]" : "max-w-[90%]"}>
                  <div className={[
                    "rounded-xl px-3 py-2 text-[12.5px] leading-relaxed",
                    m.who === "user" ? "bg-primary/20 text-foreground" : "border border-border/50 bg-secondary/40 text-foreground/90"
                  ].join(" ")}>
                    {m.who === "ai" && <div className="mb-1 font-mono text-[10px] text-primary">AEGIS ▸</div>}
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border/40 p-2">
              <div className="mb-2 flex flex-wrap gap-1">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary">
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask AEGIS…"
                  className="h-9 flex-1 rounded-md border border-border/60 bg-input/60 px-2 text-xs outline-none focus:border-primary/60"
                />
                <button onClick={() => send(input)} className="grid h-9 w-9 place-items-center rounded-md bg-primary/20 text-primary hover:bg-primary/30">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
