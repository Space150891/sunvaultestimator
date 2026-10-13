// All values in this file are FICTIONAL demonstration data.
// Production pricing will come from the five authoritative Excel workbooks.

export type Role = "rep" | "manager" | "admin";
export const ROLE_LABEL: Record<Role, string> = {
  rep: "Sales Representative",
  manager: "Sales Manager",
  admin: "Administrator",
};

export type Option = { id: string; label: string; note?: string };

export const SERIES: Option[] = [
  { id: "zip", label: "Zip-Track Retractable Screen", note: "Wind-rated side retention" },
  { id: "cable", label: "Cable-Guided Drop Shade", note: "Open sides, budget friendly" },
  { id: "pergola", label: "Pergola Louver Screen", note: "Mounts under louvered roof" },
];
export const FABRICS: Option[] = [
  { id: "sol90", label: "Solar 90% blockout" },
  { id: "sol95", label: "Solar 95% blockout" },
  { id: "privacy", label: "Privacy 99%" },
  { id: "insect", label: "Insect mesh" },
];
export const MOTORS: Option[] = [
  { id: "manual", label: "Manual crank" },
  { id: "rts", label: "Hardwired radio motor" },
  { id: "smart", label: "Smart-home motor" },
  { id: "solar", label: "Solar battery motor" },
];
export const HOUSINGS: Option[] = [
  { id: "open", label: "Open bracket" },
  { id: "square", label: '5" square cassette' },
  { id: "round", label: "Rounded cassette" },
];
export const ADDONS: Option[] = [
  { id: "wind", label: "Wind sensor" },
  { id: "remote", label: "Multi-channel remote" },
  { id: "hub", label: "Smart home hub" },
  { id: "color", label: "Custom powder-coat colour" },
];

export type PriceBook = {
  id: string;
  name: string;
  state: "UT" | "AZ";
  status: "Draft" | "Active" | "Archived";
  effectiveDate: string;
  createdBy: string;
  // Display-only demo rate groups (production values come from Excel workbooks)
  rates: { pole: number; footing: number; hardware: number; equipment: number; travelPerMile: number; marginFloorPct: number; depositPct: number };
  seriesPerSqFt: Record<string, number>;
  fabricMult: Record<string, number>;
  motor: Record<string, number>;
  housing: Record<string, number>;
  addon: Record<string, number>;
  laborPerOpening: number;
  freightPct: number;
  markup: number; // recommended price = cost * markup
};
const rates = { pole: 310, footing: 185, hardware: 95, equipment: 150, travelPerMile: 2.1, marginFloorPct: 35, depositPct: 30 };

const base = {
  seriesPerSqFt: { zip: 28, cable: 16, pergola: 24 },
  fabricMult: { sol90: 1, sol95: 1.05, privacy: 1.12, insect: 0.95 },
  motor: { manual: 60, rts: 420, smart: 560, solar: 640 },
  housing: { open: 0, square: 180, round: 220 },
  addon: { wind: 140, remote: 90, hub: 210, color: 160 },
};

export const PRICE_BOOKS: PriceBook[] = [
  { id: "ut-2026-10", name: "Utah — October 2026", state: "UT", status: "Active", effectiveDate: "2026-10-01", createdBy: "A. Admin", rates, ...base, laborPerOpening: 380, freightPct: 0.04, markup: 1.9 },
  { id: "az-2026-10", name: "Arizona — October 2026", state: "AZ", status: "Active", effectiveDate: "2026-10-01", createdBy: "A. Admin", rates: { ...rates, travelPerMile: 2.4 }, ...base, seriesPerSqFt: { zip: 29.5, cable: 17, pergola: 25 }, laborPerOpening: 420, freightPct: 0.06, markup: 1.85 },
  { id: "ut-prev", name: "Utah — Previous Version", state: "UT", status: "Archived", effectiveDate: "2026-04-01", createdBy: "A. Admin", rates, ...base, seriesPerSqFt: { zip: 26, cable: 15, pergola: 22 }, laborPerOpening: 350, freightPct: 0.04, markup: 1.9 },
];

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: "UT" | "AZ";
};

export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Megan Holloway", email: "megan.holloway@example.com", phone: "801-555-0142", address: "1240 E Canyon Ridge Dr, Draper", state: "UT" },
  { id: "c2", name: "Daniel Ortiz", email: "d.ortiz@example.com", phone: "480-555-0187", address: "8821 N Saguaro Ln, Scottsdale", state: "AZ" },
  { id: "c3", name: "Priya & Sam Kendall", email: "kendall.home@example.com", phone: "385-555-0119", address: "455 W Juniper Ct, Lehi", state: "UT" },
  { id: "c4", name: "Ridgeview Dental Group", email: "office@ridgeview-demo.com", phone: "602-555-0163", address: "3100 E Camelback Rd, Phoenix", state: "AZ" },
];

export type Opening = {
  id: string;
  name: string;
  widthIn: number;
  heightIn: number;
  series: string;
  fabric: string;
  motor: string;
  housing: string;
  addons: string[];
};

export type PriceSnapshot = {
  priceBookId: string;
  priceBookName: string;
  lines: { name: string; detail: string; cost: number; recommended: number }[];
  internalCost: number;
  recommended: number;
  approved: number;
};

export type ProposalVersion = {
  version: number;
  createdAt: string;
  snapshot: PriceSnapshot;
  signature?: { name: string; dataUrl: string; at: string };
  ghlSyncedAt?: string;
};

export type Project = {
  id: string;
  customerId: string;
  name: string;
  priceBookId: string;
  openings: Opening[];
  approvedPrice: number | null;
  approvedBy?: string;
  rep: string;
  ops?: OpsHandoff;
  ghl?: GhlState;
  proposals: ProposalVersion[];
};

export const PROJECTS: Project[] = [
  {
    id: "p1",
    customerId: "c1",
    name: "Back patio enclosure",
    priceBookId: "ut-2026-10",
    approvedPrice: null,
    rep: "Jordan Reyes",
    proposals: [],
    openings: [
      { id: "o1", name: "South patio main span", widthIn: 192, heightIn: 108, series: "zip", fabric: "sol95", motor: "rts", housing: "square", addons: ["wind"] },
      { id: "o2", name: "West side drop", widthIn: 120, heightIn: 108, series: "zip", fabric: "sol95", motor: "rts", housing: "square", addons: [] },
    ],
  },
  {
    id: "p2",
    customerId: "c2",
    name: "Pool cabana shades",
    priceBookId: "az-2026-10",
    approvedPrice: null,
    rep: "Jordan Reyes",
    proposals: [],
    openings: [
      { id: "o3", name: "Cabana front", widthIn: 144, heightIn: 96, series: "cable", fabric: "sol90", motor: "manual", housing: "open", addons: [] },
    ],
  },
];

export const VALIDATION = [
  { project: "Holbrook Residence (2025)", excel: 14862.4, app: 14862.4 },
  { project: "Mesa Verde HOA Clubhouse", excel: 38410.0, app: 38410.0 },
  { project: "Larkin Patio Enclosure", excel: 9275.55, app: 9275.56 },
  { project: "Sunridge Pergola Package", excel: 21940.1, app: 21940.1 },
  { project: "Chandler Office Courtyard", excel: 27118.75, app: 27118.74 },
];

export type OpsStatus = "Not sent" | "Handoff Received" | "Measurements Need Review" | "Ready for Engineering" | "Ready for Fabrication";
export type OpsHandoff = {
  sails: number; poles: number; wallMounts: number; footings: number; hardware: string;
  specialConditions: string; depositStatus: "Not requested" | "Requested" | "Received";
  requiredDate: string; notes: string; status: OpsStatus;
};
export type GhlLog = { at: string; action: string; ok: boolean; detail: string };
export type GhlState = { contactId?: string; opportunityId?: string; userId: string; stage: string; log: GhlLog[]; failed?: boolean };
export const GHL_USERS: Record<string, string> = { "Jordan Reyes": "ghl_usr_7Hq2Lx", "Taylor Brooks": "ghl_usr_3Mn8Pz" };
// Demo: contacts that already exist in GoHighLevel (by email)
export const GHL_EXISTING: Record<string, string> = { "megan.holloway@example.com": "ghl_ct_9XkP2m" };
