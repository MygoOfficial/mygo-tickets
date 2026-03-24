import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const [profile, setProfile] = useState({ name: "John Doe", email: "john.doe@mygo.com", role: "Employee", department: "IT Operations" });
  const [notifSettings, setNotifSettings] = useState({ email: true, inApp: true, slaAlerts: true, approvals: true, ticketUpdates: false });

  const handleSave = () => toast({ title: "Settings saved", description: "Your preferences have been updated." });

  return (
    <AppLayout title="Settings">
      <div className="max-w-3xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={profile.role} disabled className="opacity-70" />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={profile.department} disabled className="opacity-70" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input type="password" placeholder="Current password" />
                    <Input type="password" placeholder="New password" />
                  </div>
                </div>
                <Button variant="accent" onClick={handleSave}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>Choose how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "email" as const, label: "Email Notifications", desc: "Receive notifications via email" },
                  { key: "inApp" as const, label: "In-App Notifications", desc: "Show notifications in the app" },
                  { key: "slaAlerts" as const, label: "SLA Breach Alerts", desc: "Get alerted when tickets approach or breach SLA" },
                  { key: "approvals" as const, label: "Approval Requests", desc: "Notify when approval is needed" },
                  { key: "ticketUpdates" as const, label: "All Ticket Updates", desc: "Get notified on every ticket status change" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifSettings[item.key]}
                      onCheckedChange={(v) => setNotifSettings({ ...notifSettings, [item.key]: v })}
                    />
                  </div>
                ))}
                <Separator />
                <Button variant="accent" onClick={handleSave}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Configuration</CardTitle>
                <CardDescription>Admin-level settings for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Ticket Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Auto-Assignment</Label>
                    <Select defaultValue="category">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">By Category</SelectItem>
                        <SelectItem value="roundrobin">Round Robin</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>SLA Business Hours</Label>
                    <Select defaultValue="9to5">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9to5">9 AM – 5 PM</SelectItem>
                        <SelectItem value="8to6">8 AM – 6 PM</SelectItem>
                        <SelectItem value="24x7">24/7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Escalation Timeout (hours)</Label>
                    <Input type="number" defaultValue="4" min={1} />
                  </div>
                </div>
                <Separator />
                <Button variant="accent" onClick={handleSave}>Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
