#!/usr/bin/env bash
set -euo pipefail

# Resolve repo root (parent of scripts/)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV="${NODE_ENV:-development}"
ENV_FILE="$ROOT/.env.${ENV/production/production}"
FALLBACK="$ROOT/.env"

# Mobile-specific keys to forward as --dart-define
MOBILE_KEYS=(
  FURNIGO_API_BASE_URL
  FURNIGO_WS_URL
)

# Read a key from env files (env-specific first, then fallback)
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

# Build --dart-define flags
DART_DEFINES=()
for key in "${MOBILE_KEYS[@]}"; do
  val=$(read_env_val "$key")
  if [[ -n "$val" ]]; then
    DART_DEFINES+=("--dart-define=$key=$val")
  fi
done

cd "$ROOT/src/apps/mobile"
echo "Running flutter with: ${DART_DEFINES[*]:-no overrides}"
flutter run "${DART_DEFINES[@]}" "$@"
