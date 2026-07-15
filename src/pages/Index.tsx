import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import { Ticket, Clock, AlertTriangle, CheckCircle2, Users, TrendingUp, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TicketData {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "New" | "Assigned" | "In Progress" | "Pending" | "Resolved" | "Closed";
  requestorId: number;
  requestor: string;
  assignedTeam: string;
  assigneeId?: number;
  assignee?: string;
  sla: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<TicketData[]>({
    queryKey: ["tickets"],
    queryFn: async () => {
      const response = await fetch("/api/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch tickets");
      return response.json();
    },
    enabled: !!token,
  });

  const assignMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign ticket");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(`Ticket ${data.id} is now assigned to you.`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const openTickets = tickets.filter((t) => !["Resolved", "Closed"].includes(t.status));
  const criticalTickets = tickets.filter((t) => t.priority === "Critical" || t.priority === "High");

  // Filter list of unassigned tickets for Agents
  const unassignedTickets = tickets.filter((t) => !t.assigneeId && t.status === "New");
  // Filter active tickets for Requestors
  const activeRequestorTickets = tickets.filter((t) => !["Resolved", "Closed"].includes(t.status));

  // Response time calculation
  const claimedTickets = tickets.filter(t => t.claimedAt);
  let avgResponseText = "N/A";
  if (claimedTickets.length > 0) {
    const totalResponseTimeMs = claimedTickets.reduce((acc, t) => {
      const diff = new Date(t.claimedAt!).getTime() - new Date(t.createdAt).getTime();
      return acc + diff;
    }, 0);
    const avgMs = totalResponseTimeMs / claimedTickets.length;
    const avgHours = avgMs / (1000 * 60 * 60);
    avgResponseText = avgHours < 1 ? `${Math.round(avgHours * 60)}m` : `${avgHours.toFixed(1)}h`;
  }

  // SLA Compliance calculation
  const resolvedTickets = tickets.filter(t => t.resolvedAt);
  let slaComplianceText = "N/A";
  if (resolvedTickets.length > 0) {
    const withinSla = resolvedTickets.filter(t => {
      const diff = new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime();
      return diff <= 24 * 60 * 60 * 1000; // 24 hours
    }).length;
    const pct = Math.round((withinSla / resolvedTickets.length) * 100);
    slaComplianceText = `${pct}%`;
  }

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your tickets today.</p>
          </div>
          <Button variant="accent" onClick={() => navigate("/tickets/new")}>
            + New Ticket
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Open Tickets" value={openTickets.length} icon={Ticket} trend={{ value: "Based on real-time data", positive: true }} />
          <StatCard title="Avg. Response" value={avgResponseText} icon={Clock} trend={claimedTickets.length > 0 ? { value: "Based on claims", positive: true } : undefined} />
          <StatCard title="SLA Compliance" value={slaComplianceText} icon={TrendingUp} trend={resolvedTickets.length > 0 ? { value: "Based on resolutions", positive: true } : undefined} />
          <StatCard title="Critical Issues" value={criticalTickets.length} icon={AlertTriangle} subtitle="Requires attention" />
        </div>

        {/* Recent tickets + By category */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent Tickets</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")}>View all</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border" onClick={() => navigate("/tickets")}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground shrink-0">{ticket.id}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{ticket.title}</p>
                        <p className="text-xs text-muted-foreground">{ticket.category} · {ticket.requestor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={ticket.priority} />
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-4">No tickets found</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">By Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  tickets.reduce<Record<string, number>>((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat}</span>
                    <span className="text-sm font-semibold text-primary">{count}</span>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-4">No categories</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic bottom panel depending on role */}
        {user?.role === "Agent" ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" /> Open & Unassigned Tickets (Requires Action)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {unassignedTickets.slice(0, 6).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/10 transition-colors">
                    <div className="min-w-0 mr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-medium text-primary">{ticket.id}</span>
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      <p className="text-sm font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">{ticket.requestor} · {ticket.subcategory}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="accent" onClick={() => assignMutation.mutate(ticket.id)} disabled={assignMutation.isPending}>
                        Assign to Me
                      </Button>
                    </div>
                  </div>
                ))}
                {unassignedTickets.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-sm text-muted-foreground">
                    All set! There are no unassigned tickets waiting.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Ticket className="h-4 w-4" /> My Active Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeRequestorTickets.slice(0, 6).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-medium text-primary">{ticket.id}</span>
                        <StatusBadge status={ticket.status} />
                      </div>
                      <p className="text-sm font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">Assigned to: {ticket.assignee || "Unassigned"} · {ticket.subcategory}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => navigate("/tickets")}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                {activeRequestorTickets.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-sm text-muted-foreground">
                    You have no active support tickets. Click "+ New Ticket" to create one.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
