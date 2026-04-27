#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/mobile-env.sh"

# --- iOS Simulator ---
IOS_DEVICE="${MOBILE_DEVICE_IOS:-$(xcrun simctl list devices available | grep 'iPhone 17 Pro (' | head -1 | sed 's/.*(\([A-F0-9-]*\)).*/\1/')}"
if ! xcrun simctl list devices booted | grep -q "$IOS_DEVICE"; then
  echo "Booting iOS simulator $IOS_DEVICE …"
  open -a Simulator
  xcrun simctl boot "$IOS_DEVICE" 2>/dev/null || true
  echo "Waiting for iOS simulator to be ready …"
  sleep 5
fi

# --- Android Emulator ---
ANDROID_AVD="${MOBILE_AVD:-Pixel_9_Pro}"
if ! adb devices 2>/dev/null | grep -q "emulator"; then
  echo "Launching Android emulator $ANDROID_AVD …"
  emulator -avd "$ANDROID_AVD" -no-snapshot-load &>/dev/null &
  echo "Waiting for Android emulator to boot …"
  adb wait-for-device
  for i in $(seq 1 30); do
    if adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; then
      break
    fi
    sleep 2
  done
fi

# Run on all available mobile devices
flutter run -d all "${DART_DEFINES[@]}" "$@"
