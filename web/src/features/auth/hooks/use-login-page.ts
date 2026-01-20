import { useState } from "react";
import type { Route } from "next";
import { getErrorMessage } from "@/lib/error-utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/hooks/use-app-store";
import { API_BASE_URL } from "@/lib/env";
import { useLogin } from "./use-login";

export interface UseLoginPageReturn {
  // State
  identifier: string;
  password: string;
  showPassword: boolean;
  inlineError: string | null;
  loading: boolean;
  next: string;

  // Computed
  inputErrorStyle: React.CSSProperties | undefined;

  // Actions
  setIdentifier: (value: string) => void;
  setPassword: (value: string) => void;
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSubmit: () => Promise<void>;
  startOAuth: (provider: "google" | "github") => void;
  showInfo: ReturnType<typeof useAppStore.getState>["showInfo"];
}

/**
 * Custom hook for managing Login Page state and logic.
 * Handles credential login and OAuth flows.
 */
export function useLoginPage(): UseLoginPageReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const { signIn, loading } = useLogin();
  const showInfo = useAppStore((s) => s.showInfo);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const inputErrorStyle = inlineError ? ({ borderColor: "var(--error)" } as const) : undefined;

  const toInlineMessage = (err: unknown) => {
    const raw = String(getErrorMessage(err) || "").trim();
    if (!raw) return "Login failed.";
    if (raw.toLowerCase().includes("invalid")) return "Email/username or password is incorrect.";
    return raw;
  };

  const onSubmit = async () => {
    setInlineError(null);
    const id = identifier.trim();
    if (!id || !password) {
      setInlineError("Email/username and password are required.");
      return;
    }
    try {
      await signIn(id, password);
      router.replace(next as Route);
    } catch (err: unknown) {
      setInlineError(toInlineMessage(err));
    }
  };

  const startOAuth = (provider: "google" | "github") => {
    const target = `${API_BASE_URL}/auth/oauth/${provider}/start?next=${encodeURIComponent(next)}`;
    window.location.href = target;
  };

  const clearError = () => {
    if (inlineError) setInlineError(null);
  };

  return {
    // State
    identifier,
    password,
    showPassword,
    inlineError,
    loading,
    next,

    // Computed
    inputErrorStyle,

    // Actions
    setIdentifier: (value: string) => {
      setIdentifier(value);
      clearError();
    },
    setPassword: (value: string) => {
      setPassword(value);
      clearError();
    },
    setShowPassword,
    onSubmit,
    startOAuth,
    showInfo,
  };
}
