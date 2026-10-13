import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ROLE_LABEL, type Role } from "@/lib/demo-data";
import { canManage, useStore } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const { role, setRole } = useStore();
  const nav = [
    { to: "/", label: "Projects" },
    { to: "/customers", label: "Customers" },
    ...(canManage(role) ? [{ to: "/validation", label: "Pricing validation" }] : []),
    { to: "/roadmap", label: "Roadmap" },
  ] as const;
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent px-4 py-1 text-center text-xs font-medium text-accent-foreground">
        Prototype · fictional demonstration prices and data only
      </div>
      <header className="sticky top-0 z-20 border-b bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="mr-4 font-display text-lg font-bold tracking-tight">
            SunVault <span className="text-sidebar-primary">Estimator</span>
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-medium opacity-80 hover:opacity-100 data-[status=active]:bg-sidebar-accent data-[status=active]:opacity-100"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <label className="flex items-center gap-2 text-xs">
            <span className="opacity-70">Signed in as</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="h-10 rounded-md border border-sidebar-border bg-sidebar-accent px-2 text-sm"
            >
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "primary" | "success" | "warn" }) {
  const cls = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    warn: "bg-warning/20 text-warning-foreground",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>;
}

export const btn = "inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors disabled:opacity-50";
export const btnPrimary = `${btn} bg-primary text-primary-foreground hover:bg-primary/90`;
export const btnOutline = `${btn} border bg-card hover:bg-muted`;
export const input = "h-11 w-full rounded-md border bg-card px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring";
export const card = "rounded-xl border bg-card p-5 shadow-sm";
