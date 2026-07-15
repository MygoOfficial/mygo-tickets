import { AppLayout } from "@/components/AppLayout";
import { StatusBadge, PriorityBadge } from "@/components/TicketBadges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Loader2, CheckCircle2, UserCheck, Globe, Building, Terminal, User, Tag, Shield, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useTimezone, TIMEZONE_MAP } from "@/context/TimezoneContext";

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
  tenantId?: string;
  source?: string;
  logs?: string[];
  claimedAt?: string;
  inProgressAt?: string;
  pendingAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

const TicketsList = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const { timezone, setTimezone, formatTime } = useTimezone();

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
      toast.success(`Ticket ${data.id} has been assigned to you.`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(`Ticket ${data.id} status updated to ${data.status}`);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.requestor.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <AppLayout title="Tickets">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64 h-10 bg-card"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-10 bg-card">
                <Filter className="h-3.5 w-3.5 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Assigned">Assigned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40 h-10 bg-card">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-28 h-10 bg-card">
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(TIMEZONE_MAP).map((tz) => (
                  <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="accent" className="h-10" onClick={() => navigate("/tickets/new")}>
            <Plus className="h-4 w-4 mr-1" /> New Ticket
          </Button>
        </div>

        {/* Table / Listing */}
        {isLoading ? (
          <div className="h-[50vh] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SLA</th>
                    <th className="text-center p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[180px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ticket) => {
                    const isAssignedToMe = ticket.assigneeId === user?.id;
                    const canSelfAssign = user?.role === "Agent" && !ticket.assigneeId;

                    return (
                      <tr 
                        key={ticket.id} 
                        className="border-b last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <td className="p-4 text-sm font-mono text-primary font-bold">{ticket.id}</td>
                        <td className="p-4">
                          <p className="text-sm font-medium">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Raised by: {ticket.requestor}</p>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{ticket.subcategory}</td>
                        <td className="p-4">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="p-4">
                          <StatusBadge status={ticket.status} />
                        </td>
                        <td className="p-4 text-sm">
                          {ticket.assignee || <span className="text-muted-foreground italic">Unassigned</span>}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{ticket.sla}</td>
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center items-center gap-2">
                            {canSelfAssign && (
                              <Button
                                size="sm"
                                variant="accent"
                                className="h-8 text-xs font-semibold"
                                onClick={() => assignMutation.mutate(ticket.id)}
                                disabled={assignMutation.isPending}
                              >
                                <UserCheck className="h-3.5 w-3.5 mr-1" /> Claim
                              </Button>
                            )}

                            {isAssignedToMe && user?.role === "Agent" && (
                              <Select
                                value={ticket.status}
                                onValueChange={(val) =>
                                  statusMutation.mutate({ ticketId: ticket.id, status: val })
                                }
                              >
                                <SelectTrigger className="h-8 w-[140px] text-xs font-medium bg-background border-border">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Assigned">Assigned</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Resolved">Resolved (Fix)</SelectItem>
                                  <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            )}

                            {user?.role === "Requestor" &&
                              ticket.requestorId === user.id &&
                              ticket.status !== "Closed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                                  onClick={() =>
                                    statusMutation.mutate({ ticketId: ticket.id, status: "Closed" })
                                  }
                                >
                                  Close
                                </Button>
                              )}

                            {!canSelfAssign &&
                              !isAssignedToMe &&
                              !(user?.role === "Requestor" && ticket.requestorId === user.id) && (
                                <span className="text-xs text-muted-foreground italic">No actions</span>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground text-sm font-medium">
                        No tickets found matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && (
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {tickets.length} tickets
          </p>
        )}

        <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto w-full max-h-screen">
            {selectedTicket && (
              <div className="space-y-6">
                <SheetHeader className="text-left border-b pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground font-semibold uppercase bg-muted px-2 py-1 rounded">
                      {selectedTicket.id}
                    </span>
                    <div className="flex gap-2">
                      <PriorityBadge priority={selectedTicket.priority} />
                      <StatusBadge status={selectedTicket.status} />
                    </div>
                  </div>
                  <SheetTitle className="text-xl font-bold mt-3 leading-snug">
                    {selectedTicket.title}
                  </SheetTitle>
                  <SheetDescription className="text-xs mt-1 text-muted-foreground">
                    Raised on {formatTime(selectedTicket.createdAt)}
                  </SheetDescription>
                </SheetHeader>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Description</h4>
                  <div className="text-sm text-muted-foreground bg-muted/40 p-4 rounded-xl border whitespace-pre-wrap min-h-[80px]">
                    {selectedTicket.description || <span className="italic text-muted-foreground">No description provided.</span>}
                  </div>
                </div>

                {/* Core Information Grid */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Ticket Details</h4>
                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border text-sm">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">Category</span>
                      <span className="font-medium flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedTicket.category}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">Subcategory</span>
                      <span className="font-medium">{selectedTicket.subcategory}</span>
                    </div>
                    <div className="space-y-1 col-span-2 border-t pt-2 mt-1">
                      <span className="text-xs text-muted-foreground block">Requestor</span>
                      <span className="font-medium flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedTicket.requestor}
                      </span>
                    </div>
                    <div className="space-y-1 border-t pt-2 mt-1">
                      <span className="text-xs text-muted-foreground block">Assigned Team</span>
                      <span className="font-medium flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedTicket.assignedTeam}
                      </span>
                    </div>
                    <div className="space-y-1 border-t pt-2 mt-1">
                      <span className="text-xs text-muted-foreground block">Assignee</span>
                      <span className="font-medium">
                        {selectedTicket.assignee || <span className="text-muted-foreground italic">Unassigned</span>}
                      </span>
                    </div>
                    <div className="space-y-1 col-span-2 border-t pt-2 mt-1">
                      <span className="text-xs text-muted-foreground block">SLA Target</span>
                      <span className="font-medium flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {selectedTicket.sla}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Workflow Lifecycle Timeline */}
                <div className="space-y-3 pt-2 border-t">
                  <h4 className="text-sm font-semibold text-foreground">Workflow Timeline</h4>
                  <div className="relative pl-6 border-l-2 border-muted ml-2.5 space-y-4 py-1.5 text-sm">
                    {/* Event: Raised */}
                    <div className="relative">
                      <span className="absolute -left-8 top-1 h-3 w-3 rounded-full bg-blue-500 border border-background shadow-sm" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block text-foreground">Raised</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(selectedTicket.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Event: Claimed */}
                    <div className="relative">
                      <span className={`absolute -left-8 top-1 h-3 w-3 rounded-full border border-background shadow-sm ${
                        selectedTicket.claimedAt ? 'bg-amber-500' : 'bg-muted-foreground/30'
                      }`} />
                      <div className="space-y-0.5">
                        <span className={`font-semibold block ${selectedTicket.claimedAt ? 'text-foreground' : 'text-muted-foreground'}`}>
                          Claimed / Assigned
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedTicket.claimedAt ? (
                            formatTime(selectedTicket.claimedAt)
                          ) : (
                            <span className="italic text-muted-foreground/50">Not yet claimed</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Event: In Progress */}
                    <div className="relative">
                      <span className={`absolute -left-8 top-1 h-3 w-3 rounded-full border border-background shadow-sm ${
                        selectedTicket.inProgressAt ? 'bg-indigo-500' : 'bg-muted-foreground/30'
                      }`} />
                      <div className="space-y-0.5">
                        <span className={`font-semibold block ${selectedTicket.inProgressAt ? 'text-foreground' : 'text-muted-foreground'}`}>
                          Processed / In Progress
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedTicket.inProgressAt ? (
                            formatTime(selectedTicket.inProgressAt)
                          ) : (
                            <span className="italic text-muted-foreground/50">Not yet processed</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Event: Pending (Conditional) */}
                    {selectedTicket.pendingAt && (
                      <div className="relative">
                        <span className="absolute -left-8 top-1 h-3 w-3 rounded-full bg-orange-400 border border-background shadow-sm" />
                        <div className="space-y-0.5">
                          <span className="font-semibold block text-foreground">Set to Pending</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(selectedTicket.pendingAt)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Event: Resolved */}
                    <div className="relative">
                      <span className={`absolute -left-8 top-1 h-3 w-3 rounded-full border border-background shadow-sm ${
                        selectedTicket.resolvedAt ? 'bg-green-500' : 'bg-muted-foreground/30'
                      }`} />
                      <div className="space-y-0.5">
                        <span className={`font-semibold block ${selectedTicket.resolvedAt ? 'text-foreground' : 'text-muted-foreground'}`}>
                          Solved / Resolved
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedTicket.resolvedAt ? (
                            formatTime(selectedTicket.resolvedAt)
                          ) : (
                            <span className="italic text-muted-foreground/50">Not yet resolved</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Event: Closed */}
                    <div className="relative">
                      <span className={`absolute -left-8 top-1 h-3 w-3 rounded-full border border-background shadow-sm ${
                        selectedTicket.closedAt ? 'bg-rose-500' : 'bg-muted-foreground/30'
                      }`} />
                      <div className="space-y-0.5">
                        <span className={`font-semibold block ${selectedTicket.closedAt ? 'text-foreground' : 'text-muted-foreground'}`}>
                          Closed
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {selectedTicket.closedAt ? (
                            formatTime(selectedTicket.closedAt)
                          ) : (
                            <span className="italic text-muted-foreground/50">Not yet closed</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* External Context Section */}
                {(selectedTicket.tenantId || selectedTicket.source || (selectedTicket.logs && selectedTicket.logs.length > 0)) && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-primary flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      External App Context
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedTicket.tenantId && (
                        <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg space-y-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            Tenant ID
                          </span>
                          <span className="font-mono font-medium text-xs text-primary">{selectedTicket.tenantId}</span>
                        </div>
                      )}
                      {selectedTicket.source && (
                        <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg space-y-1 col-span-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Source Domain
                          </span>
                          <span className="font-mono font-medium text-xs text-primary break-all">{selectedTicket.source}</span>
                        </div>
                      )}
                    </div>

                    {selectedTicket.logs && selectedTicket.logs.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Terminal className="h-3.5 w-3.5" />
                          Application Logs (Last {selectedTicket.logs.length})
                        </span>
                        <div className="bg-zinc-950 dark:bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto space-y-1.5 border border-zinc-800 shadow-inner max-h-[220px] overflow-y-auto">
                          {selectedTicket.logs.map((log, index) => {
                            let colorClass = "text-zinc-300";
                            if (log.toLowerCase().includes("error")) colorClass = "text-red-400 font-semibold";
                            else if (log.toLowerCase().includes("warn")) colorClass = "text-amber-400 font-semibold";
                            else if (log.toLowerCase().includes("info")) colorClass = "text-blue-400";
                            
                            return (
                              <div key={index} className={`whitespace-pre-wrap ${colorClass}`}>
                                {log}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
};

export default TicketsList;
