
import type { SchemaField } from "@/components/ui/SchemaForm/types";

import type { AppCatalogApp } from "../catalog";
import { githubIssuesCategory } from "./github/issues";
import { githubReposCategory } from "./github/repos";
import { githubReleasesCategory } from "./github/releases";

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
    githubIssuesCategory,
    githubReposCategory,
    githubReleasesCategory,
  ],
};
