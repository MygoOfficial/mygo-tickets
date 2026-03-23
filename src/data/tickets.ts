export interface TicketData {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "New" | "Assigned" | "In Progress" | "Pending" | "Resolved" | "Closed";
  requestor: string;
  assignedTeam: string;
  assignee?: string;
  sla: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES: Record<string, string[]> = {
  "Employee Lifecycle": [
    "Company Onboarding",
    "Project Onboarding",
    "Project Offboarding",
    "Company Offboarding",
  ],
  "IT Operations": [
    "Asset Requests",
    "Software Issues",
    "Infrastructure Issues",
  ],
  "Access Management": [
    "SAP Access",
    "Non-SAP Access",
    "Role Changes",
  ],
  "HR & Payroll": [
    "Payroll Queries",
    "Benefits",
    "Leave Issues",
  ],
  "Recruitment": [
    "Candidate Onboarding Support",
  ],
  "Immigration": [
    "Visa / Documentation",
  ],
};

export const MOCK_TICKETS: TicketData[] = [
  {
    id: "TKT-001",
    title: "New laptop request for onboarding",
    description: "Need a MacBook Pro for new hire starting March 28",
    category: "IT Operations",
    subcategory: "Asset Requests",
    priority: "High",
    status: "In Progress",
    requestor: "Sarah Chen",
    assignedTeam: "IT Support",
    assignee: "Mike Johnson",
    sla: "4h Response / 24h Resolution",
    createdAt: "2026-03-22T09:00:00Z",
    updatedAt: "2026-03-22T11:30:00Z",
  },
  {
    id: "TKT-002",
    title: "SAP access for new consultant",
    description: "Grant SAP FI/CO access for Alex Kumar joining Finance team",
    category: "Access Management",
    subcategory: "SAP Access",
    priority: "Medium",
    status: "Pending",
    requestor: "Raj Patel",
    assignedTeam: "IT Security",
    sla: "2h Response / 8h Resolution",
    createdAt: "2026-03-21T14:00:00Z",
    updatedAt: "2026-03-22T08:00:00Z",
  },
  {
    id: "TKT-003",
    title: "Payroll discrepancy - March salary",
    description: "Overtime hours not reflected in March payslip",
    category: "HR & Payroll",
    subcategory: "Payroll Queries",
    priority: "High",
    status: "Assigned",
    requestor: "Emily Watson",
    assignedTeam: "Payroll",
    assignee: "Lisa Park",
    sla: "1h Response / 4h Resolution",
    createdAt: "2026-03-23T07:00:00Z",
    updatedAt: "2026-03-23T07:15:00Z",
  },
  {
    id: "TKT-004",
    title: "Company onboarding - batch of 5",
    description: "New batch of consultants joining on April 1st",
    category: "Employee Lifecycle",
    subcategory: "Company Onboarding",
    priority: "Critical",
    status: "New",
    requestor: "HR Team",
    assignedTeam: "HR Operations",
    sla: "30m Response / 2h Resolution",
    createdAt: "2026-03-23T08:00:00Z",
    updatedAt: "2026-03-23T08:00:00Z",
  },
  {
    id: "TKT-005",
    title: "VPN connectivity issue",
    description: "Unable to connect to corporate VPN from home office",
    category: "IT Operations",
    subcategory: "Infrastructure Issues",
    priority: "Medium",
    status: "Resolved",
    requestor: "Tom Wilson",
    assignedTeam: "IT Support",
    assignee: "Dave Chen",
    sla: "2h Response / 8h Resolution",
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-03-20T14:00:00Z",
  },
  {
    id: "TKT-006",
    title: "Visa renewal documentation",
    description: "H1B visa renewal - need employment verification letter",
    category: "Immigration",
    subcategory: "Visa / Documentation",
    priority: "High",
    status: "In Progress",
    requestor: "Priya Sharma",
    assignedTeam: "Immigration",
    assignee: "Karen Lee",
    sla: "1h Response / 24h Resolution",
    createdAt: "2026-03-22T16:00:00Z",
    updatedAt: "2026-03-23T09:00:00Z",
  },
];
