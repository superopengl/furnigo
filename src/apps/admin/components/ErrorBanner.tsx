"use client";

import { Alert } from "antd";
import { useGlobalError } from "@/lib/error";

export function ErrorBanner() {
  const { error, clearError } = useGlobalError();

  if (!error) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, padding: "8px 16px" }}>
      <Alert
        type="error"
        title={error}
        closable
        onClose={clearError}
        banner
        style={{ borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
      />
    </div>
  );
}
