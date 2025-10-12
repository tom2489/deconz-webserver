#!/bin/bash -e
exec "$SNAP/electron/desktop-init.sh" "$SNAP/electron/desktop-common.sh" "$SNAP/electron/desktop-gnome-specific.sh" "$SNAP/electron/my-electron-app" "$@" --no-sandbox