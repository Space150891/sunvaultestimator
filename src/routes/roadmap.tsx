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

const groups = [
  { title: "Three-week core", tone: "success" as const, tag: "In this prototype", items: ["Customer with duplicate check", "Project with state price book", "Complete estimator", "Approved price", "PDF proposal", "Customer signature", "GoHighLevel handoff"] },
  { title: "Fourth-week additions", tone: "primary" as const, tag: "Preview — week 4", items: ["Mature admin pricing", "QuickBooks handoff", "Stronger regression testing", "Production hardening", "Training and handover"] },
  { title: "Phase 2", tone: "muted" as const, tag: "Preview — Phase 2", items: ["Advanced operations scheduling", "Fabrication tracking", "Installation crew scheduling", "Inventory", "Online deposit payments", "CAD/rendering automation", "Permit and engineering workflows", "Management analytics"] },
];

function Roadmap() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Delivery roadmap</h1>
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
