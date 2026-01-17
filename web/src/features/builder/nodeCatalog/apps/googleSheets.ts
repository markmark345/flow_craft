import type { SchemaField } from "@/components/ui/SchemaForm/types";

import type { AppCatalogApp } from "../catalog";

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
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ],
};

