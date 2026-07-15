import React, { createContext, useContext, useState } from "react";

export const TIMEZONE_MAP: Record<string, string> = {
  "UTC": "UTC",
  "GMT": "GMT",
  "EST": "America/New_York",
  "CST": "America/Chicago",
  "MST": "America/Denver",
  "PST": "America/Los_Angeles",
  "IST": "Asia/Kolkata",
  "BST": "Europe/London",
  "CET": "Europe/Paris",
  "JST": "Asia/Tokyo",
  "AEST": "Australia/Sydney"
};

interface TimezoneContextType {
  timezone: string;
  setTimezone: (tz: string) => void;
  formatTime: (dateString: string | undefined | null) => string;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const TimezoneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timezone, setTimezoneState] = useState<string>(() => {
    return localStorage.getItem("timezone_preference") || "IST";
  });

  const setTimezone = (tz: string) => {
    if (TIMEZONE_MAP[tz]) {
      setTimezoneState(tz);
      localStorage.setItem("timezone_preference", tz);
    }
  };

  const formatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const ianaZone = TIMEZONE_MAP[timezone] || "Asia/Kolkata";
      return date.toLocaleString("en-US", {
        timeZone: ianaZone,
        dateStyle: "medium",
        timeStyle: "short",
      }) + ` (${timezone})`;
    } catch (e) {
      return dateString || "";
    }
  };

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone, formatTime }}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }
  return context;
};
