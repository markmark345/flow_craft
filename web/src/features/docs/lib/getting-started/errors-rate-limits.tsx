"use client";

import type { DocsPage } from "../docs-data-types";
import { prose, section } from "../docs-data-helpers";

export const errorsRateLimitsPage: DocsPage = {
  title: "Errors & Rate Limits",
  breadcrumb: [
    { label: "Docs", href: "/docs" },
    { label: "Errors & Rate Limits" },
  ],
  description: "Error responses and recommended retry strategy.",
  sections: [
    section(
      "errors",
      "Errors",
      prose(
        <>
          <p>
            API responses follow a common envelope. When an error occurs, the response contains an{" "}
            <code>error</code> object with <code>code</code> and <code>message</code>.
          </p>
        </>
      )
    ),
    section(
      "rate-limits",
      "Rate limits",
      prose(
        <>
          <p>
            Rate limiting is not enforced in the local dev API. For production, plan for standard
            retry/backoff for 429 and 5xx responses.
          </p>
        </>
      )
    ),
  ],
};
