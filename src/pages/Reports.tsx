import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";

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

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--muted-foreground))"];

const chartConfig = {
  value: { label: "Tickets", color: "hsl(var(--primary))" },
};

const Reports = () => {
  const { token } = useAuth();

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

  if (isLoading) {
    return (
      <AppLayout title="Reports">
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const statusData = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const categoryData = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const priorityData = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const resolved = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
  const resolutionRate = tickets.length > 0 ? Math.round((resolved / tickets.length) * 100) : 0;

  // Resolution duration calculation
  const resolvedTickets = tickets.filter((t) => t.resolvedAt);
  let avgResolutionText = "N/A";
  if (resolvedTickets.length > 0) {
    const totalResolutionTimeMs = resolvedTickets.reduce((acc, t) => {
      const diff = new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime();
      return acc + diff;
    }, 0);
    const avgMs = totalResolutionTimeMs / resolvedTickets.length;
    const avgHours = avgMs / (1000 * 60 * 60);
    avgResolutionText = avgHours < 1 ? `${Math.round(avgHours * 60)}m` : `${avgHours.toFixed(1)}h`;
  }

  // SLA Compliance by Team calculation
  const teamsList = ["IT Support", "IT Security", "HR Operations", "Payroll", "Immigration"];
  const teamComplianceData = teamsList.map(teamName => {
    const teamResolved = tickets.filter(t => t.assignedTeam === teamName && t.resolvedAt);
    if (teamResolved.length === 0) {
      return { team: teamName, compliance: 100, count: 0 };
    }
    const withinSla = teamResolved.filter(t => {
      const diff = new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime();
      return diff <= 24 * 60 * 60 * 1000; // 24 hours SLA Target
    }).length;
    const pct = Math.round((withinSla / teamResolved.length) * 100);
    return { team: teamName, compliance: pct, count: teamResolved.length };
  });

  return (
    <AppLayout title="Reports">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tickets" value={tickets.length} icon={BarChart3} />
          <StatCard title="Resolution Rate" value={`${resolutionRate}%`} icon={TrendingUp} trend={{ value: "Based on database tickets", positive: true }} />
          <StatCard title="Avg. Resolution" value={avgResolutionText} icon={Clock} />
          <StatCard title="Resolved" value={resolved} icon={CheckCircle2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tickets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No category data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tickets by Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {statusData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No status data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tickets by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              {priorityData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <BarChart data={priorityData} margin={{ left: 10, right: 10 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {priorityData.map((entry, i) => {
                        const colors: Record<string, string> = { Low: "hsl(var(--muted-foreground))", Medium: "hsl(var(--primary))", High: "hsl(var(--accent))", Critical: "hsl(var(--destructive))" };
                        return <Cell key={i} fill={colors[entry.name] || "hsl(var(--primary))"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">No priority data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">SLA Compliance by Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                {teamComplianceData.map((item) => (
                  <div key={item.team} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.team} <span className="text-[10px] text-muted-foreground">({item.count} resolved)</span></span>
                      <span className="font-semibold">{item.compliance}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.compliance}%`,
                          backgroundColor: item.compliance >= 95 ? "hsl(var(--success))" : item.compliance >= 90 ? "hsl(var(--primary))" : "hsl(var(--accent))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
