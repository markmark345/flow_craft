import type { AppCatalogCategory } from "../../catalog";

export const templatesCategory: AppCatalogCategory = {
  key: "templates",
  label: "Template actions",
  items: [
    {
      actionKey: "bannerbear.getTemplate",
      label: "Get a template",
      description: "Fetch template metadata",
      supportsTest: true,
      fields: [{ key: "templateUid", label: "Template UID", type: "text", placeholder: "tpl_...", required: true }],
    },
    {
      actionKey: "bannerbear.listTemplates",
      label: "List templates",
      description: "List templates in your Bannerbear project",
      supportsTest: true,
      fields: [
        { key: "page", label: "Page (optional)", type: "number", placeholder: "1" },
        { key: "perPage", label: "Per page (optional)", type: "number", placeholder: "10" },
      ],
    },
  ],
};
