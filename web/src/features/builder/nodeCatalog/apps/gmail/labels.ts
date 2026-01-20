
import type { AppCatalogCategory } from "../../catalog";

export const gmailLabelsCategory: AppCatalogCategory = {
  key: "labels",
  label: "Label actions",
  items: [
    {
      actionKey: "gmail.createLabel",
      label: "Create label",
      description: "Create a new label",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "name", label: "Name", type: "text", required: true }],
    },
    {
      actionKey: "gmail.deleteLabel",
      label: "Delete label",
      description: "Delete a label by ID",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "labelId", label: "Label ID", type: "text", required: true }],
    },
    {
      actionKey: "gmail.getLabel",
      label: "Get label",
      description: "Fetch a label by ID",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "labelId", label: "Label ID", type: "text", required: true }],
    },
    {
      actionKey: "gmail.listLabels",
      label: "List labels",
      description: "List all labels",
      supportsTest: false,
      disabled: true,
      fields: [],
    },
  ],
};
