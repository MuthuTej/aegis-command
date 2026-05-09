import { Handle, Position, type NodeProps } from "reactflow";
import {
  User, UserX, Eye, MapPin, Camera, Smartphone, Car, Hammer,
  ShieldCheck, ClipboardList, Dna, Fingerprint, PhoneCall, Banknote, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TYPE: Record<string, { icon: LucideIcon; label: string; color: string }> = {
  victim:   { icon: User,           label: "Victim",   color: "neon"   },
  suspect:  { icon: UserX,          label: "Suspect",  color: "danger" },
  witness:  { icon: Eye,            label: "Witness",  color: "warn"   },
  location: { icon: MapPin,         label: "Location", color: "primary"},
  cctv:     { icon: Camera,         label: "CCTV",     color: "primary"},
  phone:    { icon: Smartphone,     label: "Phone",    color: "neon-2" },
  vehicle:  { icon: Car,            label: "Vehicle",  color: "neon-2" },
  weapon:   { icon: Hammer,         label: "Weapon",   color: "danger" },
  officer:  { icon: ShieldCheck,    label: "Officer",  color: "success"},
  autopsy:  { icon: ClipboardList,  label: "Autopsy",  color: "warn"   },
  timeline: { icon: Clock,          label: "Event",    color: "primary"},
  dna:      { icon: Dna,            label: "DNA",      color: "neon-2" },
  print:    { icon: Fingerprint,    label: "Print",    color: "neon-2" },
  call:     { icon: PhoneCall,      label: "Call",     color: "primary"},
  txn:      { icon: Banknote,       label: "Txn",      color: "warn"   },
};

const colorClass: Record<string, string> = {
  primary: "border-primary/60 text-primary",
  neon:    "border-neon/60 text-neon",
  "neon-2":"border-neon-2/60 text-neon-2",
  danger:  "border-danger/60 text-danger",
  warn:    "border-warn/60 text-warn",
  success: "border-success/60 text-success",
};

export function EvidenceNode({ data, selected }: NodeProps) {
  const t = TYPE[data.type] ?? TYPE.location;
  const Icon = t.icon;
  const isDanger = data.danger;
  return (
    <div
      className={[
        "group min-w-[180px] rounded-xl border bg-card/85 px-3 py-2 backdrop-blur transition",
        colorClass[t.color],
        isDanger ? "animate-pulse-ring-danger" : "",
        selected ? "ring-2 ring-primary/70 glow-primary" : "shadow-[0_0_20px_-12px_rgba(120,200,255,0.6)]",
      ].join(" ")}
    >
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-primary" />
      <div className="flex items-center gap-2">
        <div className={`grid h-7 w-7 place-items-center rounded-md border bg-background/60 ${colorClass[t.color]}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">{t.label}</div>
          <div className="truncate text-sm font-medium text-foreground">{data.label}</div>
        </div>
      </div>
      {data.meta && (
        <div className="mt-1.5 truncate font-mono text-[10px] text-muted-foreground">{data.meta}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-primary" />
    </div>
  );
}
