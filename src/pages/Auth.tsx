import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Auth: React.FC = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Loading states
  const [submitting, setSubmitting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<string>("login");

  // Show/hide passwords
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState<"Requestor" | "Agent">("Requestor");
  const [signupDepartment, setSignupDepartment] = useState<string>("IT Support");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setSubmitting(true);
    const success = await login(loginEmail, loginPassword);
    setSubmitting(false);

    if (success) {
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) return;

    setSubmitting(true);
    const success = await signup(
      signupEmail,
      signupPassword,
      signupName,
      signupRole,
      signupRole === "Agent" ? signupDepartment : undefined
    );
    setSubmitting(false);

    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/40 to-background p-4 relative overflow-hidden">
      {/* Decorative gradient blur rings */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-xl">M</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Mygo Support</h1>
          <p className="text-sm text-muted-foreground text-center">
            The enterprise ticketing and resolution platform.
          </p>
        </div>

        <Card className="border-border/60 shadow-xl bg-card/90 backdrop-blur-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-2">
              <TabsList className="grid grid-cols-2 w-full p-1 bg-muted/60">
                <TabsTrigger value="login" className="text-sm font-semibold py-2">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-sm font-semibold py-2">
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-10 bg-background/50 focus:bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="h-10 pr-10 bg-background/50 focus:bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Logging in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                      className="h-10 bg-background/50 focus:bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="h-10 bg-background/50 focus:bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="h-10 pr-10 bg-background/50 focus:bg-background"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-2 pt-1">
                    <Label>Select Role</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Requestor Option */}
                      <button
                        type="button"
                        onClick={() => setSignupRole("Requestor")}
                        className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all ${
                          signupRole === "Requestor"
                            ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                            : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <User className={`h-6 w-6 ${signupRole === "Requestor" ? "text-primary" : ""}`} />
                        <div>
                          <p className="text-sm font-bold">Requestor</p>
                          <p className="text-[10px] mt-0.5 opacity-80">Raise tickets & request help</p>
                        </div>
                      </button>

                      {/* Agent Option */}
                      <button
                        type="button"
                        onClick={() => setSignupRole("Agent")}
                        className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border text-center transition-all ${
                          signupRole === "Agent"
                            ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                            : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ShieldCheck className={`h-6 w-6 ${signupRole === "Agent" ? "text-primary" : ""}`} />
                        <div>
                          <p className="text-sm font-bold">Agent</p>
                          <p className="text-[10px] mt-0.5 opacity-80">Fix tickets & solve issues</p>
                        </div>
                      </button>
                    </div>
                  </div>
                  {signupRole === "Agent" && (
                    <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                      <Label>Department</Label>
                      <Select value={signupDepartment} onValueChange={setSignupDepartment}>
                        <SelectTrigger className="h-10 bg-background/50 focus:bg-background">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IT Support">IT Support</SelectItem>
                          <SelectItem value="IT Security">IT Security</SelectItem>
                          <SelectItem value="HR Operations">HR Operations</SelectItem>
                          <SelectItem value="Payroll">Payroll</SelectItem>
                          <SelectItem value="Immigration">Immigration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2">
                  <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
