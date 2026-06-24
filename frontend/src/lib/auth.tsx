"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthState {
  accessToken: string | null;
  email: string | null;
  userId: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, email: string, userId: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    accessToken: null,
    email: null,
    userId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lewif_auth");
    if (stored) {
      setAuth(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  function login(accessToken: string, email: string, userId: string) {
    const state = { accessToken, email, userId };
    setAuth(state);
    localStorage.setItem("lewif_auth", JSON.stringify(state));
  }

  function logout() {
    setAuth({ accessToken: null, email: null, userId: null });
    localStorage.removeItem("lewif_auth");
  }

  return (
    <AuthContext.Provider
      value={{ ...auth, login, logout, isLoggedIn: !!auth.accessToken, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
