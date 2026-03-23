import { AppLayout } from "@/components/AppLayout";
import { MOCK_TEAMS } from "@/data/teams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Ticket, CheckCircle2 } from "lucide-react";

const Teams = () => {
  return (
    <AppLayout title="Teams">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{MOCK_TEAMS.length} teams across the organization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MOCK_TEAMS.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">{team.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{team.description}</p>
                  </div>
                  <Badge variant="muted" className="text-[10px]">{team.id}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Ticket className="h-3.5 w-3.5 text-accent" />
                    <span className="font-semibold">{team.activeTickets}</span>
                    <span className="text-muted-foreground text-xs">active</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    <span className="font-semibold">{team.resolvedThisMonth}</span>
                    <span className="text-muted-foreground text-xs">resolved</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wider">Members</p>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div key={member.name} className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold text-primary">{member.avatar}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <p className="text-[10px] text-muted-foreground">{member.role}</p>
                        </div>
                        {member.name === team.lead && (
                          <Badge variant="info" className="text-[10px] ml-auto shrink-0">Lead</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Teams;
