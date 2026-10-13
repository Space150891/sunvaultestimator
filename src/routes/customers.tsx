import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { btnOutline, btnPrimary, card, input } from "@/components/AppShell";
import type { Customer } from "@/lib/demo-data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — SunVault Shades Estimator" },
      { name: "description", content: "Find or add a customer with duplicate checking before GoHighLevel sync." },
      { property: "og:title", content: "Customers — SunVault Shades Estimator" },
      { property: "og:description", content: "Find or add a customer with duplicate checking before GoHighLevel sync." },
    ],
  }),
  component: CustomersPage,
});

const empty = { name: "", email: "", phone: "", address: "", state: "UT" as "UT" | "AZ" };
const digits = (s: string) => s.replace(/\D/g, "");
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

function findMatches(list: Customer[], f: typeof empty) {
  return list.filter(
    (c) =>
      (f.email && norm(c.email) === norm(f.email)) ||
      (digits(f.phone).length >= 7 && digits(c.phone) === digits(f.phone)) ||
      (f.name && f.address && norm(c.name) === norm(f.name) && norm(c.address) === norm(f.address)),
  );
}

function CustomersPage() {
  const { customers, addCustomer, addProject, projects } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [matches, setMatches] = useState<Customer[] | null>(null);

  const startProject = (c: Customer) => {
    const p = addProject(c.id, "New shade project");
    nav({ to: "/projects/$projectId", params: { projectId: p.id } });
  };
  const create = () => {
    const c = addCustomer(form);
    setMatches(null);
    setForm(empty);
    setShowForm(false);
    startProject(c);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = findMatches(customers, form);
    if (m.length) setMatches(m);
    else create();
  };

  const shown = customers.filter((c) => norm(`${c.name} ${c.email} ${c.phone} ${c.address}`).includes(norm(q)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">Customers</h1>
        <button className={btnPrimary} onClick={() => setShowForm((s) => !s)}>{showForm ? "Close" : "+ New customer"}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className={`${card} grid gap-3 sm:grid-cols-2`}>
          <p className="text-sm text-muted-foreground sm:col-span-2">
            Tip: try email <b>d.ortiz@example.com</b> or phone <b>801-555-0142</b> to see the duplicate check.
          </p>
          {(["name", "email", "phone", "address"] as const).map((k) => (
            <label key={k} className="text-sm font-medium capitalize">
              {k === "name" ? "Full name" : k}
              <input required className={`${input} mt-1`} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </label>
          ))}
          <label className="text-sm font-medium">
            State
            <select className={`${input} mt-1`} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value as "UT" | "AZ" })}>
              <option value="UT">Utah</option>
              <option value="AZ">Arizona</option>
            </select>
          </label>
          <div className="flex items-end"><button className={btnPrimary}>Create customer & start project</button></div>
        </form>
      )}

      <input className={input} placeholder="Search by name, email, phone or address" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="divide-y rounded-xl border bg-card">
        {shown.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-muted-foreground">{c.email} · {c.phone} · {c.address}, {c.state}</div>
              <div className="text-xs text-muted-foreground">{projects.filter((p) => p.customerId === c.id).length} project(s)</div>
            </div>
            <button className={btnOutline} onClick={() => startProject(c)}>New project</button>
          </div>
        ))}
      </div>

      {matches && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className={`${card} w-full max-w-lg`}>
            <h2 className="text-xl font-bold">Possible existing customer found</h2>
            <p className="mt-1 text-sm text-muted-foreground">Checked email, phone, and full name + address before syncing to GoHighLevel.</p>
            <div className="mt-4 space-y-2">
              {matches.map((m) => (
                <div key={m.id} className="rounded-md border bg-muted p-3 text-sm">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-muted-foreground">{m.email} · {m.phone}</div>
                  <div className="text-muted-foreground">{m.address}, {m.state}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className={btnPrimary} onClick={() => { setMatches(null); setShowForm(false); setQ(matches[0].name); }}>Open Existing Customer</button>
              <button className={btnOutline} onClick={create}>Create New Anyway</button>
              <button className={btnOutline} onClick={() => setMatches(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
