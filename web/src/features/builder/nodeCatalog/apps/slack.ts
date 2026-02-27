
import type { SchemaField } from "@/components/ui/SchemaForm/types";
import type { AppCatalogApp, AppCatalogCategory } from "../catalog";

const baseFields: SchemaField[] = [
  {
    key: "credentialId",
    label: "Credential",
    type: "credential",
    provider: "slack",
    required: true,
    helpText: "Connect a Slack account (Bot Token).",
  },
];

const messagingCategory: AppCatalogCategory = {
  key: "messaging",
  label: "Messaging",
  items: [
    {
      actionKey: "slack.sendMessage",
      label: "Send Message",
      description: "Post a message to a channel",
      kind: "action",
      supportsTest: false,
      fields: [
        {
          key: "channel",
          label: "Channel ID",
          type: "text",
          required: true,
          placeholder: "C12345678",
          helpText: "The channel ID (e.g. C0123AB45)",
        },
        {
          key: "message",
          label: "Message",
          type: "textarea",
          required: true,
          placeholder: "Hello world",
        },
      ],
    },
  ],
};

export const slackApp: AppCatalogApp = {
  appKey: "slack",
  label: "Slack",
  description: "Send messages to Slack channels",
  icon: "slack",
  baseFields,
  categories: [messagingCategory],
};
