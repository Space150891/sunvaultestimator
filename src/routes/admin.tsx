import { createFileRoute } from "@tanstack/react-router";
import { Badge, btnOutline, btnPrimary, card } from "@/components/AppShell";
import { FABRICS, type PriceBook } from "@/lib/demo-data";
import { money } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — SunVault Shades Estimator" },
      { name: "description", content: "Price-book versioning and QuickBooks handoff settings." },
      { property: "og:title", content: "Admin — SunVault Shades Estimator" },
      { property: "og:description", content: "Price-book versioning and QuickBooks handoff settings." },
    ],
  }),
  component: AdminPage,
});

const QB = [
  { id: "estimate", label: "Create Estimate after signature", note: "Option A: Signed proposal → customer → QuickBooks estimate" },
  { id: "invoice", label: "Create Invoice after deposit", note: "Option B: Deposit received → customer → invoice → record deposit" },
  { id: "both", label: "Create both", note: "Estimate on signature, invoice on deposit" },
  { id: "manual", label: "Manual accounting handoff", note: "No automatic push" },
];

function AdminPage() {
  const { role, books, setBooks, qbTrigger, setQbTrigger } = useStore();
  if (role !== "admin") return <p className={card}>Admin settings are available to Administrators.</p>;

  const draftFrom = (b: PriceBook) =>
    setBooks((l) => [{ ...b, id: `${b.state.toLowerCase()}-draft-${Date.now()}`, name: `${b.state === "UT" ? "Utah" : "Arizona"} — Draft ${new Date().toLocaleDateString()}`, status: "Draft", createdBy: "Administrator", effectiveDate: new Date().toISOString().slice(0, 10), seriesPerSqFt: Object.fromEntries(Object.entries(b.seriesPerSqFt).map(([k, v]) => [k, Math.round(v * 1.03 * 100) / 100])) }, ...l]);
  const publish = (b: PriceBook) =>
    setBooks((l) => l.map((x) => (x.id === b.id ? { ...x, status: "Active" } : x.state === b.state && x.status === "Active" ? { ...x, status: "Archived" } : x)));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Price-book versions <Badge tone="warn">Demo rates</Badge></h2>
        <p className="text-sm text-muted-foreground">Publishing a version archives the previous active book for that state. Existing proposals keep their saved pricing. New projects use the active book for their state.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {books.map((b) => (
            <div key={b.id} className={`${card} space-y-3`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="text-xs text-muted-foreground">{b.state} · effective {b.effectiveDate} · created by {b.createdBy}</p>
                </div>
                <Badge tone={b.status === "Active" ? "success" : b.status === "Draft" ? "warn" : "muted"}>{b.status}</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <Item k="Fabric rates" v={FABRICS.map((f) => `×${b.fabricMult[f.id]}`).join(" ")} />
                <Item k="Pole rate" v={money(b.rates.pole)} />
                <Item k="Footing rate" v={money(b.rates.footing)} />
                <Item k="Hardware rate" v={money(b.rates.hardware)} />
                <Item k="Labour / opening" v={money(b.laborPerOpening)} />
                <Item k="Equipment" v={money(b.rates.equipment)} />
                <Item k="Travel / mile" v={money(b.rates.travelPerMile)} />
                <Item k="Margin rules" v={`×${b.markup} · floor ${b.rates.marginFloorPct}%`} />
                <Item k="Deposit default" v={`${b.rates.depositPct}%`} />
                <Item k="Zip-Track / sq ft" v={money(b.seriesPerSqFt.zip ?? 0)} />
              </dl>
              <div className="flex gap-2">
                {b.status === "Draft" && <button className={btnPrimary} onClick={() => publish(b)}>Publish as active</button>}
                {b.status === "Active" && <button className={btnOutline} onClick={() => draftFrom(b)}>New draft version (+3%)</button>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${card} space-y-3`}>
        <h2 className="text-xl font-semibold">QuickBooks handoff</h2>
        <Badge tone="primary">Week 4 — subject to QuickBooks product, API access and accounting workflow confirmation.</Badge>
        <p className="text-sm text-muted-foreground">SunVault stays the estimating source of truth. QuickBooks never calculates or controls the selling price.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {QB.map((q) => (
            <button key={q.id} onClick={() => setQbTrigger(q.id)} className={`rounded-md border p-3 text-left ${qbTrigger === q.id ? "border-primary bg-primary/10" : "bg-card"}`}>
              <div className="font-semibold">{q.label}</div>
              <div className="text-xs text-muted-foreground">{q.note}</div>
            </button>
          ))}
        </div>
        <p className="text-sm"><Badge>Phase 2 option</Badge> Online deposit payment collection — not in the initial MVP.</p>
      </section>
    </div>
  );
}

const Item = ({ k, v }: { k: string; v: string }) => (<><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></>);
