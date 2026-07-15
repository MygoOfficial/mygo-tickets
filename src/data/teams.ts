export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

export interface TeamData {
  id: string;
  name: string;
  description: string;
  lead: string;
  members: TeamMember[];
  activeTickets: number;
  resolvedThisMonth: number;
}

export const MOCK_TEAMS: TeamData[] = [
  {
    id: "TEAM-001", name: "IT Support", description: "Hardware, software & infrastructure support",
    lead: "Mike Johnson",
    members: [],
    activeTickets: 8, resolvedThisMonth: 23,
  },
  {
    id: "TEAM-002", name: "IT Security", description: "Access management & security operations",
    lead: "Karen Lee",
    members: [],
    activeTickets: 5, resolvedThisMonth: 14,
  },
  {
    id: "TEAM-003", name: "HR Operations", description: "Employee lifecycle & HR processes",
    lead: "Lisa Park",
    members: [],
    activeTickets: 4, resolvedThisMonth: 18,
  },
  {
    id: "TEAM-004", name: "Payroll", description: "Payroll processing & queries",
    lead: "Robert Kim",
    members: [],
    activeTickets: 3, resolvedThisMonth: 11,
  },
  {
    id: "TEAM-005", name: "Immigration", description: "Visa processing & documentation",
    lead: "Maria Santos",
    members: [],
    activeTickets: 2, resolvedThisMonth: 6,
  },
];
