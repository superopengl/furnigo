#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/mobile-env.sh"

DEVICE_NAME="Jun 13"
DEVICE_ID=$(flutter devices | grep "$DEVICE_NAME" | head -1 | awk -F'•' '{gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2}')

if [[ -z "$DEVICE_ID" ]]; then
  echo "Error: Physical device '$DEVICE_NAME' not found. Connect the device and try again."
  echo "Available devices:"
  flutter devices
  exit 1
fi

# Physical devices can't reach localhost — replace with Mac's LAN IP
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || true)
if [[ -z "$LAN_IP" ]]; then
  echo "Error: Could not detect LAN IP. Make sure your Mac is connected to Wi-Fi."
  exit 1
fi

DART_DEFINES=("${DART_DEFINES[@]//localhost/$LAN_IP}")

echo "Running on physical device: $DEVICE_NAME ($DEVICE_ID)"
echo "Using LAN IP: $LAN_IP"
flutter run -d "$DEVICE_ID" "${DART_DEFINES[@]}" "$@"
