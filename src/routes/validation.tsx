import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { Badge, btnOutline, card } from "@/components/AppShell";
import { HISTORICAL } from "@/lib/demo-data";
import { buildSnapshot, money } from "@/lib/pricing";
import { canManage, useStore } from "@/lib/store";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Pricing Validation — SunVault Shades Estimator" },
      { name: "description", content: "Recalculate historical projects and compare them with the original spreadsheet totals." },
      { property: "og:title", content: "Pricing Validation — SunVault Shades Estimator" },
      { property: "og:description", content: "Recalculate historical projects and compare them with the original spreadsheet totals." },
    ],
  }),
  component: ValidationPage,
});

const TOLERANCE = 1;

function ValidationPage() {
  const { role, books } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  if (!canManage(role)) return <p className={card}>Pricing validation is available to Sales Managers and Administrators.</p>;

  const rows = HISTORICAL.map((h) => {
    const book = books.find((b) => b.id === h.bookId);
    if (!book) return { h, bookName: h.bookId, snap: null, excel: 0, app: 0, diff: 0, status: "Missing price book" as const };
    const snap = buildSnapshot([], book, null, h.components);
    const base = snap.recommended;
    const app = Math.round((base + (h.override?.amount ?? 0)) * 100) / 100;
    const excel = Math.round((base + h.excelOffset) * 100) / 100;
    const diff = Math.round((app - excel) * 100) / 100;
    const missing = snap.lines.some((l) => l.missing);
    const status = missing ? "Missing price / quantity" : h.override && !h.override.approved ? "Unapproved override" : Math.abs(diff) <= TOLERANCE ? "Pass" : "Fail";
    return { h, bookName: book.name, snap, excel, app, diff, status };
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Pricing validation <Badge tone="primary">Week 4</Badge></h1>
      <p className="max-w-3xl text-muted-foreground">
        Each fictional historical project is recalculated with its original price-book version. A project passes only when it is complete,
        has no unapproved overrides and is within the rounding tolerance of <b>±{money(TOLERANCE)}</b>.
      </p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>{["Project", "Price book", "Spreadsheet total", "App total", "Difference", "Variance", "Status", ""].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <Fragment key={r.h.project}>
                <tr>
                  <td className="p-3 font-medium">{r.h.project}</td>
                  <td className="p-3 text-muted-foreground">{r.bookName}</td>
                  <td className="p-3">{money(r.excel)}</td>
                  <td className="p-3">{money(r.app)}</td>
                  <td className="p-3">{money(r.diff)}</td>
                  <td className="p-3">{r.excel ? ((r.diff / r.excel) * 100).toFixed(3) : "0.000"}%</td>
                  <td className="p-3"><Badge tone={r.status === "Pass" ? "success" : "warn"}>{r.status}</Badge></td>
                  <td className="p-3"><button className={btnOutline} onClick={() => setOpen(open === r.h.project ? null : r.h.project)}>{open === r.h.project ? "Hide" : "View Calculation Breakdown"}</button></td>
                </tr>
                {open === r.h.project && r.snap && (
                  <tr>
                    <td colSpan={8} className="bg-background p-4">
                      <table className="w-full text-xs">
                        <thead className="text-left text-muted-foreground"><tr><th className="p-1">Line</th><th className="p-1">Formula (price book: {r.bookName})</th><th className="p-1 text-right">Internal cost</th><th className="p-1 text-right">Selling</th></tr></thead>
                        <tbody>
                          {r.snap.lines.map((l) => (
                            <tr key={l.name} className={l.missing ? "text-destructive" : ""}>
                              <td className="p-1 font-medium">{l.name}</td><td className="p-1">{l.formula}</td>
                              <td className="p-1 text-right">{money(l.cost)}</td><td className="p-1 text-right">{money(l.recommended)}</td>
                            </tr>
                          ))}
                          <tr className="border-t font-semibold"><td className="p-1">Recommended total</td><td className="p-1">Internal cost × markup</td><td className="p-1 text-right">{money(r.snap.internalCost)}</td><td className="p-1 text-right">{money(r.snap.recommended)}</td></tr>
                          {r.h.override && (
                            <tr className="text-destructive"><td className="p-1">Manual override</td><td className="p-1">{r.h.override.approved ? "Approved" : "Not approved by manager"}</td><td /><td className="p-1 text-right">{money(r.h.override.amount)}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
