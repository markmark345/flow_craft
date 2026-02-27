import { useEffect, useRef } from "react";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/use-auth-store";
import { me } from "../services/authApi";

/**
 * Custom hook for managing authentication gate logic.
 * Validates user session and redirects to login if needed.
 */
export function useAuthGate() {
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const signOut = useAuthStore((s) => s.signOut);
  const router = useRouter();
  const pathname = usePathname();
  const validatedRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const next = pathname && pathname !== "/login" ? `?next=${encodeURIComponent(pathname)}` : "";
    if (!token) {
      router.replace(`/login${next}` as Route);
      return;
    }

    if (validatedRef.current === token) return;
    validatedRef.current = token;

    let cancelled = false;
    void (async () => {
      try {
        const user = await me();
        if (cancelled) return;
        setSession({ token, user });
      } catch {
        if (cancelled) return;
        validatedRef.current = undefined;
        signOut();
        router.replace(`/login${next}` as Route);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, setSession, signOut, token]);
}
