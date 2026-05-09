import { Sidebar } from "./Sidebar";
import { CommandHeader } from "./CommandHeader";

export function Shell({ children, hideHeader = false }: { children: React.ReactNode; hideHeader?: boolean }) {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col border-l border-primary/30">
        {!hideHeader && <CommandHeader />}
        <main className="relative flex-1">{children}</main>
      </div>
    </div>
  );
}
