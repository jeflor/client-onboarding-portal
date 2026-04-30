import type { TeamMember, Role } from "./types";

export const team: TeamMember[] = [
  // Onboarding managers
  {
    id: "om_avery",
    name: "Avery Sinclair",
    initials: "AS",
    email: "avery.sinclair@northwind.io",
    role: "onboarding",
    title: "Senior Onboarding Manager",
    avatarColor: "#0e8a99",
  },
  {
    id: "om_priya",
    name: "Priya Shankar",
    initials: "PS",
    email: "priya.shankar@northwind.io",
    role: "onboarding",
    title: "Onboarding Manager",
    avatarColor: "#10b981",
  },
  // Implementation
  {
    id: "imp_kenji",
    name: "Kenji Tanaka",
    initials: "KT",
    email: "kenji.tanaka@northwind.io",
    role: "implementation",
    title: "Implementation Lead",
    avatarColor: "#8b5cf6",
  },
  {
    id: "imp_dante",
    name: "Dante Russo",
    initials: "DR",
    email: "dante.russo@northwind.io",
    role: "implementation",
    title: "Solutions Engineer",
    avatarColor: "#f59e0b",
  },
  // Client Success
  {
    id: "csm_sloane",
    name: "Sloane Whitaker",
    initials: "SW",
    email: "sloane.whitaker@northwind.io",
    role: "success",
    title: "Customer Success Manager",
    avatarColor: "#ef4444",
  },
  {
    id: "csm_ines",
    name: "Inés Marchetti",
    initials: "IM",
    email: "ines.marchetti@northwind.io",
    role: "success",
    title: "Senior CSM",
    avatarColor: "#3b82f6",
  },
  // Sales
  {
    id: "sales_morgan",
    name: "Morgan Avery",
    initials: "MA",
    email: "morgan.avery@northwind.io",
    role: "sales",
    title: "Senior Account Executive",
    avatarColor: "#5a85fb",
  },
  {
    id: "sales_jordan",
    name: "Jordan Reyes",
    initials: "JR",
    email: "jordan.reyes@northwind.io",
    role: "sales",
    title: "Account Executive",
    avatarColor: "#1f2533",
  },
];

export const teamById = Object.fromEntries(team.map((t) => [t.id, t]));

// Default user per role
export const defaultUserId: Record<Role, string> = {
  sales: "sales_morgan",
  onboarding: "om_avery",
  implementation: "imp_kenji",
  success: "csm_sloane",
};

export const roleLabel: Record<Role, string> = {
  sales: "Sales",
  onboarding: "Onboarding Manager",
  implementation: "Implementation",
  success: "Client Success",
};
