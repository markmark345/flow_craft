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
    case "openai":
    case "openaiChatModel":
      return (
        <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z"
          />
        </svg>
      );
    case "gemini":
    case "geminiChatModel":
      return (
        <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68q.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58a12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68q-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96q2.19.93 3.81 2.55t2.55 3.81"
          />
        </svg>
      );
    case "grok":
    case "grokChatModel":
      return (
        <svg className={common} viewBox="0 0 512 509.641" aria-hidden="true">
          <path
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M115.612 0h280.776C459.975 0 512 52.026 512 115.612v278.416c0 63.587-52.025 115.613-115.612 115.613H115.612C52.026 509.641 0 457.615 0 394.028V115.612C0 52.026 52.026 0 115.612 0z"
          />
          <path
            fill="var(--bg)"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M213.235 306.019l178.976-180.002v.169l51.695-51.763c-.924 1.32-1.86 2.605-2.785 3.89-39.281 54.164-58.46 80.649-43.07 146.922l-.09-.101c10.61 45.11-.744 95.137-37.398 131.836-46.216 46.306-120.167 56.611-181.063 14.928l42.462-19.675c38.863 15.278 81.392 8.57 111.947-22.03 30.566-30.6 37.432-75.159 22.065-112.252-2.92-7.025-11.67-8.795-17.792-4.263l-124.947 92.341zm-25.786 22.437l-.033.034L68.094 435.217c7.565-10.429 16.957-20.294 26.327-30.149 26.428-27.803 52.653-55.359 36.654-94.302-21.422-52.112-8.952-113.177 30.724-152.898 41.243-41.254 101.98-51.661 152.706-30.758 11.23 4.172 21.016 10.114 28.638 15.639l-42.359 19.584c-39.44-16.563-84.629-5.299-112.207 22.313-37.298 37.308-44.84 102.003-1.128 143.81z"
          />
        </svg>
      );
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
    case "bannerbear":
    case "bananabear":
      return (
        <svg className={common} viewBox="0 0 1200 1200" aria-hidden="true">
          <g transform="translate(0,1200) scale(0.1,-0.1)" fill="var(--text)" stroke="none">
            <path d="M5807 9975 c-207 -39 -440 -151 -632 -303 -94 -74 -269 -246 -364 -357 -359 -418 -679 -990 -976 -1745 -392 -994 -646 -2160 -621 -2845 13 -369 87 -701 232 -1034 340 -787 1038 -1383 1868 -1596 401 -103 847 -112 1262 -25 1039 217 1880 1036 2133 2080 68 281 94 615 72 910 -88 1141 -577 2675 -1169 3660 -243 404 -519 739 -787 952 -160 128 -372 237 -555 285 -122 32 -343 40 -463 18z m368 -400 c90 -24 250 -106 346 -175 105 -78 312 -284 412 -411 552 -700 1086 -1997 1336 -3244 146 -728 145 -1193 -5 -1658 -122 -377 -313 -686 -599 -972 -671 -671 -1659 -875 -2549 -528 -361 140 -727 410 -975 718 -309 384 -488 835 -532 1340 -56 648 239 1927 699 3025 149 358 339 724 521 1010 184 287 441 581 624 715 139 101 291 172 419 195 71 12 229 5 303 -15z" />
            <path d="M5750 7653 c-662 -63 -1107 -315 -1128 -636 -18 -288 307 -736 711 -981 140 -84 382 -176 465 -176 l22 0 0 -427 c-1 -334 -4 -436 -14 -466 -52 -144 -205 -236 -348 -209 -76 14 -116 34 -168 85 -54 53 -88 126 -96 208 -4 35 -13 76 -20 91 -53 104 -192 125 -270 42 -42 -44 -55 -103 -43 -197 18 -146 78 -270 179 -373 247 -252 620 -269 891 -42 38 32 69 54 69 49 0 -18 129 -112 203 -147 172 -82 362 -81 544 1 212 97 348 291 378 541 22 176 -147 285 -275 178 -42 -36 -51 -56 -61 -137 -19 -150 -102 -254 -233 -292 -142 -41 -297 31 -367 172 -24 48 -24 48 -27 486 l-3 437 24 0 c38 0 173 38 269 77 377 151 762 541 878 891 28 85 32 107 28 177 -3 64 -11 95 -36 148 -115 247 -509 436 -1022 492 -120 13 -449 18 -550 8z" />
            <path d="M3157 9116 c-89 -33 -157 -106 -187 -200 -20 -61 -8 -175 23 -227 60 -103 147 -153 267 -153 62 0 84 5 126 27 110 56 164 144 164 264 0 122 -51 213 -151 268 -64 35 -179 45 -242 21z" />
            <path d="M8625 9110 c-74 -29 -120 -72 -156 -145 -29 -60 -31 -70 -27 -147 5 -95 28 -148 86 -205 107 -105 301 -105 410 0 59 56 85 111 90 192 8 128 -46 234 -149 289 -71 39 -179 46 -254 16z" />
          </g>
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
        <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64L12 9.548l6.545-4.91l1.528-1.145C21.69 2.28 24 3.434 24 5.457"
          />
        </svg>
      );
    case "gsheets":
      return (
        <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.728 0v6h6zm1.363 10.636h-3.41v1.91h3.41zm0 3.273h-3.41v1.91h3.41zM20.727 6.5v15.864c0 .904-.732 1.636-1.636 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.318v6.5zm-3.273 2.773H6.545v7.909h10.91v-7.91zm-6.136 4.636H7.91v1.91h3.41v-1.91zm.001-1.364H7.91v-1.909h3.41v1.91z"
          />
        </svg>
      );
    case "googleSheets":
      return (
        <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.728 0v6h6zm1.363 10.636h-3.41v1.91h3.41zm0 3.273h-3.41v1.91h3.41zM20.727 6.5v15.864c0 .904-.732 1.636-1.636 1.636H4.909a1.636 1.636 0 0 1-1.636-1.636V1.636C3.273.732 4.005 0 4.909 0h9.318v6.5zm-3.273 2.773H6.545v7.909h10.91v-7.91zm-6.136 4.636H7.91v1.91h3.41v-1.91zm.001-1.364H7.91v-1.909h3.41v1.91z"
          />
        </svg>
      );
    case "github":
      return (
        <svg className={common} viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
          />
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
    case "aiAgent":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 4.5V3.2c0-.7.6-1.2 1.2-1.2h3.6c.7 0 1.2.6 1.2 1.2v1.3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M7 9.5a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v5.2a4.3 4.3 0 0 1-4.3 4.3H11.3A4.3 4.3 0 0 1 7 14.7V9.5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M9.5 12h.01M14.5 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M10 16.2c.7.6 1.4.9 2 .9s1.3-.3 2-.9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "chatModel":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
