import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/aegis/Sidebar";
import { CommandHeader } from "@/components/aegis/CommandHeader";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="relative flex min-h-screen w-full">
      <Sidebar />
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <CommandHeader />
        <main className="relative flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
