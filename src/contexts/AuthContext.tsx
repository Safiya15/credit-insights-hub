import React, { createContext, useContext, useState, useCallback } from "react";

export interface User {
  email: string;
  name: string;
  role: "Admin" | "Credit Manager" | "Analyst";
}

const USERS: Record<string, { password: string; user: User }> = {
  "raj@bank.com": { password: "Admin@123", user: { email: "raj@bank.com", name: "Raj Kumar", role: "Admin" } },
  "priya@bank.com": { password: "Credit@123", user: { email: "priya@bank.com", name: "Priya Sharma", role: "Credit Manager" } },
  "amit@bank.com": { password: "Analyst@123", user: { email: "amit@bank.com", name: "Amit Patel", role: "Analyst" } },
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => false, logout: () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("credit_risk_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email: string, password: string) => {
    const entry = USERS[email.toLowerCase()];
    if (entry && entry.password === password) {
      setUser(entry.user);
      localStorage.setItem("credit_risk_user", JSON.stringify(entry.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("credit_risk_user");
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
