#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=512"

# Kill any existing server
pkill -f "next dev" 2>/dev/null
sleep 2
rm -rf .next

# Start the server with auto-restart
while true; do
  echo "Starting Next.js dev server..."
  npx next dev -p 3000 2>&1 | tee /home/z/my-project/dev.log
  EXIT_CODE=$?
  echo "Server exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
