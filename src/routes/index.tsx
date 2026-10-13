import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, card } from "@/components/AppShell";
import { APPOINTMENTS } from "@/lib/demo-data";
import { buildSnapshot, money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Projects — SunVault Shades Estimator" },
      { name: "description", content: "Open and continue SunVault Shades estimates, proposals and signatures." },
      { property: "og:title", content: "Projects — SunVault Shades Estimator" },
      { property: "og:description", content: "Open and continue SunVault Shades estimates, proposals and signatures." },
    ],
  }),
  component: ProjectsPage,
});

export function projectStatus(p: { approvedPrice: number | null; proposals: { version: number; signature?: unknown; ghlSyncedAt?: string }[] }) {
  const last = p.proposals[p.proposals.length - 1];
  if (last?.ghlSyncedAt) return { label: "Sent to GoHighLevel", tone: "success" as const };
  if (last?.signature) return { label: "Signed", tone: "success" as const };
  if (last) return { label: `Proposal v${last.version}`, tone: "primary" as const };
  if (p.approvedPrice) return { label: "Price approved", tone: "primary" as const };
  return { label: "Estimating", tone: "muted" as const };
}

function ProjectsPage() {
  const { projects, customers, books } = useStore();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Customer → Project → Estimate → Approved price → Proposal → Signature → GoHighLevel</p>
        </div>
        <Link to="/customers" className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
          + New estimate
        </Link>
      </div>
      <div className="rounded-xl bg-sidebar p-5 text-sidebar-foreground">
        <p className="font-display text-lg leading-snug">
          Finish the site visit, produce the approved proposal and move the sale into GoHighLevel — without returning to the office or combining five spreadsheets.
        </p>
      </div>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Today's appointments</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {APPOINTMENTS.map((a) => (
            <div key={a.name} className={`${card} flex items-center justify-between gap-3`}>
              <div>
                <div className="text-sm font-semibold text-primary">{a.time}</div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-sm text-muted-foreground">{a.address} · {a.note}</div>
              </div>
              <Link to="/customers" search={{ name: a.name, email: a.email, phone: a.phone, address: a.address, state: a.state }} className="inline-flex h-11 shrink-0 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
                Start visit
              </Link>
            </div>
          ))}
        </div>
      </section>
      <h2 className="text-xl font-semibold">Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => {
          const c = customers.find((x) => x.id === p.customerId);
          const book = books.find((b) => b.id === p.priceBookId);
          const snap = buildSnapshot(p.openings, book!, p.approvedPrice, p.components);
          const st = projectStatus(p);
          return (
            <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }} className={`${card} block transition hover:border-primary`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="text-sm text-muted-foreground">{c?.name} · {c?.address}</p>
                </div>
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted-foreground">{p.components.length + p.openings.length} item(s) · {book?.name}</span>
                <span className="font-semibold">{money(snap.approved)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
