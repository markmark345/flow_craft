
import type { AppCatalogCategory } from "../../catalog";

export const gmailDraftsCategory: AppCatalogCategory = {
  key: "drafts",
  label: "Draft actions",
  items: [
    {
      actionKey: "gmail.createDraft",
      label: "Create draft",
      description: "Create a new email draft",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "to", label: "To", type: "text", required: true },
        { key: "subject", label: "Subject", type: "text", required: true },
        { key: "bodyText", label: "Body (text)", type: "textarea" },
        { key: "bodyHtml", label: "Body (HTML)", type: "textarea" },
      ],
    },
    {
      actionKey: "gmail.getDraft",
      label: "Get draft",
      description: "Fetch a draft by ID",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "draftId", label: "Draft ID", type: "text", required: true }],
    },
    {
      actionKey: "gmail.deleteDraft",
      label: "Delete draft",
      description: "Delete a draft by ID",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "draftId", label: "Draft ID", type: "text", required: true }],
    },
  ],
};
