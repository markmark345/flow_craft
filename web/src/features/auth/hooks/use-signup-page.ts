import { useMemo, useState } from "react";
import type { Route } from "next";
import { getErrorMessage } from "@/lib/error-utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignup } from "./use-signup";

function inferUsername(email: string) {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "";
  return trimmed.slice(0, at);
}

export interface UseSignupPageReturn {
  // State
  name: string;
  email: string;
  username: string;
  password: string;
  showPassword: boolean;
  inlineError: string | null;
  loading: boolean;
  next: string;

  // Computed
  usernameSuggestion: string;
  inputErrorStyle: React.CSSProperties | undefined;

  // Actions
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSubmit: () => Promise<void>;
}

/**
 * Custom hook for managing Signup Page state and logic.
 * Handles user registration with username inference.
 */
export function useSignupPage(): UseSignupPageReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const { signUp, loading } = useSignup();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const usernameSuggestion = useMemo(() => inferUsername(email), [email]);
  const inputErrorStyle = inlineError ? ({ borderColor: "var(--error)" } as const) : undefined;

  const toInlineMessage = (err: any) => {
    const raw = String(getErrorMessage(err) || "").trim();
    if (!raw) return "Sign up failed.";
    if (raw.toLowerCase().includes("already")) return "This email/username is already in use.";
    return raw;
  };

  const onSubmit = async () => {
    setInlineError(null);
    const e = email.trim();
    const u = (username.trim() || usernameSuggestion).trim();
    if (!e || !password) {
      setInlineError("Email and password are required.");
      return;
    }
    if (!u) {
      setInlineError("Username is required.");
      return;
    }

    try {
      await signUp({ name: name.trim(), email: e, username: u, password });
      router.replace(next as Route);
    } catch (err: unknown) {
      setInlineError(toInlineMessage(err));
    }
  };

  const clearError = () => {
    if (inlineError) setInlineError(null);
  };

  return {
    // State
    name,
    email,
    username,
    password,
    showPassword,
    inlineError,
    loading,
    next,

    // Computed
    usernameSuggestion,
    inputErrorStyle,

    // Actions
    setName,
    setEmail: (value: string) => {
      setEmail(value);
      clearError();
    },
    setUsername: (value: string) => {
      setUsername(value);
      clearError();
    },
    setPassword: (value: string) => {
      setPassword(value);
      clearError();
    },
    setShowPassword,
    onSubmit,
  };
}
