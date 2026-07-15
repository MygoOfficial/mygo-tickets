import React, { createContext, useState, useEffect, useContext } from "react";
import { toast } from "sonner";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "Requestor" | "Agent";
  department?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: "Requestor" | "Agent", department?: string) => Promise<boolean>;
  updateProfile: (name: string, email: string, department?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const activeToken = localStorage.getItem("token");
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${activeToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(activeToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching current user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Invalid credentials");
        return false;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success("Successfully logged in", {
        description: `Welcome back, ${data.user.name}!`,
      });
      return true;
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error during login");
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string,
    role: "Requestor" | "Agent",
    department?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name, role, department }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Signup failed");
        return false;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success("Account created successfully", {
        description: `Welcome, ${data.user.name}!`,
      });
      return true;
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Network error during sign up");
      return false;
    }
  };

  const updateProfile = async (
    name: string,
    email: string,
    department?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, department }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update profile");
        return false;
      }

      setUser(data.user);
      toast.success("Profile updated successfully!");
      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error("Network error during profile update");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
