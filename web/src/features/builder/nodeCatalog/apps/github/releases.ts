
import type { AppCatalogCategory } from "../../catalog";

export const githubReleasesCategory: AppCatalogCategory = {
  key: "releases",
  label: "Release actions",
  items: [
    {
      actionKey: "github.createRelease",
      label: "Create release",
      description: "Create a new release",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "repo", label: "Repository", type: "text", required: true },
        { key: "tag", label: "Tag", type: "text", placeholder: "v1.0.0", required: true },
        { key: "name", label: "Name", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
      ],
    },
    {
      actionKey: "github.getRelease",
      label: "Get release",
      description: "Fetch a release by ID",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "repo", label: "Repository", type: "text", required: true },
        { key: "releaseId", label: "Release ID", type: "number", required: true },
      ],
    },
    {
      actionKey: "github.listReleases",
      label: "List releases",
      description: "List releases for a repository",
      supportsTest: false,
      disabled: true,
      fields: [
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "repo", label: "Repository", type: "text", required: true },
      ],
    },
  ],
};
