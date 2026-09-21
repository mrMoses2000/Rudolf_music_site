#!/usr/bin/env bash
set -euo pipefail

# Keep AGY credentials, settings and conversation state owned by ubuntu even
# though the HTTPS Telegram service itself runs as root to read TLS keys.
exec sudo -H -u ubuntu -- /home/ubuntu/.local/bin/agy "$@"
