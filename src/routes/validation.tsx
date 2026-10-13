import { createFileRoute } from "@tanstack/react-router";
import { Badge, card } from "@/components/AppShell";
import { VALIDATION } from "@/lib/demo-data";
import { money } from "@/lib/pricing";
import { canManage, useStore } from "@/lib/store";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Pricing Validation — SunVault Shades Estimator" },
      { name: "description", content: "Compare historical Excel totals with the new estimator engine." },
      { property: "og:title", content: "Pricing Validation — SunVault Shades Estimator" },
      { property: "og:description", content: "Compare historical Excel totals with the new estimator engine." },
    ],
  }),
  component: ValidationPage,
});

const TOLERANCE = 0.05;

function ValidationPage() {
  const { role } = useStore();
  if (!canManage(role)) return <p className={card}>Pricing validation is available to Sales Managers and Administrators.</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Pricing validation</h1>
      <p className="max-w-3xl text-muted-foreground">
        Acceptance criterion: five to ten historical projects are recalculated in the new application and match the approved
        spreadsheet results within the agreed rounding tolerance (demo tolerance ±{money(TOLERANCE)}). Figures are fictional.
      </p>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>{["Project", "Original Excel total", "New app total", "Difference", "Variance", "Status"].map((h) => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {VALIDATION.map((v) => {
              const diff = Math.round((v.app - v.excel) * 100) / 100;
              return (
                <tr key={v.project}>
                  <td className="p-3 font-medium">{v.project}</td>
                  <td className="p-3">{money(v.excel)}</td>
                  <td className="p-3">{money(v.app)}</td>
                  <td className="p-3">{money(diff)}</td>
                  <td className="p-3">{((diff / v.excel) * 100).toFixed(4)}%</td>
                  <td className="p-3"><Badge tone={Math.abs(diff) <= TOLERANCE ? "success" : "warn"}>{Math.abs(diff) <= TOLERANCE ? "Validated" : "Review"}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
