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
  tenantId?: string;
  source?: string;
  logs?: string[];
  claimedAt?: string;
  inProgressAt?: string;
  pendingAt?: string;
  resolvedAt?: string;
  closedAt?: string;
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

export const MOCK_TICKETS: TicketData[] = [];
