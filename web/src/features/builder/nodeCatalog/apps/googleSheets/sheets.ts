
import type { AppCatalogCategory } from "../../catalog";

export const googleSheetsSheetsCategory: AppCatalogCategory = {
  key: "sheets",
  label: "Sheet actions",
  items: [
    {
      actionKey: "gsheets.createSheet",
      label: "Create sheet",
      description: "Create a new sheet in a spreadsheet",
      supportsTest: true,
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", required: true },
        { key: "sheetName", label: "Sheet name", type: "text", placeholder: "Sheet2", required: true },
      ],
    },
    {
      actionKey: "gsheets.deleteSheet",
      label: "Delete sheet",
      description: "Delete a sheet by name",
      supportsTest: true,
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", required: true },
        { key: "sheetName", label: "Sheet name", type: "text", placeholder: "Sheet1", required: true },
      ],
    },
    {
      actionKey: "gsheets.clearRange",
      label: "Clear range",
      description: "Clear cells in a range",
      supportsTest: true,
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", required: true },
        { key: "range", label: "Range", type: "text", placeholder: "Sheet1!A1:Z999", required: true },
      ],
    },
    {
      actionKey: "gsheets.copySheet",
      label: "Copy sheet",
      description: "Copy a sheet to another spreadsheet",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "spreadsheetId", label: "Source spreadsheet ID", type: "text", required: true },
        { key: "sheetName", label: "Source sheet name", type: "text", required: true },
        { key: "destinationSpreadsheetId", label: "Destination spreadsheet ID", type: "text", required: true },
      ],
    },
  ],
};
