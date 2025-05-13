#/usr/bin/env bash

set -eu;

MY_SERVICES=(
  "docker.socket" "docker.service" "bluetooth.service" "gnome-remote-desktop.service"
  "virtlockd.socket" "virtlockd-admin.socket" "virtlogd-admin.socket" "virtlogd.socket" "virtlockd.service" "virtlogd.service"
  "bluetooth.service"
)

for MY_SERVICE in ${MY_SERVICES[@]}; do
  echo "shuting down $MY_SERVICE"
  systemctl stop "$MY_SERVICE"
done
