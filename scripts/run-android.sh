#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/mobile-env.sh"

ANDROID_AVD="${MOBILE_AVD:-Pixel_9_Pro}"
if ! adb devices 2>/dev/null | grep -q "emulator"; then
  echo "Launching Android emulator $ANDROID_AVD …"
  emulator -avd "$ANDROID_AVD" -no-snapshot-load &>/dev/null &
  echo "Waiting for Android emulator to boot …"
  adb wait-for-device
  # Wait for the device to finish booting
  for i in $(seq 1 30); do
    if adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; then
      break
    fi
    sleep 2
  done
fi

flutter run -d emulator-5554 "${DART_DEFINES[@]}" "$@"
