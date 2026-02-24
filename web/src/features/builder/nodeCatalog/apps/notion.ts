
import type { SchemaField } from "@/components/ui/SchemaForm/types";
import type { AppCatalogApp, AppCatalogCategory } from "../catalog";

const baseFields: SchemaField[] = [
  {
    key: "credentialId",
    label: "Credential",
    type: "credential",
    provider: "notion",
    required: true,
    helpText: "Connect a Notion integration (Internal Integration Token).",
  },
];

const pagesCategory: AppCatalogCategory = {
  key: "pages",
  label: "Pages",
  items: [
    {
      actionKey: "notion.createPage",
      label: "Create Page",
      description: "Create a new page in a database",
      kind: "action",
      supportsTest: false,
      fields: [
        {
          key: "databaseId",
          label: "Database ID",
          type: "text",
          required: true,
          placeholder: "32 hex characters",
          helpText: "The ID of the parent database",
        },
        {
          key: "title",
          label: "Title",
          type: "text",
          required: true,
          placeholder: "Page Title",
        },
        {
          key: "content",
          label: "Content",
          type: "textarea",
          required: false,
          placeholder: "Initial page content (paragraph)",
        },
      ],
    },
  ],
};

export const notionApp: AppCatalogApp = {
  appKey: "notion",
  label: "Notion",
  description: "Manage pages and databases",
  icon: "notion",
  baseFields,
  categories: [pagesCategory],
};
