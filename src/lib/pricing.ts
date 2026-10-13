// MOCK price engine. Each function is a seam where the authoritative
// Excel workbook formulas will be plugged in for production.
import { ADDONS, FABRICS, MOTORS, SERIES, type Opening, type PriceBook, type PriceSnapshot } from "./demo-data";

const label = (list: { id: string; label: string }[], id: string) => list.find((o) => o.id === id)?.label ?? id;
const round2 = (n: number) => Math.round(n * 100) / 100;

export function openingCost(o: Opening, book: PriceBook): number {
  const sqft = (o.widthIn * o.heightIn) / 144;
  const material = sqft * (book.seriesPerSqFt[o.series] ?? 0) * (book.fabricMult[o.fabric] ?? 1);
  const hardware = (book.motor[o.motor] ?? 0) + (book.housing[o.housing] ?? 0) + o.addons.reduce((s, a) => s + (book.addon[a] ?? 0), 0);
  const freight = (material + hardware) * book.freightPct;
  return round2(material + hardware + freight + book.laborPerOpening);
}

export function recommendedPrice(cost: number, book: PriceBook): number {
  return round2(cost * book.markup);
}

export function buildSnapshot(openings: Opening[], book: PriceBook, approved: number | null): PriceSnapshot {
  const lines = openings.map((o) => {
    const cost = openingCost(o, book);
    return {
      name: o.name,
      detail: `${o.widthIn}" × ${o.heightIn}" · ${label(SERIES, o.series)} · ${label(FABRICS, o.fabric)} · ${label(MOTORS, o.motor)}${o.addons.length ? " · " + o.addons.map((a) => label(ADDONS, a)).join(", ") : ""}`,
      cost,
      recommended: recommendedPrice(cost, book),
    };
  });
  const internalCost = round2(lines.reduce((s, l) => s + l.cost, 0));
  const recommended = round2(lines.reduce((s, l) => s + l.recommended, 0));
  return { priceBookId: book.id, priceBookName: book.name, lines, internalCost, recommended, approved: approved ?? recommended };
}

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
