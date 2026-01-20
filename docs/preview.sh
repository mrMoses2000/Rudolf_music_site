#!/bin/bash
# SYSTEMS INTERNALS SITE PREVIEWER
# Launches a local static server and opens the browser.

PORT=8000
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting Systems Internals Preview Server at http://localhost:$PORT..."
echo "Press Ctrl+C to stop."

# Open browser based on OS (Linux/Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:$PORT"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:$PORT"
fi

# Run Python Server
cd "$DIR" && python3 -m http.server "$PORT"
