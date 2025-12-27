"use client";

import { BuilderNodeType } from "../types";
import { cn } from "@/shared/lib/cn";

export function NodeIcon({
  nodeType,
  className,
}: {
  nodeType: BuilderNodeType | string;
  className?: string;
}) {
  const common = cn("h-4 w-4", className);
  switch (nodeType) {
    case "httpTrigger":
    case "webhook":
    case "httpRequest":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 8.5a4.5 4.5 0 0 1 4.5-4.5h3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 15.5a4.5 4.5 0 0 1-4.5 4.5h-3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M8 16l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "app":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M2 12h20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 2c2.8 2.8 4.5 6.4 4.5 10S14.8 19.2 12 22c-2.8-2.8-4.5-6.4-4.5-10S9.2 4.8 12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "database":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      );
    case "cron":
    case "delay":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 7v5l3 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 12a9 9 0 1 1-9-9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M21 3v6h-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "errorTrigger":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8.5 10.5a1.5 1.5 0 0 0-3 0v.5a1.5 1.5 0 0 0 3 0v-.5Z"
            fill="currentColor"
          />
          <path
            d="M18.5 10.5a1.5 1.5 0 0 0-3 0v.5a1.5 1.5 0 0 0 3 0v-.5Z"
            fill="currentColor"
          />
          <path
            d="M8 16c1.2 1.2 2.6 1.8 4 1.8s2.8-.6 4-1.8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 4h4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 4v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M7 6.8c-1.8 1.4-3 3.6-3 6 0 4.4 3.6 8 8 8s8-3.6 8-8c0-2.4-1.2-4.6-3-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "slack":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9.5 3.8a2.3 2.3 0 1 0 0 4.6H12V6.1A2.3 2.3 0 0 0 9.5 3.8Z"
            fill="currentColor"
          />
          <path
            d="M9.5 9.2H6.1a2.3 2.3 0 1 0 0 4.6h3.4a2.3 2.3 0 0 0 0-4.6Z"
            fill="currentColor"
          />
          <path
            d="M14.5 20.2a2.3 2.3 0 1 0 0-4.6H12v2.3a2.3 2.3 0 0 0 2.5 2.3Z"
            fill="currentColor"
          />
          <path
            d="M14.5 14.8h3.4a2.3 2.3 0 1 0 0-4.6h-3.4a2.3 2.3 0 0 0 0 4.6Z"
            fill="currentColor"
          />
          <path
            d="M8.4 12v3.4a2.3 2.3 0 1 0 4.6 0V12a2.3 2.3 0 0 0-4.6 0Z"
            fill="currentColor"
          />
          <path
            d="M15.6 12V8.6a2.3 2.3 0 1 0-4.6 0V12a2.3 2.3 0 0 0 4.6 0Z"
            fill="currentColor"
          />
        </svg>
      );
    case "gmail":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "gsheets":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M9 4v16M15 4v16M5 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "github":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      );
    case "transform":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 9l-3 3 3 3M15 9l3 3-3 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "merge":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6h5l4 6h7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 18h5l4-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "if":
    case "switch":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8 5h8M8 12h8M8 19h8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 5h.01M4 12h.01M4 19h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 7h10v10H7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}
