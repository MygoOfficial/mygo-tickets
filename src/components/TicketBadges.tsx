import { Badge } from "@/components/ui/badge";
import type { TicketData } from "@/data/tickets";

export function StatusBadge({ status }: { status: TicketData["status"] }) {
  const variantMap: Record<TicketData["status"], "info" | "warning" | "success" | "muted" | "default" | "secondary"> = {
    New: "info",
    Assigned: "default",
    "In Progress": "warning",
    Pending: "muted",
    Resolved: "success",
    Closed: "secondary",
  };
  return <Badge variant={variantMap[status]}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: TicketData["priority"] }) {
  const variantMap: Record<TicketData["priority"], "muted" | "info" | "warning" | "destructive"> = {
    Low: "muted",
    Medium: "info",
    High: "warning",
    Critical: "destructive",
  };
  return <Badge variant={variantMap[priority]}>{priority}</Badge>;
}
