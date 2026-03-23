import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import { MOCK_TICKETS } from "@/data/tickets";
import { Ticket, Clock, AlertTriangle, CheckCircle2, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const openTickets = MOCK_TICKETS.filter((t) => !["Resolved", "Closed"].includes(t.status));
  const criticalTickets = MOCK_TICKETS.filter((t) => t.priority === "Critical" || t.priority === "High");

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back, John</h2>
            <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your tickets today.</p>
          </div>
          <Button variant="accent" onClick={() => navigate("/tickets/new")}>
            + New Ticket
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Open Tickets" value={openTickets.length} icon={Ticket} trend={{ value: "12% from last week", positive: false }} />
          <StatCard title="Avg. Response" value="1.2h" icon={Clock} trend={{ value: "8% improvement", positive: true }} />
          <StatCard title="SLA Compliance" value="94%" icon={TrendingUp} trend={{ value: "2% from last month", positive: true }} />
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
                {MOCK_TICKETS.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border">
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
                  MOCK_TICKETS.reduce<Record<string, number>>((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{cat}</span>
                    <span className="text-sm font-semibold text-primary">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending approvals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" /> Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MOCK_TICKETS.filter((t) => t.status === "Pending" || t.status === "New").map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">{ticket.requestor} · {ticket.subcategory}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="accent">Approve</Button>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
