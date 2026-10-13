import { createContext, useContext, useState, type ReactNode } from "react";
import { CUSTOMERS, PROJECTS, PRICE_BOOKS, type Customer, type Project, type Role } from "./demo-data";

type Store = {
  role: Role;
  setRole: (r: Role) => void;
  customers: Customer[];
  addCustomer: (c: Omit<Customer, "id">) => Customer;
  projects: Project[];
  addProject: (customerId: string, name: string) => Project;
  updateProject: (id: string, fn: (p: Project) => Project) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("rep");
  const [customers, setCustomers] = useState(CUSTOMERS);
  const [projects, setProjects] = useState(PROJECTS);

  const addCustomer: Store["addCustomer"] = (c) => {
    const nc = { ...c, id: "c" + Date.now() };
    setCustomers((l) => [nc, ...l]);
    return nc;
  };
  const addProject: Store["addProject"] = (customerId, name) => {
    const cust = customers.find((c) => c.id === customerId);
    const book = PRICE_BOOKS.find((b) => b.current && b.state === cust?.state) ?? PRICE_BOOKS[0]!;
    const p: Project = {
      id: "p" + Date.now(),
      customerId,
      name,
      priceBookId: book.id,
      approvedPrice: null,
      proposals: [],
      openings: [{ id: "o" + Date.now(), name: "Opening 1", widthIn: 144, heightIn: 96, series: "zip", fabric: "sol90", motor: "rts", housing: "square", addons: [] }],
    };
    setProjects((l) => [p, ...l]);
    return p;
  };
  const updateProject: Store["updateProject"] = (id, fn) => setProjects((l) => l.map((p) => (p.id === id ? fn(p) : p)));

  return <Ctx.Provider value={{ role, setRole, customers, addCustomer, projects, addProject, updateProject }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
}

export const canManage = (r: Role) => r === "manager" || r === "admin";
