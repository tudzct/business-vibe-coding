#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "${1:-.}" && pwd)"
lock_file="${repo_root}/security-tools/tool-versions.lock.json"
scan_compose="${repo_root}/security-tools/compose.security-scan.yaml"
app_compose="${repo_root}/finalsource/compose.yaml"
env_file="${repo_root}/finalsource/.env"

for required in docker jq shasum; do
  command -v "${required}" >/dev/null 2>&1 || { echo "BLOCKED: missing command ${required}" >&2; exit 2; }
done
for required_file in "${lock_file}" "${scan_compose}" "${app_compose}" "${env_file}"; do
  [[ -f "${required_file}" ]] || { echo "BLOCKED: missing ${required_file}" >&2; exit 2; }
done
docker info >/dev/null 2>&1 || { echo "BLOCKED: Docker daemon unavailable" >&2; exit 2; }

temp_root="$(mktemp -d)"
trap 'rm -rf -- "${temp_root}"' EXIT
mkdir -p "${temp_root}/preflight-source"
printf 'export const preflight = true;\n' >"${temp_root}/preflight-source/preflight.ts"
printf '{"openapi":"3.0.3","info":{"title":"Security tool preflight","version":"1"},"servers":[{"url":"http://127.0.0.1:8090"}],"paths":{"/probe":{"get":{"responses":{"200":{"description":"ready"}}}}}}\n' >"${temp_root}/preflight-openapi.json"
printf '{"ready":true}\n' >"${temp_root}/probe"

lock_id="$(jq -er '.lock_id' "${lock_file}")"
semgrep_image="$(jq -er '.semgrep_image' "${lock_file}")"
semgrep_digest="$(jq -er '.semgrep_digest' "${lock_file}")"
zap_image="$(jq -er '.zap_image' "${lock_file}")"
zap_digest="$(jq -er '.zap_digest' "${lock_file}")"

verify_digest() {
  local image_ref="$1" expected="$2" actual
  actual="$(docker image inspect "${image_ref}" --format '{{join .RepoDigests "\n"}}' 2>/dev/null || true)"
  grep -Fxq "${expected}" <<<"${actual}" || { echo "BLOCKED: missing or mismatched image ${image_ref}" >&2; exit 3; }
}
verify_digest "${semgrep_image}" "${semgrep_digest}"
verify_digest "${zap_image}" "${zap_digest}"

compose=(docker compose --env-file "${env_file}" -f "${app_compose}" -f "${scan_compose}")
REPO_ROOT="${repo_root}" SCAN_OUTPUT_DIR="${temp_root}" SEMGREP_IMAGE="${semgrep_image}" ZAP_IMAGE="${zap_image}" \
  "${compose[@]}" config --quiet >/dev/null

source_hash_before="$(find "${repo_root}/finalsource" -type f ! -path '*/node_modules/*' ! -path '*/dist/*' ! -name '.env' -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | awk '{print $1}')"

if ! REPO_ROOT="${repo_root}" SCAN_OUTPUT_DIR="${temp_root}" SEMGREP_IMAGE="${semgrep_image}" ZAP_IMAGE="${zap_image}" \
  "${compose[@]}" run --rm semgrep semgrep scan --config /policy/semgrep.yml --json-output /output/semgrep.preflight.json /output/preflight-source \
  >"${temp_root}/semgrep.log" 2>&1; then
  echo "BLOCKED: Semgrep preflight failed" >&2
  tail -n 12 "${temp_root}/semgrep.log" >&2
  exit 4
fi

if ! REPO_ROOT="${repo_root}" SCAN_OUTPUT_DIR="${temp_root}" SEMGREP_IMAGE="${semgrep_image}" ZAP_IMAGE="${zap_image}" \
  "${compose[@]}" run --rm --entrypoint sh zap -c 'python3 -m http.server 8090 --directory /zap/wrk >/dev/null 2>&1 & exec zap-api-scan.py -t /zap/wrk/preflight-openapi.json -f openapi -c /zap/policy/zap-rules.conf -J zap.preflight.json -I -s -S' \
  >"${temp_root}/zap.log" 2>&1; then
  echo "BLOCKED: ZAP preflight failed" >&2
  tail -n 12 "${temp_root}/zap.log" >&2
  exit 5
fi

[[ -s "${temp_root}/semgrep.preflight.json" && -s "${temp_root}/zap.preflight.json" ]] || {
  echo "BLOCKED: preflight result output missing" >&2
  exit 6
}

source_hash_after="$(find "${repo_root}/finalsource" -type f ! -path '*/node_modules/*' ! -path '*/dist/*' ! -name '.env' -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | awk '{print $1}')"
[[ "${source_hash_before}" == "${source_hash_after}" ]] || { echo "BLOCKED: finalsource changed during preflight" >&2; exit 7; }

echo "PASS: security tools ready; lock=${lock_id}; semgrep=ready; zap=ready; source_unchanged=true; artifacts_persisted=none"
