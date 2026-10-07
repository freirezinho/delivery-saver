import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 3001;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: Date.now() }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('DeliverySaver Lightweight Sync Relay (Zero-DB)');
});

const wss = new WebSocketServer({ server });

// In-memory room store: roomCode -> Set of client WebSockets
const rooms = new Map();
// In-memory latest encrypted snapshot: roomCode -> string (encrypted JSON blob)
const snapshots = new Map();

wss.on('connection', (ws) => {
  let currentRoom = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      // 1. JOIN ROOM
      if (msg.type === 'join' && msg.room) {
        currentRoom = msg.room;
        if (!rooms.has(currentRoom)) {
          rooms.set(currentRoom, new Set());
        }
        rooms.get(currentRoom).add(ws);

        // Send latest known encrypted state if available
        if (snapshots.has(currentRoom)) {
          ws.send(JSON.stringify({
            type: 'sync',
            payload: snapshots.get(currentRoom)
          }));
        }
        return;
      }

      // 2. BROADCAST & STORE ENCRYPTED DELTA/SNAPSHOT
      if (msg.type === 'sync' && currentRoom && msg.payload) {
        // Save latest encrypted envelope in-memory
        snapshots.set(currentRoom, msg.payload);

        // Relay to all other devices in the same room
        const peers = rooms.get(currentRoom);
        if (peers) {
          for (const client of peers) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'sync',
                payload: msg.payload
              }));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      rooms.get(currentRoom).delete(ws);
      if (rooms.get(currentRoom).size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`[DeliverySaver Relay] Running on port ${PORT} (Zero-DB, In-Memory)`);
});
