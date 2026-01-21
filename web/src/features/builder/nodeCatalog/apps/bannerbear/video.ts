import type { AppCatalogCategory } from "../../catalog";

export const videoCategory: AppCatalogCategory = {
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
};
