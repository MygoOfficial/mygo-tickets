export interface AssetData {
  id: string;
  type: "Laptop" | "Monitor" | "ID Card" | "Mobile Phone" | "Access Card" | "Headset";
  brand?: string;
  model?: string;
  serialNumber: string;
  assignedTo?: string;
  status: "Available" | "Issued" | "Returned" | "Under Repair" | "Retired";
  linkedTicket?: string;
  issuedDate?: string;
  returnDate?: string;
}

export const MOCK_ASSETS: AssetData[] = [
  { id: "AST-001", type: "Laptop", brand: "Apple", model: "MacBook Pro 16\"", serialNumber: "C02ZN1ABCD", assignedTo: "Sarah Chen", status: "Issued", linkedTicket: "TKT-001", issuedDate: "2026-01-15" },
  { id: "AST-002", type: "Laptop", brand: "Dell", model: "Latitude 7440", serialNumber: "DL7440XYZ", assignedTo: "Tom Wilson", status: "Issued", issuedDate: "2025-11-02" },
  { id: "AST-003", type: "Monitor", brand: "Dell", model: "U2723QE", serialNumber: "MN27230AB", status: "Available" },
  { id: "AST-004", type: "ID Card", serialNumber: "IDC-90812", assignedTo: "Raj Patel", status: "Issued", issuedDate: "2025-06-10" },
  { id: "AST-005", type: "Laptop", brand: "Lenovo", model: "ThinkPad X1 Carbon", serialNumber: "LNV-X1C-998", status: "Under Repair", linkedTicket: "TKT-005" },
  { id: "AST-006", type: "Mobile Phone", brand: "Apple", model: "iPhone 15 Pro", serialNumber: "APL-IP15-321", assignedTo: "Emily Watson", status: "Issued", issuedDate: "2026-02-20" },
  { id: "AST-007", type: "Access Card", serialNumber: "ACC-44521", assignedTo: "Priya Sharma", status: "Issued", issuedDate: "2025-09-01" },
  { id: "AST-008", type: "Headset", brand: "Jabra", model: "Evolve2 85", serialNumber: "JBR-E285-112", status: "Available" },
  { id: "AST-009", type: "Laptop", brand: "Apple", model: "MacBook Air M3", serialNumber: "C02MA3-456", status: "Returned", assignedTo: "Dave Chen", returnDate: "2026-03-10" },
  { id: "AST-010", type: "Monitor", brand: "LG", model: "27UK850", serialNumber: "LG27-UK-789", status: "Retired" },
];
