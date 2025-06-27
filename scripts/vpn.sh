#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

SCRIPT_NAME=$(basename "$0")

usage() {
  cat <<EOF
Usage: $SCRIPT_NAME <command>

Commands:
  connect       Connect to VPN
  disconnect    Disconnect from VPN
  help          Show this help message
EOF
}

connect() {
  COUNTRY=$1
  echo "Connecting to VPN $COUNTRY..."
  nordvpn connect $COUNTRY
  nordvpn set killswitch on
}

disconnect() {
  echo "Disconnecting from VPN..."
  nordvpn set killswitch off
  nordvpn disconnect
}

main() {
  if [[ $# -lt 1 ]]; then
    usage
    exit 1
  fi

  case "$1" in
    connect)
      connect ${2:-GB}
      ;;
    disconnect)
      disconnect
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      echo "Unknown command: $1"
      usage
      exit 1
      ;;
  esac
}

main "$@"
