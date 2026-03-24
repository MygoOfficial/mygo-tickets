import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Check } from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "warning" | "success" | "sla";
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", title: "Ticket TK-1024 Assigned", description: "You have been assigned ticket TK-1024: Laptop not connecting to VPN.", time: "5 min ago", type: "info", read: false },
  { id: "2", title: "SLA Breach Warning", description: "Ticket TK-1018 is approaching its resolution SLA deadline in 2 hours.", time: "20 min ago", type: "sla", read: false },
  { id: "3", title: "Approval Required", description: "Employee onboarding request for Sarah Miller requires your approval.", time: "1 hour ago", type: "warning", read: false },
  { id: "4", title: "Ticket TK-1015 Resolved", description: "Your ticket regarding SAP access has been resolved.", time: "2 hours ago", type: "success", read: true },
  { id: "5", title: "New Comment on TK-1020", description: "James added a comment: 'Software has been installed successfully.'", time: "3 hours ago", type: "info", read: true },
  { id: "6", title: "Asset Returned", description: "Laptop LPT-042 has been marked as returned by employee John Doe.", time: "5 hours ago", type: "success", read: true },
  { id: "7", title: "SLA Breached", description: "Ticket TK-1010 has breached its response SLA.", time: "1 day ago", type: "sla", read: true },
  { id: "8", title: "Workflow Step Completed", description: "HR Task step completed for onboarding workflow WF-204.", time: "1 day ago", type: "info", read: true },
];

const typeConfig = {
  info: { icon: Info, color: "text-primary" },
  warning: { icon: AlertTriangle, color: "text-accent" },
  success: { icon: CheckCircle, color: "text-green-600" },
  sla: { icon: Clock, color: "text-destructive" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppLayout title="Notifications">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{unreadCount} unread</span>
          </div>
          <Button variant="ghost" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        </div>

        <div className="space-y-2">
          {notifications.map((n) => {
            const cfg = typeConfig[n.type];
            const Icon = cfg.icon;
            return (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}
                onClick={() => markRead(n.id)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={`mt-0.5 shrink-0 ${cfg.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                      {!n.read && <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">New</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
