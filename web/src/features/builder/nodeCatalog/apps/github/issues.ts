
import type { AppCatalogCategory } from "../../catalog";

export const githubIssuesCategory: AppCatalogCategory = {
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
};
