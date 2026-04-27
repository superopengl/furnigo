#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/mobile-env.sh"

IOS_DEVICE="${MOBILE_DEVICE_IOS:-$(xcrun simctl list devices available | grep 'iPhone 17 Pro (' | head -1 | sed 's/.*(\([A-F0-9-]*\)).*/\1/')}"
if ! xcrun simctl list devices booted | grep -q "$IOS_DEVICE"; then
  echo "Booting iOS simulator $IOS_DEVICE …"
  open -a Simulator
  xcrun simctl boot "$IOS_DEVICE" 2>/dev/null || true
  echo "Waiting for iOS simulator to be ready …"
  sleep 5
fi

flutter run -d "$IOS_DEVICE" "${DART_DEFINES[@]}" "$@"
