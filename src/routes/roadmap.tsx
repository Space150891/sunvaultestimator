import { createFileRoute } from "@tanstack/react-router";
import { Badge, card } from "@/components/AppShell";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Delivery Roadmap — SunVault Shades Estimator" },
      { name: "description", content: "Three-week core, fourth-week additions and Phase 2 previews." },
      { property: "og:title", content: "Delivery Roadmap — SunVault Shades Estimator" },
      { property: "og:description", content: "Three-week core, fourth-week additions and Phase 2 previews." },
    ],
  }),
  component: Roadmap,
});

const ORDER = ["Estimate and pricing engine", "Proposal and PDF", "Customer signature", "GoHighLevel handoff", "Basic Operations package", "QuickBooks handoff", "Advanced operational modules later"];

const groups = [
  { title: "Three-week core", tone: "success" as const, tag: "In this prototype", items: ["Customer with duplicate check", "Multiple projects per customer", "Unlimited sails, poles, mounts & footings", "Manager price approval", "Project with state price book", "Complete estimator", "Approved price", "PDF proposal", "Customer signature", "GoHighLevel handoff", "Basic Operations handoff page"] },
  { title: "Fourth-week additions", tone: "primary" as const, tag: "Preview — week 4", items: ["Mature admin pricing", "QuickBooks handoff (subject to QuickBooks product, API access and accounting workflow confirmation)", "Pricing-validation report", "Offline recovery demo", "Stronger regression testing", "Production hardening", "Training and handover"] },
  { title: "Phase 2", tone: "muted" as const, tag: "Preview — Phase 2", items: ["Advanced operations scheduling", "Detailed fabrication scheduling", "Installation calendars", "Crew management", "Fabrication tracking", "Installation crew scheduling", "Inventory", "Online deposit payments", "CAD/rendering automation", "Permit and engineering workflows", "Management analytics"] },
];

function Roadmap() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Delivery roadmap</h1>
      <div className={card}>
        <h2 className="text-lg font-semibold">MVP delivery order</h2>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ORDER.map((o, i) => (
            <li key={o} className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>{o}
            </li>
          ))}
        </ol>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((g) => (
          <div key={g.title} className={card}>
            <Badge tone={g.tone}>{g.tag}</Badge>
            <h2 className="mt-2 text-xl font-semibold">{g.title}</h2>
            <ul className="mt-3 space-y-1.5 text-sm">{g.items.map((i) => <li key={i}>• {i}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
