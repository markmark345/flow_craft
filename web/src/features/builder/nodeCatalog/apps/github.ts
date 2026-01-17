import type { SchemaField } from "@/components/ui/SchemaForm/types";

import type { AppCatalogApp } from "../catalog";

const baseFields: SchemaField[] = [
  {
    key: "credentialId",
    label: "Credential",
    type: "credential",
    provider: "github",
    required: true,
    helpText: "Connect a GitHub account in Credentials to call the GitHub API.",
  },
];

export const githubApp: AppCatalogApp = {
  appKey: "github",
  label: "GitHub",
  description: "Work with issues, repositories, and files",
  icon: "github",
  baseFields,
  categories: [
    {
      key: "issues",
      label: "Issue actions",
      items: [
        {
          actionKey: "github.createIssue",
          label: "Create issue",
          description: "Create a new issue",
          supportsTest: true,
          fields: [
            { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
            { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
            { key: "title", label: "Title", type: "text", placeholder: "Bug report", required: true },
            { key: "body", label: "Body (optional)", type: "textarea", placeholder: "Describe the issue..." },
          ],
        },
        {
          actionKey: "github.editIssue",
          label: "Edit issue",
          description: "Update title/body/state",
          supportsTest: true,
          fields: [
            { key: "owner", label: "Owner", type: "text", required: true },
            { key: "repo", label: "Repository", type: "text", required: true },
            { key: "issueNumber", label: "Issue number", type: "number", placeholder: "1", required: true },
            { key: "title", label: "Title (optional)", type: "text" },
            { key: "body", label: "Body (optional)", type: "textarea" },
            { key: "state", label: "State (optional)", type: "select", options: ["open", "closed"] },
          ],
        },
        {
          actionKey: "github.getIssue",
          label: "Get issue",
          description: "Fetch issue details",
          supportsTest: true,
          fields: [
            { key: "owner", label: "Owner", type: "text", required: true },
            { key: "repo", label: "Repository", type: "text", required: true },
            { key: "issueNumber", label: "Issue number", type: "number", placeholder: "1", required: true },
          ],
        },
        {
          actionKey: "github.listIssues",
          label: "List issues",
          description: "List issues in a repository",
          supportsTest: false,
          disabled: true,
          fields: [
            { key: "owner", label: "Owner", type: "text", required: true },
            { key: "repo", label: "Repository", type: "text", required: true },
            { key: "state", label: "State", type: "select", options: ["open", "closed", "all"] },
          ],
        },
        {
          actionKey: "github.createIssueComment",
          label: "Create comment",
          description: "Add a comment to an issue",
          supportsTest: true,
          fields: [
            { key: "owner", label: "Owner", type: "text", required: true },
            { key: "repo", label: "Repository", type: "text", required: true },
            { key: "issueNumber", label: "Issue number", type: "number", required: true },
            { key: "body", label: "Comment", type: "textarea", required: true },
          ],
        },
        {
          actionKey: "github.lockIssue",
          label: "Lock issue",
          description: "Lock a conversation on an issue",
          supportsTest: true,
          fields: [
            { key: "owner", label: "Owner", type: "text", required: true },
            { key: "repo", label: "Repository", type: "text", required: true },
            { key: "issueNumber", label: "Issue number", type: "number", required: true },
            {
              key: "lockReason",
              label: "Reason (optional)",
              type: "select",
              options: ["off-topic", "too heated", "resolved", "spam"],
            },
          ],
        },
        {
          actionKey: "github.unlockIssue",
          label: "Unlock issue",
          description: "Unlock a locked issue",
          supportsTest: false,
          disabled: true,
          fields: [
            { key: "owner", label: "Owner", type: "text", required: true },
            { key: "repo", label: "Repository", type: "text", required: true },
            { key: "issueNumber", label: "Issue number", type: "number", required: true },
          ],
        },
      ],
    },
    {
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
    },
    {
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
    },
  ],
};

