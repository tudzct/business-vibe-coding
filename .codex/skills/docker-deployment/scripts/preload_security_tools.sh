#!/usr/bin/env bash
set -euo pipefail

repo_root="${1:-.}"
lock_file="${repo_root}/security-tools/tool-versions.lock.json"

if [[ ! -f "${lock_file}" ]]; then
  echo "BLOCKED: missing ${lock_file}" >&2
  exit 2
fi

for command_name in docker jq; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "BLOCKED: required command not found: ${command_name}" >&2
    exit 2
  fi
done

if ! docker info >/dev/null 2>&1; then
  echo "BLOCKED: Docker daemon is unavailable" >&2
  exit 2
fi

lock_id="$(jq -er '.lock_id' "${lock_file}")"
semgrep_image="$(jq -er '.semgrep_image' "${lock_file}")"
semgrep_digest="$(jq -er '.semgrep_digest' "${lock_file}")"
zap_image="$(jq -er '.zap_image' "${lock_file}")"
zap_digest="$(jq -er '.zap_digest' "${lock_file}")"

verify_image() {
  local image_ref="$1"
  local expected_digest="$2"
  local actual_digests

  docker pull "${image_ref}" >/dev/null
  actual_digests="$(docker image inspect "${image_ref}" --format '{{join .RepoDigests "\n"}}')"

  if ! grep -Fxq "${expected_digest}" <<<"${actual_digests}"; then
    echo "BLOCKED: digest mismatch for ${image_ref}" >&2
    echo "Expected: ${expected_digest}" >&2
    exit 3
  fi

  local image_size
  image_size="$(docker image inspect "${image_ref}" --format '{{.Size}}')"
  echo "PASS: ${image_ref} digest verified; local size bytes=${image_size}"
}

echo "Security tool preload lock: ${lock_id}"
verify_image "${semgrep_image}" "${semgrep_digest}"
verify_image "${zap_image}" "${zap_digest}"
echo "PASS: security tool images are preloaded and retained in Docker cache"
echo "No containers were started and no application source was scanned."
