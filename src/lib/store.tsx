import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { CUSTOMERS, PROJECTS, PRICE_BOOKS, type Customer, type PriceBook, type Project, type Role } from "./demo-data";

type Store = {
  role: Role;
  setRole: (r: Role) => void;
  customers: Customer[];
  addCustomer: (c: Omit<Customer, "id">) => Customer;
  projects: Project[];
  addProject: (customerId: string, name: string) => Project;
  updateProject: (id: string, fn: (p: Project) => Project) => void;
  books: PriceBook[];
  setBooks: React.Dispatch<React.SetStateAction<PriceBook[]>>;
  qbTrigger: string;
  setQbTrigger: (v: string) => void;
  restored: boolean;
  resetDemo: () => void;
};
const KEY = "sunvault-demo-v2";

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("rep");
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [projects, setProjects] = useState(PROJECTS);
  const [books, setBooks] = useState(PRICE_BOOKS);
  const [qbTrigger, setQbTrigger] = useState("manual");
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);
  // Offline recovery demo: work survives reloads and lost connection on the tablet.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setCustomers(d.customers); setProjects(d.projects); setBooks(d.books); setQbTrigger(d.qbTrigger); setRole(d.role);
        setRestored(true);
      }
    } catch { /* ignore corrupt demo state */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (loaded.current) localStorage.setItem(KEY, JSON.stringify({ customers, projects, books, qbTrigger, role }));
  }, [customers, projects, books, qbTrigger, role]);
  const resetDemo = () => { localStorage.removeItem(KEY); window.location.reload(); };

  const addCustomer: Store["addCustomer"] = (c) => {
    const nc = { ...c, id: "c" + Date.now() };
    setCustomers((l) => [nc, ...l]);
    return nc;
  };
  const addProject: Store["addProject"] = (customerId, name) => {
    const cust = customers.find((c) => c.id === customerId);
    const book = books.find((b) => b.status === "Active" && b.state === cust?.state) ?? books[0]!;
    const p: Project = {
      id: "p" + Date.now(),
      customerId,
      name,
      priceBookId: book.id,
      approvedPrice: null,
      rep: "Jordan Reyes",
      proposals: [],
      openings: [],
      components: [],
    };
    setProjects((l) => [p, ...l]);
    return p;
  };
  const updateProject: Store["updateProject"] = (id, fn) => setProjects((l) => l.map((p) => (p.id === id ? fn(p) : p)));

  return <Ctx.Provider value={{ role, setRole, customers, addCustomer, projects, addProject, updateProject, books, setBooks, qbTrigger, setQbTrigger, restored, resetDemo }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}

export const canManage = (r: Role) => r === "manager" || r === "admin";
