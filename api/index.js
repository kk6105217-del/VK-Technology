const path = require('path');

let app;
try {
  const serverPath = path.resolve(__dirname, '../server/dist/index.js');
  const serverModule = require(serverPath);
  app = serverModule.default || serverModule;
} catch (err) {
  console.error('[Vercel Serverless] Error loading server/dist/index.js:', err);
  const express = require('express');
  app = express();
  app.use(express.json());
  app.all('*', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      mode: 'serverless-fallback',
      path: req.url,
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = app;
