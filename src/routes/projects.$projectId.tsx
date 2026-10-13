import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Badge, btnOutline, btnPrimary, card, input } from "@/components/AppShell";
import { ADDONS, FABRICS, HOUSINGS, KIND_LABEL, MOTORS, SERIES, type Component, type ComponentKind, type Opening, type Option, type Project } from "@/lib/demo-data";
import { buildSnapshot, componentCost, money } from "@/lib/pricing";
import { canManage, useStore } from "@/lib/store";
import { GhlPanel, OpsPanel } from "@/components/Handoffs";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Estimate — SunVault Shades Estimator" },
      { name: "description", content: "Measure openings, approve pricing, present the proposal and capture signature." },
      { property: "og:title", content: "Estimate — SunVault Shades Estimator" },
      { property: "og:description", content: "Measure openings, approve pricing, present the proposal and capture signature." },
    ],
  }),
  component: ProjectPage,
});

const STEPS = ["Estimator", "Price approval", "Proposal", "Signature", "GoHighLevel", "Operations"] as const;
const DISCOUNT_LIMIT = 0.1;

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { projects, customers, updateProject, role, books } = useStore();
  const p = projects.find((x) => x.id === projectId);
  const [step, setStep] = useState<(typeof STEPS)[number]>("Estimator");
  if (!p) return <p className={card}>Project not found. <Link to="/" className="text-primary underline">Back to projects</Link></p>;
  const c = customers.find((x) => x.id === p.customerId)!;
  const book = books.find((b) => b.id === p.priceBookId)!;
  const live = buildSnapshot(p.openings, book, p.approvedPrice, p.components);
  const last = p.proposals[p.proposals.length - 1];
  const locked = !!last?.signature;
  const upd = (fn: (p: Project) => Project) => updateProject(p.id, fn);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <input
            disabled={locked}
            className="w-full bg-transparent font-display text-3xl font-bold focus:outline-none"
            value={p.name}
            onChange={(e) => upd((x) => ({ ...x, name: e.target.value }))}
          />
          <p className="text-muted-foreground">{c.name} · {c.address}, {c.state} · {c.phone} · Rep: {p.rep}</p>
          <p className="font-mono text-xs text-muted-foreground">SunVault {p.id} · customer {c.id}{p.ghl?.opportunityId ? ` · GHL ${p.ghl.opportunityId}` : ""}</p>
        </div>
        <label className="text-sm">
          <span className="block text-xs text-muted-foreground">Price book {canManage(role) ? "" : "(manager can change)"}</span>
          <select
            disabled={!canManage(role) || locked}
            className={`${input} mt-1 w-64`}
            value={p.priceBookId}
            onChange={(e) => upd((x) => ({ ...x, priceBookId: e.target.value, approvedPrice: null }))}
          >
            {books.filter((b) => b.status !== "Draft").map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
      </div>

      {locked && (
        <div className="rounded-md border border-success/40 bg-success/10 p-3 text-sm">
          Signed by {last.signature!.name} on {new Date(last.signature!.at).toLocaleString()}. This estimate is locked; its pricing snapshot will never change.
        </div>
      )}

      <div className="no-print flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(s)} className={`flex-1 whitespace-nowrap rounded-md px-3 py-2.5 text-sm font-semibold ${step === s ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === "Estimator" && <Estimator p={p} locked={locked} upd={upd} live={live} next={() => setStep("Price approval")} />}
      {step === "Price approval" && <Approval p={p} locked={locked} upd={upd} live={live} role={role} next={() => setStep("Proposal")} />}
      {step === "Proposal" && <Proposal p={p} c={c} upd={upd} live={live} locked={locked} next={() => setStep("Signature")} />}
      {step === "Signature" && <Signature p={p} upd={upd} next={() => setStep("GoHighLevel")} />}
      {step === "GoHighLevel" && <GhlPanel p={p} c={c} upd={upd} />}
      {step === "Operations" && <OpsPanel p={p} c={c} upd={upd} />}
    </div>
  );
}

type Live = ReturnType<typeof buildSnapshot>;
type Upd = (fn: (p: Project) => Project) => void;

function Choice({ label, list, value, onChange, disabled }: { label: string; list: Option[]; value: string; onChange: (v: string) => void; disabled: boolean }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-2">
        {list.map((o) => (
          <button key={o.id} disabled={disabled} onClick={() => onChange(o.id)} className={`min-h-11 rounded-md border px-3 py-2 text-left text-sm ${value === o.id ? "border-primary bg-primary/10 font-semibold" : "bg-card"}`}>
            {o.label}
            {o.note && <span className="block text-xs font-normal text-muted-foreground">{o.note}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Estimator({ p, locked, upd, live, next }: { p: Project; locked: boolean; upd: Upd; live: Live; next: () => void }) {
  const set = (id: string, patch: Partial<Opening>) => upd((x) => ({ ...x, approvedPrice: null, openings: x.openings.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <ComponentsEditor p={p} locked={locked} upd={upd} />
        <h3 className="pt-2 text-lg font-semibold">Retractable shade openings <span className="text-sm font-normal text-muted-foreground">(optional)</span></h3>
        {p.openings.map((o, i) => (
          <div key={o.id} className={`${card} space-y-4`}>
            <div className="flex items-center gap-2">
              <input disabled={locked} className={`${input} font-semibold`} value={o.name} onChange={(e) => set(o.id, { name: e.target.value })} />
              {p.openings.length > 1 && !locked && (
                <button className={btnOutline} onClick={() => upd((x) => ({ ...x, approvedPrice: null, openings: x.openings.filter((y) => y.id !== o.id) }))}>Remove</button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["widthIn", "heightIn"] as const).map((k) => (
                <label key={k} className="text-sm font-medium">
                  {k === "widthIn" ? "Width (in)" : "Height (in)"}
                  <input disabled={locked} type="number" inputMode="decimal" min={12} className={`${input} mt-1`} value={o[k]} onChange={(e) => set(o.id, { [k]: Number(e.target.value) || 0 })} />
                </label>
              ))}
            </div>
            <Choice label="Product" list={SERIES} value={o.series} onChange={(v) => set(o.id, { series: v })} disabled={locked} />
            <Choice label="Fabric" list={FABRICS} value={o.fabric} onChange={(v) => set(o.id, { fabric: v })} disabled={locked} />
            <Choice label="Motor" list={MOTORS} value={o.motor} onChange={(v) => set(o.id, { motor: v })} disabled={locked} />
            <Choice label="Housing" list={HOUSINGS} value={o.housing} onChange={(v) => set(o.id, { housing: v })} disabled={locked} />
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add-ons</div>
              <div className="flex flex-wrap gap-2">
                {ADDONS.map((a) => {
                  const on = o.addons.includes(a.id);
                  return (
                    <button key={a.id} disabled={locked} onClick={() => set(o.id, { addons: on ? o.addons.filter((x) => x !== a.id) : [...o.addons, a.id] })} className={`min-h-11 rounded-md border px-3 text-sm ${on ? "border-primary bg-primary/10 font-semibold" : "bg-card"}`}>
                      {on ? "✓ " : "+ "}{a.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">Opening {i + 1} recommended: <b className="text-foreground">{money(live.lines[live.lines.length - p.openings.length + i]?.recommended ?? 0)}</b></div>
          </div>
        ))}
        {!locked && (
          <button className={btnOutline} onClick={() => upd((x) => ({ ...x, approvedPrice: null, openings: [...x.openings, { ...(x.openings[x.openings.length - 1] ?? { widthIn: 144, heightIn: 96, series: "zip", fabric: "sol90", motor: "rts", housing: "square" }), id: "o" + Date.now(), name: `Opening ${x.openings.length + 1}`, addons: [] } as Opening] }))}>
            + Add opening
          </button>
        )}
      </div>
      <PriceCard live={live} next={next} />
    </div>
  );
}

const NEW_ITEM: Record<ComponentKind, Omit<Component, "id">> = {
  sail: { kind: "sail", label: "Shade sail", qty: 1, sqft: 200, fabric: "sol95" },
  pole: { kind: "pole", label: "Steel pole 4\"", qty: 1, heightFt: 12 },
  mount: { kind: "mount", label: "Wall mount", qty: 1 },
  footing: { kind: "footing", label: "Concrete footing", qty: 1 },
  hardware: { kind: "hardware", label: "Turnbuckle & shackle kit", qty: 1 },
};

function ComponentsEditor({ p, locked, upd }: { p: Project; locked: boolean; upd: Upd }) {
  const { books } = useStore();
  const book = books.find((b) => b.id === p.priceBookId)!;
  const set = (id: string, patch: Partial<Component>) => upd((x) => ({ ...x, approvedPrice: null, components: x.components.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const add = (k: ComponentKind) => upd((x) => ({ ...x, approvedPrice: null, components: [...x.components, { ...NEW_ITEM[k], id: "k" + Date.now() }] }));
  const numIn = (c: Component, k: "qty" | "sqft" | "heightFt", label: string) => (
    <label className="text-xs font-medium text-muted-foreground">{label}
      <input disabled={locked} type="number" inputMode="decimal" min={0} className={`${input} mt-1`} value={c[k] ?? 0} onChange={(e) => set(c.id, { [k]: Number(e.target.value) || 0 })} />
    </label>
  );
  return (
    <div className={`${card} space-y-3`}>
      <h3 className="text-lg font-semibold">Sails, poles, mounts, footings & hardware</h3>
      {p.components.length === 0 && <p className="text-sm text-muted-foreground">Add the first sail to start the estimate.</p>}
      {p.components.map((c) => {
        const r = componentCost(c, book);
        return (
          <div key={c.id} className="space-y-2 rounded-lg border bg-background p-3">
            <div className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-xs font-bold uppercase text-primary">{KIND_LABEL[c.kind]}</span>
              <input disabled={locked} className={input} value={c.label} onChange={(e) => set(c.id, { label: e.target.value })} />
              {!locked && <button aria-label="Remove item" className={btnOutline} onClick={() => upd((x) => ({ ...x, approvedPrice: null, components: x.components.filter((y) => y.id !== c.id) }))}>✕</button>}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {numIn(c, "qty", "Quantity")}
              {c.kind === "sail" && numIn(c, "sqft", "Area (sq ft)")}
              {c.kind === "sail" && (
                <label className="text-xs font-medium text-muted-foreground">Fabric
                  <select disabled={locked} className={`${input} mt-1`} value={c.fabric} onChange={(e) => set(c.id, { fabric: e.target.value })}>
                    {FABRICS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </label>
              )}
              {c.kind === "pole" && numIn(c, "heightFt", "Height (ft)")}
              <div className="col-span-2 self-end text-right text-sm sm:col-span-1 sm:col-start-4">
                {r.missing ? <Badge tone="warn">{r.formula}</Badge> : <><div className="font-semibold">{money(r.cost)}</div><div className="text-xs text-muted-foreground">internal cost</div></>}
              </div>
            </div>
          </div>
        );
      })}
      {!locked && (
        <div className="flex flex-wrap gap-2">
          {(Object.keys(NEW_ITEM) as ComponentKind[]).map((k) => <button key={k} className={btnOutline} onClick={() => add(k)}>+ {KIND_LABEL[k]}</button>)}
        </div>
      )}
    </div>
  );
}

function PriceCard({ live, next }: { live: Live; next?: () => void }) {
  return (
    <div className={`${card} h-fit space-y-3 lg:sticky lg:top-24`}>
      <Badge tone="warn">Demo prices</Badge>
      <Row k="Calculated internal cost" v={money(live.internalCost)} />
      <Row k="Recommended selling price" v={money(live.recommended)} />
      <Row k="Final approved selling price" v={money(live.approved)} strong />
      <p className="text-xs text-muted-foreground">Price book: {live.priceBookName}</p>
      {next && <button className={`${btnPrimary} w-full`} onClick={next}>Continue to approval</button>}
    </div>
  );
}
const Row = ({ k, v, strong }: { k: string; v: string; strong?: boolean }) => (
  <div className={`flex justify-between gap-2 ${strong ? "border-t pt-3 text-lg font-bold" : "text-sm"}`}><span>{k}</span><span>{v}</span></div>
);

function Approval({ p, locked, upd, live, role, next }: { p: Project; locked: boolean; upd: Upd; live: Live; role: string; next: () => void }) {
  const [val, setVal] = useState(String(p.approvedPrice ?? live.recommended));
  const n = Number(val) || 0;
  const discount = live.recommended ? (live.recommended - n) / live.recommended : 0;
  const margin = n ? (n - live.internalCost) / n : 0;
  const [pin, setPin] = useState("");
  const [mgrOk, setMgrOk] = useState(false);
  const needsMgr = discount > DISCOUNT_LIMIT && !canManage(role as never) && !mgrOk;
  const missing = live.lines.some((l) => l.missing) || live.lines.length === 0;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className={`${card} space-y-4`}>
        <h2 className="text-xl font-semibold">Set the final selling price</h2>
        <label className="block text-sm font-medium">
          Final approved selling price (USD)
          <input disabled={locked} type="number" inputMode="decimal" className={`${input} mt-1 text-lg`} value={val} onChange={(e) => setVal(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge tone={discount > DISCOUNT_LIMIT ? "warn" : "muted"}>Discount {(discount * 100).toFixed(1)}%</Badge>
          <Badge tone={margin < 0.35 ? "warn" : "success"}>Margin {(margin * 100).toFixed(1)}%</Badge>
        </div>
        {needsMgr && (
          <div className="space-y-2 rounded-md border border-warning bg-warning/10 p-3">
            <p className="text-sm">Discounts over {DISCOUNT_LIMIT * 100}% need a Sales Manager. Hand the tablet to the manager to enter their PIN (demo PIN 1234).</p>
            <div className="flex gap-2">
              <input className={input} inputMode="numeric" placeholder="Manager PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
              <button className={btnOutline} disabled={pin !== "1234"} onClick={() => setMgrOk(true)}>Authorise</button>
            </div>
          </div>
        )}
        {mgrOk && <Badge tone="success">Adjustment authorised by Sales Manager</Badge>}
        {missing && <p className="text-sm text-destructive">Fix missing prices or quantities before approving.</p>}
        <button
          disabled={locked || needsMgr || missing || n <= 0}
          className={`${btnPrimary} w-full`}
          onClick={() => { upd((x) => ({ ...x, approvedPrice: n, approvedBy: mgrOk ? "manager (PIN)" : role })); next(); }}
        >
          Approve price & continue
        </button>
      </div>
      <PriceCard live={{ ...live, approved: n }} />
    </div>
  );
}

function Proposal({ p, c, upd, live, locked, next }: { p: Project; c: { name: string; address: string; state: string; email: string }; upd: Upd; live: Live; locked: boolean; next: () => void }) {
  const last = p.proposals[p.proposals.length - 1];
  const generate = () => upd((x) => ({ ...x, proposals: [...x.proposals, { version: x.proposals.length + 1, createdAt: new Date().toISOString(), snapshot: live }] }));
  const stale = last && !last.signature && JSON.stringify(last.snapshot) !== JSON.stringify(live);
  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <button disabled={!p.approvedPrice || locked} className={btnPrimary} onClick={generate}>{last ? "Generate new version" : "Generate proposal"}</button>
        {last && <button className={btnOutline} onClick={() => window.print()}>Download PDF</button>}
        {last && !locked && <button className={btnOutline} onClick={next}>Go to signature</button>}
        {!p.approvedPrice && <span className="self-center text-sm text-muted-foreground">Approve a price first.</span>}
        {stale && <Badge tone="warn">Estimate changed since v{last.version}</Badge>}
      </div>
      {p.proposals.length > 1 && (
        <div className="no-print text-sm text-muted-foreground">
          Versions: {p.proposals.map((v) => `v${v.version} (${v.snapshot.priceBookName}, ${money(v.snapshot.approved)})`).join(" · ")}
        </div>
      )}
      {last ? (
        <div className={`${card} space-y-5 p-8`}>
          <div className="flex justify-between border-b pb-4">
            <div>
              <div className="font-display text-2xl font-bold">SunVault Shades</div>
              <div className="text-sm text-muted-foreground">Exterior shade proposal · v{last.version} · {new Date(last.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold">{c.name}</div>
              <div>{c.address}, {c.state}</div>
              <div>{c.email}</div>
            </div>
          </div>
          <h2 className="text-xl font-semibold">{p.name}</h2>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {last.snapshot.lines.map((l) => (
                <tr key={l.name}><td className="py-2"><div className="font-medium">{l.name}</div><div className="text-muted-foreground">{l.detail}</div></td></tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between border-t pt-4 text-xl font-bold"><span>Total investment</span><span>{money(last.snapshot.approved)}</span></div>
          <p className="text-xs text-muted-foreground">Includes professional measurement, fabrication and installation. Demonstration pricing only · Price book {last.snapshot.priceBookName}.</p>
          {last.signature && (
            <div className="border-t pt-4">
              <img src={last.signature.dataUrl} alt="Customer signature" className="h-20" />
              <div className="text-sm">{last.signature.name} · {new Date(last.signature.at).toLocaleString()}</div>
            </div>
          )}
        </div>
      ) : (
        <p className={card}>No proposal yet.</p>
      )}
    </div>
  );
}

function Signature({ p, upd, next }: { p: Project; upd: Upd; next: () => void }) {
  const last = p.proposals[p.proposals.length - 1];
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [name, setName] = useState("");
  const [hasInk, setHasInk] = useState(false);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    cv.width = cv.offsetWidth * 2;
    cv.height = cv.offsetHeight * 2;
    const ctx = cv.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = getComputedStyle(cv).color;
  }, [last?.version]);
  if (!last) return <p className={card}>Generate a proposal first.</p>;
  if (last.signature) return <div className={card}>Proposal v{last.version} is signed. <button className={`${btnPrimary} ml-2`} onClick={next}>Send to GoHighLevel</button></div>;
  const pos = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  return (
    <div className={`${card} space-y-4`}>
      <h2 className="text-xl font-semibold">Customer signature — proposal v{last.version} · {money(last.snapshot.approved)}</h2>
      <p className="text-sm text-muted-foreground">By signing, the customer accepts the proposal above. The pricing snapshot is locked on signature.</p>
      <canvas
        ref={ref}
        className="h-48 w-full touch-none rounded-md border-2 border-dashed bg-background text-foreground"
        onPointerDown={(e) => { drawing.current = true; const ctx = ref.current!.getContext("2d")!; ctx.beginPath(); ctx.moveTo(...pos(e)); }}
        onPointerMove={(e) => { if (!drawing.current) return; const ctx = ref.current!.getContext("2d")!; ctx.lineTo(...pos(e)); ctx.stroke(); setHasInk(true); }}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
      />
      <input className={input} placeholder="Customer printed name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex gap-2">
        <button className={btnOutline} onClick={() => { const cv = ref.current!; cv.getContext("2d")!.clearRect(0, 0, cv.width, cv.height); setHasInk(false); }}>Clear</button>
        <button
          disabled={!hasInk || !name.trim()}
          className={btnPrimary}
          onClick={() => {
            const dataUrl = ref.current!.toDataURL();
            upd((x) => ({ ...x, proposals: x.proposals.map((v, i) => (i === x.proposals.length - 1 ? { ...v, signature: { name: name.trim(), dataUrl, at: new Date().toISOString() } } : v)) }));
            next();
          }}
        >
          Accept & sign
        </button>
      </div>
    </div>
  );
}

