import { AppLayout } from "@/components/AppLayout";
import { CATEGORIES } from "@/data/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const CreateTicket = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [priority, setPriority] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const subcategories = category ? CATEGORIES[category] || [] : [];

  const createTicketMutation = useMutation({
    mutationFn: async (newTicket: {
      title: string;
      description: string;
      category: string;
      subcategory: string;
      priority: string;
    }) => {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit ticket");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success(`Ticket ${data.id} created successfully!`, {
        description: "Your support request has been submitted and will be reviewed shortly.",
      });
      navigate("/tickets");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subcategory || !priority || !title) {
      toast.error("Please fill in all required fields");
      return;
    }

    createTicketMutation.mutate({
      title,
      description,
      category,
      subcategory,
      priority,
    });
  };

  const isSubmitting = createTicketMutation.isPending;

  return (
    <AppLayout title="Create Ticket">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>New Support Request</CardTitle>
            <p className="text-sm text-muted-foreground">Fill out the form below to create a new ticket. Required fields are marked with *</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  placeholder="Brief description of your request" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  disabled={isSubmitting}
                  required
                  className="bg-card"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select 
                    value={category} 
                    onValueChange={(v) => { setCategory(v); setSubcategory(""); }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="bg-card"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(CATEGORIES).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategory *</Label>
                  <Select 
                    value={subcategory} 
                    onValueChange={setSubcategory} 
                    disabled={!category || isSubmitting}
                  >
                    <SelectTrigger className="bg-card"><SelectValue placeholder={category ? "Select subcategory" : "Select category first"} /></SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select 
                  value={priority} 
                  onValueChange={setPriority}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="bg-card"><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide details about your request..." 
                  rows={5} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  disabled={isSubmitting}
                  className="bg-card resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment">Attachments</Label>
                <Input id="attachment" type="file" className="cursor-pointer bg-card file:text-primary file:font-semibold" disabled={isSubmitting} />
                <p className="text-xs text-muted-foreground">Max file size: 10MB. Supported: PDF, PNG, JPG, DOCX</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="accent" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CreateTicket;
