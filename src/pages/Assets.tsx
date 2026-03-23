import { AppLayout } from "@/components/AppLayout";
import { MOCK_ASSETS, type AssetData } from "@/data/assets";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Laptop, Monitor, CreditCard, Smartphone, KeyRound, Headphones } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Package, CheckCircle2, Wrench, Archive } from "lucide-react";

const assetIcons: Record<AssetData["type"], React.ElementType> = {
  Laptop, Monitor, "ID Card": CreditCard, "Mobile Phone": Smartphone, "Access Card": KeyRound, Headset: Headphones,
};

function AssetStatusBadge({ status }: { status: AssetData["status"] }) {
  const variants: Record<AssetData["status"], "success" | "info" | "warning" | "muted" | "secondary"> = {
    Available: "success", Issued: "info", Returned: "muted", "Under Repair": "warning", Retired: "secondary",
  };
  return <Badge variant={variants[status]}>{status}</Badge>;
}

const Assets = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = MOCK_ASSETS.filter((a) => {
    const matchSearch = !search || a.id.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()) || (a.assignedTo?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const issued = MOCK_ASSETS.filter((a) => a.status === "Issued").length;
  const available = MOCK_ASSETS.filter((a) => a.status === "Available").length;
  const repair = MOCK_ASSETS.filter((a) => a.status === "Under Repair").length;

  return (
    <AppLayout title="Assets">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Assets" value={MOCK_ASSETS.length} icon={Package} />
          <StatCard title="Issued" value={issued} icon={CheckCircle2} />
          <StatCard title="Available" value={available} icon={Archive} />
          <StatCard title="Under Repair" value={repair} icon={Wrench} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Issued">Issued</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
              <SelectItem value="Under Repair">Under Repair</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Laptop">Laptop</SelectItem>
              <SelectItem value="Monitor">Monitor</SelectItem>
              <SelectItem value="ID Card">ID Card</SelectItem>
              <SelectItem value="Mobile Phone">Mobile Phone</SelectItem>
              <SelectItem value="Access Card">Access Card</SelectItem>
              <SelectItem value="Headset">Headset</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Serial #</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned To</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Linked Ticket</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset) => {
                  const Icon = assetIcons[asset.type];
                  return (
                    <tr key={asset.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-sm font-mono text-primary font-medium">{asset.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{asset.type}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{asset.brand && asset.model ? `${asset.brand} ${asset.model}` : "—"}</td>
                      <td className="p-3 text-xs font-mono text-muted-foreground">{asset.serialNumber}</td>
                      <td className="p-3 text-sm">{asset.assignedTo || <span className="text-muted-foreground italic">Unassigned</span>}</td>
                      <td className="p-3"><AssetStatusBadge status={asset.status} /></td>
                      <td className="p-3 text-sm font-mono text-primary">{asset.linkedTicket || "—"}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No assets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Showing {filtered.length} of {MOCK_ASSETS.length} assets</p>
      </div>
    </AppLayout>
  );
};

export default Assets;
