#!/bin/sh
set -e
mkdir -p /shared
echo "Fake Android APK built at $(date -u)" > /shared/client.apk
tail -f /dev/null
