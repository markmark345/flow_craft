import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/hooks/use-app-store";
import { requestPasswordReset } from "../services/authApi";

export interface UseForgotPasswordPageReturn {
  // State
  email: string;
  loading: boolean;
  done: boolean;
  inlineError: string | null;
  next: string;

  // Computed
  inputErrorStyle: React.CSSProperties | undefined;

  // Actions
  setEmail: (value: string) => void;
  onSubmit: () => Promise<void>;
}

/**
 * Custom hook for managing Forgot Password Page state and logic.
 * Handles password reset request flow.
 */
export function useForgotPasswordPage(): UseForgotPasswordPageReturn {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/login";
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const inputErrorStyle = inlineError ? ({ borderColor: "var(--error)" } as const) : undefined;

  const onSubmit = async () => {
    setInlineError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setInlineError("Email is required.");
      return;
    }
    setLoading(true);
    try {
      const lang = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("th") ? "th" : "en";
      await requestPasswordReset(trimmed, lang);
      setDone(true);
      showSuccess("Check your inbox", "If the account exists, we sent a reset link.");
    } catch (err: any) {
      showError("Request failed", err?.message || "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (inlineError) setInlineError(null);
  };

  return {
    // State
    email,
    loading,
    done,
    inlineError,
    next,

    // Computed
    inputErrorStyle,

    // Actions
    setEmail: (value: string) => {
      setEmail(value);
      clearError();
    },
    onSubmit,
  };
}
