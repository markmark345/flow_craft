import type { SchemaField } from "@/components/ui/SchemaForm/types";
import type { AppCatalogApp } from "../catalog";
import { imagesCategory, templatesCategory, videoCategory } from "./bannerbear/index";

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
  categories: [imagesCategory, templatesCategory, videoCategory],
};

