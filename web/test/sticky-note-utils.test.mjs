import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as ts from "typescript";

async function importTsModule(tsFilePath) {
  const source = await fs.readFile(tsFilePath, "utf8");
  const out = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
    fileName: tsFilePath,
  });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(out.outputText, "utf8").toString("base64")}`;
  return import(dataUrl);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mod = await importTsModule(
  path.join(__dirname, "..", "src", "features", "builder", "lib", "sticky-note-utils.ts")
);

test("splitTitleAndBody", () => {
  assert.deepEqual(mod.splitTitleAndBody("Hello\n\nWorld"), { title: "Hello", body: "World" });
  assert.deepEqual(mod.splitTitleAndBody("World"), { title: "", body: "World" });
});

test("combineTitleAndBody", () => {
  assert.equal(mod.combineTitleAndBody("", "Body"), "Body");
  assert.equal(mod.combineTitleAndBody("Title", "Body"), "Title\n\nBody");
});

test("initialsFor", () => {
  assert.equal(mod.initialsFor({ name: "Dev Team" }), "DT");
  assert.equal(mod.initialsFor({ name: "A" }), "A");
  assert.equal(mod.initialsFor({ email: "name@company.com" }), "NA");
  assert.equal(mod.initialsFor({}), "U");
});

test("getNoteAccent", () => {
  assert.equal(mod.getNoteAccent("green"), "var(--success)");
  assert.equal(mod.getNoteAccent("yellow"), "var(--warning)");
  assert.equal(mod.getNoteAccent("blue"), "var(--accent)");
});

test("formatRelative", () => {
  const realNow = Date.now;
  Date.now = () => Date.parse("2025-01-01T00:00:00Z");
  try {
    assert.equal(mod.formatRelative(undefined), "—");
    assert.equal(mod.formatRelative("not-a-date"), "—");
    assert.equal(mod.formatRelative("2025-01-01T00:00:00Z"), "Just now");
    assert.equal(mod.formatRelative("2024-12-31T23:58:00Z"), "2 mins ago");
  } finally {
    Date.now = realNow;
  }
});

