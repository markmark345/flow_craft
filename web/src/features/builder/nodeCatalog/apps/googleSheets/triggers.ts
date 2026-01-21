
import type { AppCatalogCategory } from "../../catalog";

export const googleSheetsTriggersCategory: AppCatalogCategory = {
  key: "triggers",
  label: "Triggers",
  items: [
    {
      actionKey: "gsheets.onRowAdded",
      label: "On row added",
      description: "Trigger when a new row is appended",
      supportsTest: false,
      disabled: true,
      kind: "trigger",
      fields: [],
    },
    {
      actionKey: "gsheets.onRowUpdated",
      label: "On row updated",
      description: "Trigger when a row is updated",
      supportsTest: false,
      disabled: true,
      kind: "trigger",
      fields: [],
    },
  ],
};
