import { useState } from "react";
import { Badge, btnOutline, btnPrimary, card, input } from "@/components/AppShell";
import { GHL_EXISTING, GHL_USERS, type Customer, type GhlLog, type OpsHandoff, type OpsStatus, type Project } from "@/lib/demo-data";
import { money } from "@/lib/pricing";

type Upd = (fn: (p: Project) => Project) => void;
const now = () => new Date().toISOString();
const rid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

export function projectStage(p: Project) {
  const last = p.proposals[p.proposals.length - 1];
  if (p.ops?.depositStatus === "Received") return "Deposit Received";
  if (last?.signature) return "Proposal Signed";
  if (last) return "Proposal Sent";
  return "Estimating";
}

export function GhlPanel({ p, c, upd }: { p: Project; c: Customer; upd: Upd }) {
  const [failNext, setFailNext] = useState(false);
  const last = p.proposals[p.proposals.length - 1];
  if (!last?.signature) return <p className={card}>The proposal must be signed before handoff.</p>;
  const g = p.ghl;
  const stage = projectStage(p);
  const deposit = p.ops?.depositStatus ?? "Not requested";

  const sync = () => {
    const log: GhlLog[] = [];
    const push = (action: string, detail: string, ok = true) => log.push({ at: now(), action, ok, detail });
    const existing = GHL_EXISTING[c.email.toLowerCase()] ?? g?.contactId;
    push("Search contact", `By email ${c.email} / phone ${c.phone} → ${existing ? "match " + existing : "no match"}`);
    if (failNext) {
      push("Create/update contact", "HTTP 429 rate limited — queued for retry", false);
      setFailNext(false);
      upd((x) => ({ ...x, ghl: { userId: GHL_USERS[x.rep] ?? "ghl_usr_unknown", stage: g?.stage ?? "—", ...g, failed: true, log: [...(g?.log ?? []), ...log] } }));
      return;
    }
    const contactId = existing ?? rid("ghl_ct");
    push(existing ? "Update contact" : "Create contact", `${contactId} · address & signature status custom fields`);
    const oppId = g?.opportunityId ?? rid("ghl_op");
    push(g?.opportunityId ? "Update opportunity" : "Create opportunity", `${oppId} · assigned ${GHL_USERS[p.rep] ?? "?"}`);
    push("Update monetary value", money(last.snapshot.approved));
    push("Move pipeline stage", stage);
    push("Attach proposal reference", `SV-${p.id}-v${last.version}.pdf as opportunity note`);
    upd((x) => ({
      ...x,
      ghl: { contactId, opportunityId: oppId, userId: GHL_USERS[x.rep] ?? "ghl_usr_unknown", stage, failed: false, log: [...(g?.log ?? []), ...log] },
      proposals: x.proposals.map((v, i) => (i === x.proposals.length - 1 ? { ...v, ghlSyncedAt: now() } : v)),
    }));
  };

  const webhook = () =>
    upd((x) => ({
      ...x,
      ops: { ...(x.ops ?? defaultOps()), depositStatus: "Received" },
      ghl: x.ghl && { ...x.ghl, stage: "Deposit Received", log: [...x.ghl.log, { at: now(), action: "Webhook received", ok: true, detail: "OpportunityStageUpdate → Deposit Received; SunVault deposit status updated" }] },
    }));

  const rows: [string, string, string, string][] = [
    ["Customer", c.id, "Contact", g?.contactId ?? "—"],
    ["Assigned sales rep", p.rep, "Assigned user", g?.userId ?? GHL_USERS[p.rep] ?? "—"],
    ["Project", p.id, "Opportunity", g?.opportunityId ?? "—"],
    ["Approved selling price", money(last.snapshot.approved), "Opportunity monetary value", g ? money(last.snapshot.approved) : "—"],
    ["Project stage", stage, "Pipeline stage", g?.stage ?? "—"],
    ["Project address", c.address, "Contact/opportunity custom fields", g ? "cf_site_address" : "—"],
    ["Signed proposal", `v${last.version}`, "Opportunity note / document", g ? `SV-${p.id}-v${last.version}.pdf` : "—"],
    ["Signature status", "Signed", "Custom field", g ? "cf_signature_status = Signed" : "—"],
    ["Deposit status", deposit, "Custom field / pipeline stage", g ? `cf_deposit_status = ${deposit}` : "—"],
  ];

  return (
    <div className="space-y-4">
      <div className={`${card} space-y-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">GoHighLevel handoff <Badge tone="primary">Week 3 MVP</Badge></h2>
          {g?.failed ? <Badge tone="warn">Sync failed</Badge> : g ? <Badge tone="success">Synced (simulated)</Badge> : <Badge>Not synced</Badge>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left"><tr><th className="p-2">SunVault</th><th className="p-2">SunVault value / ID</th><th className="p-2">GoHighLevel</th><th className="p-2">GoHighLevel value / ID</th></tr></thead>
            <tbody className="divide-y">{rows.map((r) => <tr key={r[0]}>{r.map((v, i) => <td key={i} className={`p-2 ${i % 2 ? "font-mono text-xs" : "font-medium"}`}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className={btnPrimary} onClick={sync}>{g?.failed ? "Retry failed sync" : g ? "Re-sync" : "Sync to GoHighLevel"}</button>
          <button className={btnOutline} disabled={!g || g.failed} onClick={webhook}>Simulate webhook: deposit received</button>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-5 w-5" checked={failNext} onChange={(e) => setFailNext(e.target.checked)} /> Simulate failure on next sync</label>
        </div>
      </div>
      {g && (
        <div className={card}>
          <h3 className="mb-2 font-semibold">Sync log</h3>
          <ul className="space-y-1 text-sm">
            {[...g.log].reverse().map((l, i) => (
              <li key={i} className="flex gap-2"><span className={l.ok ? "text-success" : "text-destructive"}>{l.ok ? "✓" : "✕"}</span><b>{l.action}</b><span className="text-muted-foreground">{l.detail}</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const defaultOps = (): OpsHandoff => ({ sails: 0, poles: 0, wallMounts: 0, footings: 0, hardware: "", specialConditions: "", depositStatus: "Not requested", requiredDate: "", notes: "", status: "Not sent" });
const OPS_STATUSES: OpsStatus[] = ["Handoff Received", "Measurements Need Review", "Ready for Engineering", "Ready for Fabrication"];

export function OpsPanel({ p, c, upd }: { p: Project; c: Customer; upd: Upd }) {
  const last = p.proposals[p.proposals.length - 1];
  if (!last?.signature) return <p className={card}>Operations handoff opens once the proposal is signed.</p>;
  const o = p.ops ?? { ...defaultOps(), sails: p.openings.length, wallMounts: p.openings.length * 2, poles: 0, footings: 0, hardware: "Standard mounting kit" };
  const set = (patch: Partial<OpsHandoff>) => upd((x) => ({ ...x, ops: { ...o, ...patch } }));
  const num = (k: "sails" | "poles" | "wallMounts" | "footings", label: string) => (
    <label className="text-sm font-medium">{label}<input type="number" min={0} className={`${input} mt-1`} value={o[k]} onChange={(e) => set({ [k]: Number(e.target.value) || 0 })} /></label>
  );
  return (
    <div className="space-y-4">
      <div className={`${card} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Operations handoff <Badge tone="primary">Basic MVP</Badge></h2>
          <Badge tone={o.status === "Ready for Fabrication" ? "success" : o.status === "Measurements Need Review" ? "warn" : "muted"}>{o.status}</Badge>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div><span className="text-muted-foreground">Customer:</span> {c.name} · {c.phone}</div>
          <div><span className="text-muted-foreground">Address:</span> {c.address}, {c.state}</div>
          <div><span className="text-muted-foreground">Sales rep:</span> {p.rep}</div>
          <div><span className="text-muted-foreground">Signed proposal:</span> v{last.version} by {last.signature.name}</div>
          <div><span className="text-muted-foreground">Approved estimate:</span> v{last.version} · {money(last.snapshot.approved)} · {last.snapshot.priceBookName}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{num("sails", "Sails")}{num("poles", "Poles")}{num("wallMounts", "Wall mounts")}{num("footings", "Footings")}</div>
        <label className="block text-sm font-medium">Hardware<input className={`${input} mt-1`} value={o.hardware} onChange={(e) => set({ hardware: e.target.value })} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          {["Site photos", "Renderings"].map((t) => (
            <div key={t} className="flex h-24 items-center justify-center rounded-md border-2 border-dashed text-sm text-muted-foreground">{t} — 3 demo files attached</div>
          ))}
        </div>
        <label className="block text-sm font-medium">Special conditions<textarea className={`${input} mt-1 h-20 py-2`} value={o.specialConditions} onChange={(e) => set({ specialConditions: e.target.value })} /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">Deposit status
            <select className={`${input} mt-1`} value={o.depositStatus} onChange={(e) => set({ depositStatus: e.target.value as OpsHandoff["depositStatus"] })}>
              {["Not requested", "Requested", "Received"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Required date<input type="date" className={`${input} mt-1`} value={o.requiredDate} onChange={(e) => set({ requiredDate: e.target.value })} /></label>
        </div>
        <label className="block text-sm font-medium">Internal handoff notes<textarea className={`${input} mt-1 h-20 py-2`} value={o.notes} onChange={(e) => set({ notes: e.target.value })} /></label>
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operations marks</div>
          <div className="flex flex-wrap gap-2">
            {OPS_STATUSES.map((s) => <button key={s} onClick={() => set({ status: s })} className={o.status === s ? btnPrimary : btnOutline}>{s}</button>)}
          </div>
        </div>
      </div>
      <div className={`${card} flex flex-wrap gap-2 text-sm`}>
        <Badge>Phase 2 preview</Badge>Fabrication scheduling · Installation calendars · Inventory · Crew management
      </div>
    </div>
  );
}
