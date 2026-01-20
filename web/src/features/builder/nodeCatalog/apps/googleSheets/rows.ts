
import type { AppCatalogCategory } from "../../catalog";

export const googleSheetsRowsCategory: AppCatalogCategory = {
  key: "rows",
  label: "Row actions",
  items: [
    {
      actionKey: "gsheets.appendRow",
      label: "Append row",
      description: "Append a new row to a sheet",
      supportsTest: true,
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true },
        { key: "sheetName", label: "Sheet name (optional)", type: "text", placeholder: "Sheet1" },
        {
          key: "values",
          label: "Row values",
          type: "textarea",
          placeholder: "[\"value1\", \"value2\"] or value1, value2",
          required: true,
        },
      ],
    },
    {
      actionKey: "gsheets.updateRow",
      label: "Update row",
      description: "Update a row/range with new values",
      supportsTest: true,
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", required: true },
        { key: "range", label: "Range", type: "text", placeholder: "Sheet1!A2:Z2", required: true },
        {
          key: "values",
          label: "Values",
          type: "textarea",
          placeholder: "[\"value1\", \"value2\"] or value1, value2",
          required: true,
        },
      ],
    },
    {
      actionKey: "gsheets.getRows",
      label: "Get row(s)",
      description: "Fetch rows for a range",
      supportsTest: true,
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", required: true },
        { key: "range", label: "Range", type: "text", placeholder: "Sheet1!A1:Z100", required: true },
      ],
    },
    {
      actionKey: "gsheets.deleteRowsOrColumns",
      label: "Delete rows/columns",
      description: "Delete a range of rows or columns",
      supportsTest: true,
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", required: true },
        { key: "sheetName", label: "Sheet name", type: "text", placeholder: "Sheet1", required: true },
        { key: "dimension", label: "Dimension", type: "select", options: ["ROWS", "COLUMNS"], required: true },
        { key: "startIndex", label: "Start index", type: "number", placeholder: "0", required: true },
        { key: "endIndex", label: "End index", type: "number", placeholder: "1", required: true },
      ],
    },
    {
      actionKey: "gsheets.findRow",
      label: "Find row",
      description: "Search a row by value",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", required: true },
        { key: "sheetName", label: "Sheet name", type: "text", required: true },
        { key: "query", label: "Query", type: "text", required: true },
      ],
    },
  ],
};
