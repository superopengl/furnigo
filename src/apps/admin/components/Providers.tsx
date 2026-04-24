"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { ConfigProvider, App as AntApp } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext, type AuthUser } from "@/lib/auth";
import { ErrorContext, setGlobalShowError } from "@/lib/error";
import { api, getToken, setToken, clearToken } from "@/lib/api";
import { disconnectSocket } from "@/lib/socket";
import { theme } from "@/lib/theme";
import { ErrorBanner } from "./ErrorBanner";
import { ErrorBoundary } from "./ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    setError(message);
    setTimeout(() => setError(null), 8000);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    setGlobalShowError(showError);
  }, [showError]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    // Validate token by fetching current user
    api<any>("/users/me").then((res) => {
      if (res.success && res.data.role !== "client") {
        setUser({
          id: res.data.id,
          email: res.data.email,
          displayName: res.data.displayName,
          role: res.data.role,
        });
      } else {
        clearToken();
      }
      setIsLoading(false);
    }).catch(() => {
      clearToken();
      setIsLoading(false);
    });
  }, []);

  const login = useCallback((u: AuthUser, token: string) => {
    setToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    disconnectSocket();
    setUser(null);
    queryClient.clear();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <AntApp>
          <ErrorContext.Provider value={{ error, showError, clearError }}>
            <ErrorBanner />
            <AuthContext.Provider value={{ user, login, logout, isLoading }}>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </AuthContext.Provider>
          </ErrorContext.Provider>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
