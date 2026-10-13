// MOCK price engine. Each function is a seam where the authoritative
// Excel workbook formulas will be plugged in for production.
import { ADDONS, FABRICS, KIND_LABEL, MOTORS, SERIES, type Component, type Opening, type PriceBook, type PriceSnapshot } from "./demo-data";

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

// Returns cost and a human-readable formula showing where the number came from.
export function componentCost(c: Component, book: PriceBook): { cost: number; formula: string; missing: boolean } {
  const r = book.rates;
  if (!(c.qty > 0)) return { cost: 0, formula: "Incomplete quantity", missing: true };
  switch (c.kind) {
    case "sail": {
      if (!(c.sqft && c.sqft > 0)) return { cost: 0, formula: "Incomplete sail size", missing: true };
      const mult = book.fabricMult[c.fabric ?? "sol90"] ?? 1;
      const unit = c.sqft * r.sailPerSqFt * mult + r.sailInstall;
      return { cost: round2(unit * c.qty), formula: `${c.qty} × (${c.sqft} sq ft × ${money(r.sailPerSqFt)} × fabric ${mult} + install ${money(r.sailInstall)})`, missing: false };
    }
    case "pole": {
      const h = c.heightFt ?? 0;
      if (!(h > 0)) return { cost: 0, formula: "Incomplete pole height", missing: true };
      return { cost: round2(c.qty * (r.pole + h * r.polePerFt)), formula: `${c.qty} × (${money(r.pole)} + ${h} ft × ${money(r.polePerFt)})`, missing: false };
    }
    case "mount":
      return { cost: round2(c.qty * r.mount), formula: `${c.qty} × ${money(r.mount)} mount rate`, missing: false };
    case "footing":
      return { cost: round2(c.qty * r.footing), formula: `${c.qty} × ${money(r.footing)} footing rate`, missing: false };
    case "hardware": {
      if (c.label.includes("no rate") && c.unitOverride == null) return { cost: 0, formula: "Missing price — no price-book rate", missing: true };
      const unit = c.unitOverride ?? r.hardware;
      return { cost: round2(c.qty * unit), formula: `${c.qty} × ${money(unit)} hardware rate`, missing: false };
    }
  }
}

export function componentsOverhead(cs: Component[], book: PriceBook) {
  if (!cs.length) return null;
  const r = book.rates;
  return { cost: r.equipment + 30 * r.travelPerMile, formula: `Equipment ${money(r.equipment)} + travel 30 mi × ${money(r.travelPerMile)}` };
}

export function buildSnapshot(openings: Opening[], book: PriceBook, approved: number | null, components: Component[] = []): PriceSnapshot {
  const compLines = components.map((c) => {
    const { cost, formula, missing } = componentCost(c, book);
    return { name: `${KIND_LABEL[c.kind]} — ${c.label}`, detail: formula, formula, cost, recommended: recommendedPrice(cost, book), missing };
  });
  const oh = componentsOverhead(components, book);
  if (oh) compLines.push({ name: "Equipment & travel", detail: oh.formula, formula: oh.formula, cost: round2(oh.cost), recommended: recommendedPrice(oh.cost, book), missing: false });
  const openingLines = openings.map((o) => {
    const cost = openingCost(o, book);
    return {
      name: o.name,
      detail: `${o.widthIn}" × ${o.heightIn}" · ${label(SERIES, o.series)} · ${label(FABRICS, o.fabric)} · ${label(MOTORS, o.motor)}${o.addons.length ? " · " + o.addons.map((a) => label(ADDONS, a)).join(", ") : ""}`,
      cost,
      recommended: recommendedPrice(cost, book),
      formula: `Material + hardware + ${book.freightPct * 100}% freight + labour ${money(book.laborPerOpening)}`,
    };
  });
  const lines = [...compLines, ...openingLines];
  const internalCost = round2(lines.reduce((s, l) => s + l.cost, 0));
  const recommended = round2(lines.reduce((s, l) => s + l.recommended, 0));
  return { priceBookId: book.id, priceBookName: book.name, lines, internalCost, recommended, approved: approved ?? recommended };
}

export function money(n: number) { return fmt(n); }
const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
