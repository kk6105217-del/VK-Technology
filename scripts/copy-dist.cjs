const fs = require('fs');
const path = require('path');

try {
  const clientDist = path.resolve(__dirname, '../client/dist');
  const serverPublic = path.resolve(__dirname, '../server/dist/public');
  if (fs.existsSync(clientDist)) {
    fs.mkdirSync(serverPublic, { recursive: true });
    fs.cpSync(clientDist, serverPublic, { recursive: true });
    console.log('[build] Successfully copied client/dist into server/dist/public');
  }
} catch (err) {
  console.warn('[build] Non-fatal copy warning:', err && err.message);
}
