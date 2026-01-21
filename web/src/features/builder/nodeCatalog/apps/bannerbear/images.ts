import type { AppCatalogCategory } from "../../catalog";

export const imagesCategory: AppCatalogCategory = {
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
};
