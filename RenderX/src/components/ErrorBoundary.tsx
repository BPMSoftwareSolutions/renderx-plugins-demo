import React from "react";

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  onError?: (error: any, info: any) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    try {
      console.error("Panel UI crashed:", error, info);
      this.props.onError?.(error, info);
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return this.props.children as React.ReactElement;
  }
}

