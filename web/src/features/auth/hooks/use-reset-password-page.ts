import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { resetPassword } from "../services/authApi";

export interface UseResetPasswordPageReturn {
  // State
  password: string;
  confirm: string;
  showPassword: boolean;
  loading: boolean;
  done: boolean;
  inlineError: string | null;
  token: string;

  // Computed
  inputErrorStyle: React.CSSProperties | undefined;

  // Actions
  setPassword: (value: string) => void;
  setConfirm: (value: string) => void;
  setShowPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSubmit: () => Promise<void>;
}

/**
 * Custom hook for managing Reset Password Page state and logic.
 * Handles password reset with token validation.
 */
export function useResetPasswordPage(): UseResetPasswordPageReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const inputErrorStyle = inlineError ? ({ borderColor: "var(--error)" } as const) : undefined;

  const onSubmit = async () => {
    setInlineError(null);
    if (!token) {
      setInlineError("Reset token is missing.");
      return;
    }
    if (!password) {
      setInlineError("Password is required.");
      return;
    }
    if (password !== confirm) {
      setInlineError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      showSuccess("Password updated", "You can now log in with your new password.");
      setTimeout(() => router.replace("/login"), 800);
    } catch (err: any) {
      showError("Reset failed", err?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (inlineError) setInlineError(null);
  };

  return {
    // State
    password,
    confirm,
    showPassword,
    loading,
    done,
    inlineError,
    token,

    // Computed
    inputErrorStyle,

    // Actions
    setPassword: (value: string) => {
      setPassword(value);
      clearError();
    },
    setConfirm: (value: string) => {
      setConfirm(value);
      clearError();
    },
    setShowPassword,
    onSubmit,
  };
}
