#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/mobile-env.sh"

DEVICE_NAME="Jun 13"
DEVICE_ID=$(flutter devices | grep "$DEVICE_NAME" | head -1 | sed 's/.*• \([A-Fa-f0-9-]*\) •.*/\1/')

if [[ -z "$DEVICE_ID" ]]; then
  echo "Error: Physical device '$DEVICE_NAME' not found. Connect the device and try again."
  echo "Available devices:"
  flutter devices
  exit 1
fi

echo "Running on physical device: $DEVICE_NAME ($DEVICE_ID)"
flutter run -d "$DEVICE_ID" "${DART_DEFINES[@]}" "$@"
