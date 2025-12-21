"use client";

import { useCallback, useState } from "react";
import { logout } from "../services/authApi";
import { useAuthStore } from "../store/use-auth-store";

export function useLogout() {
  const token = useAuthStore((s) => s.token);
  const signOut = useAuthStore((s) => s.signOut);
  const [loading, setLoading] = useState(false);

  const signOutNow = useCallback(async () => {
    setLoading(true);
    try {
      if (token) await logout();
    } catch {
      // ignore (token might already be invalid)
    } finally {
      signOut();
      setLoading(false);
    }
  }, [signOut, token]);

  return { signOut: signOutNow, loading };
}

