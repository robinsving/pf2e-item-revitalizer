#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const requestedType = process.argv[2] ?? "auto";
const validTypes = new Set(["auto", "patch", "minor", "major"]);
if (!validTypes.has(requestedType)) {
  console.error(
    `Invalid release type "${requestedType}". Use one of: auto, patch, minor, major.`,
  );
  process.exit(1);
}

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 4)}\n`, "utf8");
}

function bumpVersion(currentVersion, releaseType) {
  const parts = currentVersion.split(".").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n) || n < 0)) {
    throw new Error(`Invalid semver version: ${currentVersion}`);
  }

  const [major, minor, patch] = parts;
  if (releaseType === "major") return `${major + 1}.0.0`;
  if (releaseType === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function inferReleaseType(fromTag) {
  const range = fromTag ? `${fromTag}..HEAD` : "HEAD";
  const subjects = run(`git log ${range} --pretty=format:%s`);
  const bodies = run(`git log ${range} --pretty=format:%B`);

  if (
    /BREAKING CHANGE/.test(bodies) ||
    /^[a-z]+(\(.+\))?!:/m.test(subjects)
  ) {
    return "major";
  }
  if (/^feat(\(.+\))?: /m.test(subjects)) return "minor";
  if (/^(fix|perf|revert)(\(.+\))?: /m.test(subjects)) return "patch";
  return null;
}

function updateChangelog(version, fromTag) {
  const range = fromTag ? `${fromTag}..HEAD` : "HEAD";
  const date = new Date().toISOString().slice(0, 10);
  const commits = run(`git log ${range} --pretty=format:"- %s (%h)"`);
  const releaseSection = `## v${version} (${date})\n\n${commits}\n\n`;

  let existing = "";
  try {
    existing = readFileSync("CHANGELOG.md", "utf8");
  } catch {
    existing = "";
  }

  if (!existing.trim()) {
    writeFileSync("CHANGELOG.md", `# Changelog\n\n${releaseSection}`, "utf8");
    return;
  }

  const lines = existing.split("\n");
  const stripBom = (line) => line.replace(/^\uFEFF/, "");
  const firstNonEmptyIndex = lines.findIndex(
    (line) => stripBom(line).trim().length > 0,
  );
  const firstLine = firstNonEmptyIndex === -1 ? "" : stripBom(lines[firstNonEmptyIndex]);
  if (/^#\s*Changelog\b/i.test(firstLine)) {
    const rest = lines.slice(firstNonEmptyIndex + 1).join("\n").replace(/^\n+/, "");
    writeFileSync(
      "CHANGELOG.md",
      `# Changelog\n\n${releaseSection}${rest}`.trimEnd() + "\n",
      "utf8",
    );
    return;
  }

  writeFileSync(
    "CHANGELOG.md",
    `# Changelog\n\n${releaseSection}${existing}`.trimEnd() + "\n",
    "utf8",
  );
}

const latestTag = run('git tag -l "*.*.*" | sort -V | tail -n1');
const releaseType =
  requestedType === "auto" ? inferReleaseType(latestTag) : requestedType;

if (!releaseType) {
  console.log(
    `No releasable commits found since ${latestTag || "start of history"}.`,
  );
  process.exit(0);
}

const moduleJson = readJson("module.json");
const currentVersion = moduleJson.version;
const newVersion = bumpVersion(currentVersion, releaseType);

moduleJson.version = newVersion;
writeJson("module.json", moduleJson);
updateChangelog(newVersion, latestTag);

console.log(`Release type: ${releaseType}`);
console.log(`Version: ${currentVersion} -> ${newVersion}`);
