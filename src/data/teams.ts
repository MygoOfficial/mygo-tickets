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
    members: [
      { name: "Mike Johnson", role: "Team Lead", avatar: "MJ" },
      { name: "Dave Chen", role: "Support Engineer", avatar: "DC" },
      { name: "Anna Lopez", role: "Support Engineer", avatar: "AL" },
    ],
    activeTickets: 8, resolvedThisMonth: 23,
  },
  {
    id: "TEAM-002", name: "IT Security", description: "Access management & security operations",
    lead: "Karen Lee",
    members: [
      { name: "Karen Lee", role: "Team Lead", avatar: "KL" },
      { name: "James Wu", role: "Security Analyst", avatar: "JW" },
    ],
    activeTickets: 5, resolvedThisMonth: 14,
  },
  {
    id: "TEAM-003", name: "HR Operations", description: "Employee lifecycle & HR processes",
    lead: "Lisa Park",
    members: [
      { name: "Lisa Park", role: "HR Manager", avatar: "LP" },
      { name: "Nina Gupta", role: "HR Specialist", avatar: "NG" },
      { name: "Sam Torres", role: "HR Coordinator", avatar: "ST" },
    ],
    activeTickets: 4, resolvedThisMonth: 18,
  },
  {
    id: "TEAM-004", name: "Payroll", description: "Payroll processing & queries",
    lead: "Robert Kim",
    members: [
      { name: "Robert Kim", role: "Payroll Manager", avatar: "RK" },
      { name: "Tina Brooks", role: "Payroll Analyst", avatar: "TB" },
    ],
    activeTickets: 3, resolvedThisMonth: 11,
  },
  {
    id: "TEAM-005", name: "Immigration", description: "Visa processing & documentation",
    lead: "Maria Santos",
    members: [
      { name: "Maria Santos", role: "Immigration Lead", avatar: "MS" },
      { name: "Amit Verma", role: "Immigration Specialist", avatar: "AV" },
    ],
    activeTickets: 2, resolvedThisMonth: 6,
  },
];
