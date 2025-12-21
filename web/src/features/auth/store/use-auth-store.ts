import { create } from "zustand";
import { AuthSession, AuthUser, readAuthSession, writeAuthSession } from "@/shared/lib/auth";

type State = {
  token?: string;
  user?: AuthUser;
  setSession: (session: AuthSession) => void;
  signOut: () => void;
};

const persisted = readAuthSession();

export const useAuthStore = create<State>((set) => ({
  token: persisted.token,
  user: persisted.user,
  setSession: (session) => {
    writeAuthSession(session);
    set({ token: session.token, user: session.user });
  },
  signOut: () => {
    writeAuthSession(null);
    set({ token: undefined, user: undefined });
  },
}));

