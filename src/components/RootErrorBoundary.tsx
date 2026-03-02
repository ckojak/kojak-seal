import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

interface RootErrorBoundaryProps {
  children: React.ReactNode;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

const INVALID_API_KEY_PATTERN = /invalid api key|apikey|api key/i;

export class RootErrorBoundary extends React.Component<RootErrorBoundaryProps, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  private apiKeyToastShown = false;

  private handleGlobalError = (event: ErrorEvent) => {
    const message = event.message || event.error?.message || "Unknown runtime error";
    if (INVALID_API_KEY_PATTERN.test(message) && !this.apiKeyToastShown) {
      console.error("[Runtime Error] Invalid backend API key", event.error || event.message);
      toast.error("Invalid backend API key. Please verify your backend key setup.");
      this.apiKeyToastShown = true;
    }
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reasonMessage =
      typeof event.reason === "string"
        ? event.reason
        : event.reason?.message || "Unhandled promise rejection";

    if (INVALID_API_KEY_PATTERN.test(reasonMessage) && !this.apiKeyToastShown) {
      console.error("[Runtime Error] Invalid backend API key", event.reason);
      toast.error("Invalid backend API key. Please verify your backend key setup.");
      this.apiKeyToastShown = true;
    }
  };

  static getDerivedStateFromError(error: Error): RootErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || "Unexpected application crash",
    };
  }

  componentDidMount() {
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[RootErrorBoundary] Application crashed", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <Toaster position="top-center" richColors />
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground break-words">
              {this.state.errorMessage}
            </p>
            <Button onClick={this.handleReload} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Reload app
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
