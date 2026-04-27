#!/usr/bin/env bash
# Shared env/dart-define setup for mobile scripts — sourced, not executed directly.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV="${NODE_ENV:-development}"
ENV_FILE="$ROOT/.env.${ENV/production/production}"
FALLBACK="$ROOT/.env"

MOBILE_KEYS=(
  FURNIGO_BASE_URL
  FURNIGO_API_PATH
  FURNIGO_WS_URL
)

read_env_val() {
  local key="$1"
  local val=""
  for f in "$ENV_FILE" "$FALLBACK"; do
    if [[ -f "$f" ]]; then
      val=$(grep -E "^${key}=" "$f" | head -1 | cut -d'=' -f2-)
      [[ -n "$val" ]] && break
    fi
  done
  echo "$val"
}

DART_DEFINES=()
for key in "${MOBILE_KEYS[@]}"; do
  val=$(read_env_val "$key")
  if [[ -n "$val" ]]; then
    DART_DEFINES+=("--dart-define=$key=$val")
  fi
done

cd "$ROOT/src/apps/mobile"
echo "Running flutter with: ${DART_DEFINES[*]:-no overrides}"
