import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--danger)", background: "var(--bg-elevated)", borderRadius: "var(--radius-lg)", margin: "40px" }}>
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "20px" }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.state.children;
  }
}
