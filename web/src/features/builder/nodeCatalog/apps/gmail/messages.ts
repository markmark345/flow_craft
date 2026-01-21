
import type { AppCatalogCategory } from "../../catalog";

export const gmailMessagesCategory: AppCatalogCategory = {
  key: "messages",
  label: "Message actions",
  items: [
    {
      actionKey: "gmail.sendEmail",
      label: "Send message",
      description: "Send an email using Gmail",
      supportsTest: true,
      fields: [
        { key: "from", label: "From (optional)", type: "text", placeholder: "me@company.com" },
        { key: "to", label: "To", type: "text", placeholder: "recipient@company.com", required: true },
        { key: "subject", label: "Subject", type: "text", placeholder: "Hello from FlowCraft", required: true },
        { key: "bodyText", label: "Body (text)", type: "textarea", placeholder: "Write a plain-text message..." },
        { key: "bodyHtml", label: "Body (HTML)", type: "textarea", placeholder: "<p>Write HTML content...</p>" },
      ],
    },
    {
      actionKey: "gmail.replyMessage",
      label: "Reply to message",
      description: "Reply to a Gmail message",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "messageId", label: "Message ID", type: "text", required: true },
        { key: "bodyText", label: "Reply body", type: "textarea", required: true },
      ],
    },
    {
      actionKey: "gmail.getMessage",
      label: "Get message",
      description: "Fetch a single message by ID",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "messageId", label: "Message ID", type: "text", required: true }],
    },
    {
      actionKey: "gmail.listMessages",
      label: "List messages",
      description: "List messages matching a query",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "query", label: "Query", type: "text", placeholder: "from:me is:unread" },
        { key: "maxResults", label: "Max results", type: "number", placeholder: "25" },
      ],
    },
    {
      actionKey: "gmail.addLabel",
      label: "Add label to message",
      description: "Apply a label to a message",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "messageId", label: "Message ID", type: "text", required: true },
        { key: "labelId", label: "Label ID", type: "text", required: true },
      ],
    },
    {
      actionKey: "gmail.removeLabel",
      label: "Remove label from message",
      description: "Remove a label from a message",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "messageId", label: "Message ID", type: "text", required: true },
        { key: "labelId", label: "Label ID", type: "text", required: true },
      ],
    },
    {
      actionKey: "gmail.markRead",
      label: "Mark as read",
      description: "Mark a message as read",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "messageId", label: "Message ID", type: "text", required: true }],
    },
    {
      actionKey: "gmail.markUnread",
      label: "Mark as unread",
      description: "Mark a message as unread",
      supportsTest: false,
      disabled: true,
      fields: [{ key: "messageId", label: "Message ID", type: "text", required: true }],
    },
  ],
};
