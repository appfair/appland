#!/usr/bin/env bash
# Bump the most recent v<major>.<minor>.<patch> tag in this repository,
# create a GitHub release, and force-update the floating v<major> tag.
#
# Usage:
#   scripts/release-bump.sh [--bump major|minor|patch]
#
# Default --bump is "patch". If no semver tag exists yet the script treats
# the current version as v1.0.0, so the first patch release becomes v1.0.1,
# the first minor v1.1.0, and the first major v2.0.0.

set -euo pipefail

bump=patch
while [[ $# -gt 0 ]]; do
  case "$1" in
    --bump)        bump="${2:-}"; shift 2 ;;
    --bump=*)      bump="${1#--bump=}"; shift ;;
    -h|--help)
      sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "release-bump: unknown argument: $1" >&2
      echo "usage: scripts/release-bump.sh [--bump major|minor|patch]" >&2
      exit 2
      ;;
  esac
done

case "$bump" in
  major|minor|patch) ;;
  *)
    echo "release-bump: --bump must be one of: major, minor, patch (got '$bump')" >&2
    exit 2
    ;;
esac

# ─── Pre-flight ─────────────────────────────────────────────────────────────

# Run from the repo root so relative behaviour is consistent.
cd "$(git rev-parse --show-toplevel)"

if ! command -v gh >/dev/null 2>&1; then
  echo "release-bump: 'gh' (the GitHub CLI) is required but not installed." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "release-bump: working tree is not clean — commit or stash changes first." >&2
  git status --short >&2
  exit 1
fi

# Make sure we have an up-to-date view of remote tags.
git fetch --tags --quiet origin

# ─── Compute next version ───────────────────────────────────────────────────

# Pick the highest v<major>.<minor>.<patch> tag (annotated or lightweight).
latest=$(git tag --list 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname | head -n 1 || true)
if [[ -z "${latest}" ]]; then
  latest="v1.0.0"
  no_existing_tag=1
else
  no_existing_tag=0
fi

ver="${latest#v}"
IFS=. read -r cur_major cur_minor cur_patch <<<"$ver"

if ! [[ "$cur_major" =~ ^[0-9]+$ && "$cur_minor" =~ ^[0-9]+$ && "$cur_patch" =~ ^[0-9]+$ ]]; then
  echo "release-bump: could not parse '$latest' as v<major>.<minor>.<patch>" >&2
  exit 1
fi

case "$bump" in
  major) new_major=$((cur_major + 1)); new_minor=0;             new_patch=0 ;;
  minor) new_major=$cur_major;          new_minor=$((cur_minor + 1)); new_patch=0 ;;
  patch) new_major=$cur_major;          new_minor=$cur_minor;   new_patch=$((cur_patch + 1)) ;;
esac

new_tag="v${new_major}.${new_minor}.${new_patch}"
major_tag="v${new_major}"

if git rev-parse --verify --quiet "refs/tags/${new_tag}" >/dev/null; then
  echo "release-bump: tag ${new_tag} already exists locally; aborting." >&2
  exit 1
fi

# ─── Confirm ────────────────────────────────────────────────────────────────

branch=$(git rev-parse --abbrev-ref HEAD)
head_sha=$(git rev-parse --short HEAD)
head_subject=$(git log -1 --pretty=%s)

echo "Repository: $(git config --get remote.origin.url 2>/dev/null || echo '<no remote>')"
echo "Branch:     ${branch}"
echo "HEAD:       ${head_sha}  ${head_subject}"
if [[ ${no_existing_tag} -eq 1 ]]; then
  echo "Latest tag: (none — defaulting to v1.0.0)"
else
  echo "Latest tag: ${latest}"
fi
echo
echo "About to:"
echo "  • create annotated tag ${new_tag} at HEAD"
echo "  • push ${new_tag} to origin"
echo "  • create GitHub release ${new_tag} with auto-generated notes"
echo "  • force-update tag ${major_tag} to point at ${new_tag}"
echo "  • force-push ${major_tag} to origin"
echo

read -r -p "Do you want to tag and release ${new_tag} and update the ${major_tag} tag? [y/N] " answer
case "$answer" in
  y|Y|yes|YES|Yes) ;;
  *) echo "Aborted."; exit 0 ;;
esac

# ─── Execute ────────────────────────────────────────────────────────────────

echo "› git tag -a ${new_tag}"
git tag -a "${new_tag}" -m "Release ${new_tag}"

echo "› git push origin ${new_tag}"
git push origin "${new_tag}"

echo "› gh release create ${new_tag} --generate-notes"
gh release create "${new_tag}" --generate-notes --title "${new_tag}"

echo "› git tag -f ${major_tag} ${new_tag}"
git tag -f "${major_tag}" "${new_tag}"

echo "› git push --force origin ${major_tag}"
git push --force origin "${major_tag}"

echo
echo "Released ${new_tag} and moved ${major_tag} → ${new_tag}."
