"use client";

import { Component, type ReactNode } from "react";
import { reportError } from "@/lib/error";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    reportError(error.message || "An unexpected error occurred");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: "#8C7E72" }}>
          <p>Something went wrong. Please refresh the page.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: 12,
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #E0D8CE",
              background: "transparent",
              cursor: "pointer",
              color: "#3D3228",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
