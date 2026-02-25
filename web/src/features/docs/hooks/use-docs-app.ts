import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DOCS_NAV, DOCS_ORDER, getDocsPage } from "../lib/docs-data";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useMounted } from "@/hooks/use-app-store";
import { UserDTO } from "@/types/dto";

export interface UseDocsAppReturn {
  router: ReturnType<typeof useRouter>;
  mounted: boolean;
  page: ReturnType<typeof getDocsPage>;
  query: string;
  setQuery: (value: string) => void;
  activeSectionId: string | undefined;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  user: UserDTO | undefined;
  signOut: ReturnType<typeof useLogout>["signOut"];
  signingOut: boolean;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  initials: string;
  filteredNav: typeof DOCS_NAV;
  navIndex: number;
  previousHref: string | undefined;
  nextHref: string | undefined;
}

/**
 * Custom hook for managing docs app state.
 * Handles navigation, search, active section tracking, menu state, and IntersectionObserver.
 */
export function useDocsApp(href: string): UseDocsAppReturn {
  const router = useRouter();
  const mounted = useMounted();
  const page = useMemo(() => getDocsPage(href) ?? getDocsPage("/docs/introduction"), [href]);
  const [query, setQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | undefined>(page?.sections[0]?.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const authUser = useAuthStore((s) => s.user);
  const user = mounted ? authUser : undefined;
  const { signOut, loading: signingOut } = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = useMemo(() => {
    const n = (user?.name || "").trim();
    if (n) {
      const parts = n.split(/\s+/).filter(Boolean);
      return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "U";
    }
    const e = (user?.email || "").trim();
    if (e) return e.slice(0, 2).toUpperCase();
    return "U";
  }, [user?.email, user?.name]);

  // Menu close on outside click or escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Update active section when page changes
  useEffect(() => {
    setActiveSectionId(page?.sections[0]?.id);
  }, [page]);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !page) return;

    const ids = page.sections.map((s) => s.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));
        const first = visible[0]?.target as HTMLElement | undefined;
        if (first?.id) setActiveSectionId(first.id);
      },
      { root, rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [page]);

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOCS_NAV;
    return DOCS_NAV.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const navIndex = useMemo(() => DOCS_ORDER.indexOf(href), [href]);
  const previousHref = navIndex > 0 ? DOCS_ORDER[navIndex - 1] : undefined;
  const nextHref = navIndex >= 0 && navIndex < DOCS_ORDER.length - 1 ? DOCS_ORDER[navIndex + 1] : undefined;

  return {
    router,
    mounted,
    page,
    query,
    setQuery,
    activeSectionId,
    scrollRef,
    user,
    signOut,
    signingOut,
    menuOpen,
    setMenuOpen,
    menuRef,
    initials,
    filteredNav,
    navIndex,
    previousHref,
    nextHref,
  };
}
