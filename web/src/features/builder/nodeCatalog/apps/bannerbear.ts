import type { SchemaField } from "@/shared/components/SchemaForm/types";

import type { AppCatalogApp } from "../catalog";

const baseFields: SchemaField[] = [
  {
    key: "credentialId",
    label: "Credential (optional)",
    type: "credential",
    provider: "bannerbear",
    helpText: "Optional: use a Bannerbear credential from Credentials.",
  },
  {
    key: "apiKey",
    label: "API key (optional)",
    type: "text",
    placeholder: "bb_...",
    helpText: "If set, this key is used instead of the credential.",
  },
];

export const bannerbearApp: AppCatalogApp = {
  appKey: "bannerbear",
  label: "Bannerbear",
  description: "Generate images from templates",
  icon: "bannerbear",
  baseFields,
  categories: [
    {
      key: "images",
      label: "Image actions",
      items: [
        {
          actionKey: "bannerbear.createImage",
          label: "Create an image",
          description: "Generate an image from a template",
          supportsTest: true,
          fields: [
            { key: "templateUid", label: "Template UID", type: "text", placeholder: "tpl_...", required: true },
            {
              key: "modifications",
              label: "Modifications (JSON, optional)",
              type: "json",
              placeholder: "[{\"name\":\"title\",\"text\":\"Hello\"}]",
              helpText: "Array of modifications to apply to the template.",
            },
            {
              key: "webhookUrl",
              label: "Webhook URL (optional)",
              type: "text",
              placeholder: "https://example.com/webhook",
              helpText: "Bannerbear will POST results to this webhook when processing completes.",
            },
          ],
        },
        {
          actionKey: "bannerbear.getImage",
          label: "Get an image",
          description: "Fetch image generation status/output",
          supportsTest: true,
          fields: [{ key: "imageUid", label: "Image UID", type: "text", placeholder: "img_...", required: true }],
        },
      ],
    },
    {
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
    },
    {
      key: "video",
      label: "Video actions",
      items: [
        {
          actionKey: "bannerbear.createVideo",
          label: "Create a video",
          description: "Generate a video from a template",
          supportsTest: false,
          disabled: true,
          fields: [
            { key: "templateUid", label: "Template UID", type: "text", required: true },
            { key: "modifications", label: "Modifications (JSON)", type: "json" },
          ],
        },
        {
          actionKey: "bannerbear.getVideo",
          label: "Get a video",
          description: "Fetch video generation status/output",
          supportsTest: false,
          disabled: true,
          fields: [{ key: "videoUid", label: "Video UID", type: "text", required: true }],
        },
      ],
    },
  ],
};

