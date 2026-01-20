
import type { AppCatalogCategory } from "../../catalog";

export const googleSheetsDocumentsCategory: AppCatalogCategory = {
  key: "documents",
  label: "Document actions",
  items: [
    {
      actionKey: "gsheets.createSpreadsheet",
      label: "Create spreadsheet",
      description: "Create a new spreadsheet",
      supportsTest: true,
      fields: [
        { key: "title", label: "Title", type: "text", placeholder: "My Spreadsheet", required: true },
        { key: "sheetName", label: "Sheet name (optional)", type: "text", placeholder: "Sheet1" },
      ],
    },
    {
      actionKey: "gsheets.deleteSpreadsheet",
      label: "Delete spreadsheet",
      description: "Delete a spreadsheet by ID",
      supportsTest: true,
      fields: [{ key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true }],
    },
    {
      actionKey: "gsheets.getSpreadsheet",
      label: "Get spreadsheet",
      description: "Fetch spreadsheet metadata",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "spreadsheetId", label: "Spreadsheet ID", type: "text", required: true }],
    },
  ],
};
