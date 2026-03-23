import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { MOCK_TICKETS } from "@/data/tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

const statusData = Object.entries(
  MOCK_TICKETS.reduce<Record<string, number>>((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {})
).map(([name, value]) => ({ name, value }));

const categoryData = Object.entries(
  MOCK_TICKETS.reduce<Record<string, number>>((acc, t) => { acc[t.category] = (acc[t.category] || 0) + 1; return acc; }, {})
).map(([name, value]) => ({ name, value }));

const priorityData = Object.entries(
  MOCK_TICKETS.reduce<Record<string, number>>((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {})
).map(([name, value]) => ({ name, value }));

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--muted-foreground))"];

const resolved = MOCK_TICKETS.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
const slaCompliance = Math.round((resolved / MOCK_TICKETS.length) * 100);

const chartConfig = {
  value: { label: "Tickets", color: "hsl(var(--primary))" },
};

const Reports = () => {
  return (
    <AppLayout title="Reports">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tickets" value={MOCK_TICKETS.length} icon={BarChart3} />
          <StatCard title="Resolution Rate" value={`${slaCompliance}%`} icon={TrendingUp} trend={{ value: "5% improvement", positive: true }} />
          <StatCard title="Avg. Resolution" value="6.2h" icon={Clock} />
          <StatCard title="Resolved" value={resolved} icon={CheckCircle2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tickets by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tickets by Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tickets by Priority</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">SLA Compliance by Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                {[
                  { team: "IT Support", compliance: 92 },
                  { team: "IT Security", compliance: 97 },
                  { team: "HR Operations", compliance: 88 },
                  { team: "Payroll", compliance: 95 },
                  { team: "Immigration", compliance: 100 },
                ].map((item) => (
                  <div key={item.team} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.team}</span>
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
