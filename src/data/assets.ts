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

export const MOCK_ASSETS: AssetData[] = [];
