
import type { AppCatalogCategory } from "../../catalog";

export const githubReposCategory: AppCatalogCategory = {
  key: "repos",
  label: "Repo actions",
  items: [
    {
      actionKey: "github.listOrgRepos",
      label: "List org repos",
      description: "List repositories for an organization",
      supportsTest: true,
      fields: [{ key: "org", label: "Organization", type: "text", placeholder: "octo-org", required: true }],
    },
    {
      actionKey: "github.listUserRepos",
      label: "List user repos",
      description: "List repositories for the authenticated user",
      supportsTest: false,
      disabled: true,
      fields: [],
    },
    {
      actionKey: "github.getFile",
      label: "Get file",
      description: "Fetch a file from a repository",
      supportsTest: true,
      fields: [
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "repo", label: "Repository", type: "text", required: true },
        { key: "path", label: "Path", type: "text", placeholder: "README.md", required: true },
        { key: "ref", label: "Ref (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      actionKey: "github.listFiles",
      label: "List files",
      description: "List files in a repository path",
      supportsTest: true,
      fields: [
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "repo", label: "Repository", type: "text", required: true },
        { key: "path", label: "Path (optional)", type: "text", placeholder: "src" },
        { key: "ref", label: "Ref (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      actionKey: "github.createFile",
      label: "Create file",
      description: "Create a new file in a repository",
      supportsTest: true,
      fields: [
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "repo", label: "Repository", type: "text", required: true },
        { key: "path", label: "Path", type: "text", placeholder: "docs/hello.txt", required: true },
        { key: "message", label: "Commit message", type: "text", placeholder: "Add file", required: true },
        { key: "content", label: "Content", type: "textarea", required: true },
        { key: "branch", label: "Branch (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      actionKey: "github.editFile",
      label: "Update file",
      description: "Update an existing file",
      supportsTest: true,
      fields: [
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "repo", label: "Repository", type: "text", required: true },
        { key: "path", label: "Path", type: "text", required: true },
        { key: "message", label: "Commit message", type: "text", placeholder: "Update file", required: true },
        { key: "content", label: "Content", type: "textarea", required: true },
        { key: "sha", label: "SHA (optional)", type: "text", placeholder: "auto-resolved if empty" },
        { key: "branch", label: "Branch (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      actionKey: "github.deleteFile",
      label: "Delete file",
      description: "Delete a file from a repository",
      supportsTest: true,
      fields: [
        { key: "owner", label: "Owner", type: "text", required: true },
        { key: "repo", label: "Repository", type: "text", required: true },
        { key: "path", label: "Path", type: "text", required: true },
        { key: "message", label: "Commit message", type: "text", placeholder: "Delete file", required: true },
        { key: "sha", label: "SHA (optional)", type: "text", placeholder: "auto-resolved if empty" },
        { key: "branch", label: "Branch (optional)", type: "text", placeholder: "main" },
      ],
    },
  ],
};
