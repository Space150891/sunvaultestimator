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
  rates: { sailPerSqFt: number; sailInstall: number; pole: number; polePerFt: number; mount: number; footing: number; hardware: number; equipment: number; travelPerMile: number; marginFloorPct: number; depositPct: number };
  seriesPerSqFt: Record<string, number>;
  fabricMult: Record<string, number>;
  motor: Record<string, number>;
  housing: Record<string, number>;
  addon: Record<string, number>;
  laborPerOpening: number;
  freightPct: number;
  markup: number; // recommended price = cost * markup
};
const rates = { sailPerSqFt: 9.5, sailInstall: 240, polePerFt: 22, mount: 85, pole: 310, footing: 185, hardware: 95, equipment: 150, travelPerMile: 2.1, marginFloorPct: 35, depositPct: 30 };

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

export type ComponentKind = "sail" | "pole" | "mount" | "footing" | "hardware";
export type Component = {
  id: string;
  kind: ComponentKind;
  label: string;
  qty: number;
  sqft?: number; // sails
  fabric?: string; // sails
  heightFt?: number; // poles
  unitOverride?: number; // hardware with a custom price (no price-book rate)
};
export const KIND_LABEL: Record<ComponentKind, string> = { sail: "Sail", pole: "Pole", mount: "Wall mount", footing: "Footing", hardware: "Hardware kit" };

export type PriceSnapshot = {
  priceBookId: string;
  priceBookName: string;
  lines: { name: string; detail: string; cost: number; recommended: number; formula?: string; missing?: boolean }[];
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
  components: Component[];
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
    components: [],
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
    name: "Pool cabana shade sails",
    priceBookId: "az-2026-10",
    components: [
      { id: "k1", kind: "sail", label: "Pool sail A (hypar)", qty: 1, sqft: 320, fabric: "sol95" },
      { id: "k2", kind: "sail", label: "Pool sail B", qty: 1, sqft: 260, fabric: "sol95" },
      { id: "k3", kind: "pole", label: "Steel pole 4\"", qty: 4, heightFt: 14 },
      { id: "k4", kind: "mount", label: "Fascia wall mount", qty: 2 },
      { id: "k5", kind: "footing", label: "Concrete footing 24\"×60\"", qty: 4 },
      { id: "k6", kind: "hardware", label: "Turnbuckle & shackle kit", qty: 6 },
    ],
    approvedPrice: null,
    rep: "Jordan Reyes",
    proposals: [],
    openings: [
      { id: "o3", name: "Cabana front", widthIn: 144, heightIn: 96, series: "cable", fabric: "sol90", motor: "manual", housing: "open", addons: [] },
    ],
  },
];

export type HistoricalProject = { project: string; bookId: string; components: Component[]; excelOffset: number; override?: { amount: number; approved: boolean } };
const sails = (a: number, b: number): Component[] => [
  { id: "h1", kind: "sail", label: "Sail 1", qty: 1, sqft: a, fabric: "sol90" },
  { id: "h2", kind: "sail", label: "Sail 2", qty: 1, sqft: b, fabric: "sol95" },
  { id: "h3", kind: "pole", label: "Steel pole", qty: 3, heightFt: 12 },
  { id: "h4", kind: "mount", label: "Wall mount", qty: 3 },
  { id: "h5", kind: "footing", label: "Concrete footing", qty: 3 },
  { id: "h6", kind: "hardware", label: "Hardware kit", qty: 6 },
];
// Fictional history. excelOffset = demo difference between the spreadsheet total and the app total.
export const HISTORICAL: HistoricalProject[] = [
  { project: "Holbrook Residence (2025)", bookId: "ut-prev", components: sails(210, 180), excelOffset: 0 },
  { project: "Mesa Verde HOA Clubhouse", bookId: "az-2026-10", components: sails(520, 480), excelOffset: 0.4 },
  { project: "Larkin Backyard Sails", bookId: "ut-2026-10", components: sails(150, 140), excelOffset: -0.01 },
  { project: "Sunridge Playground", bookId: "ut-2026-10", components: [...sails(300, 280), { id: "h7", kind: "hardware", label: "Custom gate bracket (no rate)", qty: 2 }], excelOffset: 0 },
  { project: "Chandler Office Courtyard", bookId: "az-2026-10", components: sails(400, 0), excelOffset: 0 },
  { project: "Kaysville Patio (discounted)", bookId: "ut-2026-10", components: sails(180, 160), excelOffset: 0, override: { amount: -500, approved: false } },
];

export const APPOINTMENTS = [
  { time: "10:00 AM", name: "Carla Nguyen", email: "carla.nguyen@example.com", phone: "801-555-0175", address: "77 S Willow Bend, Sandy", state: "UT" as const, note: "New lead — backyard shade sails" },
  { time: "2:30 PM", name: "Dan Ortiz", email: "dan.ortiz@example.com", phone: "480-555-0187", address: "8821 N Saguaro Ln, Scottsdale", state: "AZ" as const, note: "Referral — may already be a customer" },
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
