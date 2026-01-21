
import type { SchemaField } from "@/components/ui/SchemaForm/types";

import type { AppCatalogApp } from "../catalog";
import { googleSheetsDocumentsCategory } from "./googleSheets/documents";
import { googleSheetsSheetsCategory } from "./googleSheets/sheets";
import { googleSheetsRowsCategory } from "./googleSheets/rows";
import { googleSheetsTriggersCategory } from "./googleSheets/triggers";

const baseFields: SchemaField[] = [
  {
    key: "credentialId",
    label: "Credential",
    type: "credential",
    provider: "google",
    required: true,
    helpText: "Connect a Google account in Credentials to use Sheets.",
  },
];

export const googleSheetsApp: AppCatalogApp = {
  appKey: "googleSheets",
  label: "Google Sheets",
  description: "Create, read, update, and delete Sheets data",
  icon: "googleSheets",
  baseFields,
  categories: [
    googleSheetsDocumentsCategory,
    googleSheetsSheetsCategory,
    googleSheetsRowsCategory,
    googleSheetsTriggersCategory,
  ],
};
