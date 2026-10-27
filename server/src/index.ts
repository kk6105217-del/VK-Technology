import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initDatabase } from './database.js';
import { authRouter } from './routes/auth.js';
import { categoriesRouter } from './routes/categories.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { cartRouter } from './routes/cart.js';
import { wishlistRouter } from './routes/wishlist.js';
import { couponsRouter } from './routes/coupons.js';
import { reviewsRouter } from './routes/reviews.js';
import { bannersRouter } from './routes/banners.js';
import { settingsRouter } from './routes/settings.js';
import { uploadRouter } from './routes/upload.js';
import { contactRouter } from './routes/contact.js';
import { upiRouter } from './routes/upi.js';

const app = express();

// Initialize database & seed defaults safely
try {
  initDatabase();
} catch (err) {
  console.warn('Database initialization warning:', err);
}

// CORS configuration
app.use(cors({
  origin: true, // Allow frontend dev and prod
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory (safe for serverless read-only filesystems)
const uploadsDir = (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.warn('Could not create uploads directory:', err);
}
app.use('/uploads', express.static(uploadsDir));
app.get('/upi-qr-code.jpg', (req, res) => {
  const file = path.join(uploadsDir, 'upi-qr-code.jpg');
  if (fs.existsSync(file)) return res.sendFile(file);
  res.status(404).send('Not Found');
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/contact', contactRouter);
app.use('/api/upi', upiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: config.storeName,
    adminEmail: config.adminEmail,
    location: config.ownerLocation,
    currency: config.currency,
    timestamp: new Date().toISOString()
  });
});

// Production: Serve React client build if present
const possibleDistPaths = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist')
];
const clientDist = possibleDistPaths.find(p => fs.existsSync(p));
if (clientDist) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Proxy / communication endpoint with internal Python backend service
app.get('/api/internal/backend-health', async (req, res) => {
  try {
    const targetUrl = new URL('health', config.backendServiceUrl.endsWith('/') ? config.backendServiceUrl : `${config.backendServiceUrl}/`);
    const resp = await fetch(targetUrl.toString());
    const data = await resp.json();
    res.json({ service: 'server-express', backendStatus: data });
  } catch (err: any) {
    res.status(502).json({ error: 'Failed to communicate with internal backend service', details: err.message });
  }
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.VERCEL_ENV) {
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`🚀 VK Technology Backend API running on port ${config.port}`);
    console.log(`📍 Location: ${config.ownerLocation}`);
    console.log(`👤 Owner Admin: ${config.adminEmail}`);
    console.log(`💳 Currency: ${config.currencySymbol} (${config.currency})`);
    console.log(`====================================================`);
  });
}

// Support both CommonJS (module.exports = app) for Vercel Serverless Function entrypoints
// and ES Module (export default app)
// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  module.exports.default = app;
}

export default app;
