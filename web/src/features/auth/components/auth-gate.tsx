"use client";

import { useAuthGate } from "../hooks/use-auth-gate";

export function AuthGate() {
  useAuthGate();
  return null;
}
