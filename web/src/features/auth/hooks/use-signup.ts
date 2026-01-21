"use client";

import { useCallback, useState } from "react";
import { signup } from "../services/authApi";
import { useAuthStore } from "../store/use-auth-store";
import { useAppStore } from "@/hooks/use-app-store";

export function useSignup() {
  const setSession = useAuthStore((s) => s.setSession);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const [loading, setLoading] = useState(false);

  const signUp = useCallback(
    async (input: { name: string; email: string; username: string; password: string }) => {
      setLoading(true);
      try {
        const session = await signup(input);
        setSession(session);
        showSuccess("Account created", `Signed in as ${session.user.email}`);
        return session;
      } catch (err: unknown) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setSession, showSuccess]
  );

  return { signUp, loading };
}
