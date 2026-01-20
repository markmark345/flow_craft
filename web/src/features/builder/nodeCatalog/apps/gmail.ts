
import type { SchemaField } from "@/components/ui/SchemaForm/types";

import type { AppCatalogApp } from "../catalog";
import { gmailMessagesCategory } from "./gmail/messages";
import { gmailLabelsCategory } from "./gmail/labels";
import { gmailDraftsCategory } from "./gmail/drafts";

const baseFields: SchemaField[] = [
  {
    key: "credentialId",
    label: "Credential",
    type: "credential",
    provider: "google",
    required: true,
    helpText: "Connect a Google account in Credentials to use Gmail.",
  },
];

export const gmailApp: AppCatalogApp = {
  appKey: "gmail",
  label: "Gmail",
  description: "Send and manage Gmail messages",
  icon: "gmail",
  baseFields,
  categories: [
    gmailMessagesCategory,
    gmailLabelsCategory,
    gmailDraftsCategory,
  ],
};
