# sometimes the server might not stop cleanly, so I make the script to kill it and start it again
# my cpusage is high
#!/bin/bash

# Kill any existing Node.js processes running server.js
echo "Stopping existing server..."
pkill -f "node server.js" || true
pkill -f "npm start" || true

# Wait a moment for processes to terminate
sleep 1

# Clear any stuck processes
ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true

# Start the server
echo "Starting server..."
cd "$(dirname "$0")"
node server.js