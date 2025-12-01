"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { getUserProfile, logoutUser } from "./auth";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: () => {},
  setUser: () => {},
});

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        const res = await getUserProfile();

        if (res && res.data) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("❌ AuthProvider error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      logout: logoutUser,
      setUser,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log("ISI AUTH CONTEXT:", context);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
