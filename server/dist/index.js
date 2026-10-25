"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const config_js_1 = require("./config.js");
const database_js_1 = require("./database.js");
const auth_js_1 = require("./routes/auth.js");
const categories_js_1 = require("./routes/categories.js");
const products_js_1 = require("./routes/products.js");
const orders_js_1 = require("./routes/orders.js");
const cart_js_1 = require("./routes/cart.js");
const wishlist_js_1 = require("./routes/wishlist.js");
const coupons_js_1 = require("./routes/coupons.js");
const reviews_js_1 = require("./routes/reviews.js");
const banners_js_1 = require("./routes/banners.js");
const settings_js_1 = require("./routes/settings.js");
const upload_js_1 = require("./routes/upload.js");
const contact_js_1 = require("./routes/contact.js");
const upi_js_1 = require("./routes/upi.js");
const app = (0, express_1.default)();
// Initialize database & seed defaults safely
try {
    (0, database_js_1.initDatabase)();
}
catch (err) {
    console.warn('Database initialization warning:', err);
}
// CORS configuration
app.use((0, cors_1.default)({
    origin: true, // Allow frontend dev and prod
    credentials: true
}));
// Body parser
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static uploads directory (safe for serverless read-only filesystems)
const uploadsDir = (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
    ? path_1.default.join(os_1.default.tmpdir(), 'uploads')
    : path_1.default.resolve(process.cwd(), 'uploads');
try {
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
}
catch (err) {
    console.warn('Could not create uploads directory:', err);
}
app.use('/uploads', express_1.default.static(uploadsDir));
app.get('/upi-qr-code.jpg', (req, res) => {
    const file = path_1.default.join(uploadsDir, 'upi-qr-code.jpg');
    if (fs_1.default.existsSync(file))
        return res.sendFile(file);
    res.status(404).send('Not Found');
});
// API Routes
app.use('/api/auth', auth_js_1.authRouter);
app.use('/api/categories', categories_js_1.categoriesRouter);
app.use('/api/products', products_js_1.productsRouter);
app.use('/api/orders', orders_js_1.ordersRouter);
app.use('/api/cart', cart_js_1.cartRouter);
app.use('/api/wishlist', wishlist_js_1.wishlistRouter);
app.use('/api/coupons', coupons_js_1.couponsRouter);
app.use('/api/reviews', reviews_js_1.reviewsRouter);
app.use('/api/banners', banners_js_1.bannersRouter);
app.use('/api/settings', settings_js_1.settingsRouter);
app.use('/api/upload', upload_js_1.uploadRouter);
app.use('/api/contact', contact_js_1.contactRouter);
app.use('/api/upi', upi_js_1.upiRouter);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        store: config_js_1.config.storeName,
        adminEmail: config_js_1.config.adminEmail,
        location: config_js_1.config.ownerLocation,
        currency: config_js_1.config.currency,
        timestamp: new Date().toISOString()
    });
});
// Production: Serve React client build if present
const possibleDistPaths = [
    path_1.default.resolve(process.cwd(), 'client/dist'),
    path_1.default.resolve(process.cwd(), '../client/dist'),
    path_1.default.resolve(__dirname, '../../client/dist'),
    path_1.default.resolve(__dirname, '../client/dist')
];
const clientDist = possibleDistPaths.find(p => fs_1.default.existsSync(p));
if (clientDist) {
    app.use(express_1.default.static(clientDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path_1.default.join(clientDist, 'index.html'));
    });
}
// Proxy / communication endpoint with internal Python backend service
app.get('/api/internal/backend-health', async (req, res) => {
    try {
        const targetUrl = new URL('health', config_js_1.config.backendServiceUrl.endsWith('/') ? config_js_1.config.backendServiceUrl : `${config_js_1.config.backendServiceUrl}/`);
        const resp = await fetch(targetUrl.toString());
        const data = await resp.json();
        res.json({ service: 'server-express', backendStatus: data });
    }
    catch (err) {
        res.status(502).json({ error: 'Failed to communicate with internal backend service', details: err.message });
    }
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});
if (!process.env.VERCEL) {
    app.listen(config_js_1.config.port, () => {
        console.log(`====================================================`);
        console.log(`🚀 VK Technology Backend API running on port ${config_js_1.config.port}`);
        console.log(`📍 Location: ${config_js_1.config.ownerLocation}`);
        console.log(`👤 Owner Admin: ${config_js_1.config.adminEmail}`);
        console.log(`💳 Currency: ${config_js_1.config.currencySymbol} (${config_js_1.config.currency})`);
        console.log(`====================================================`);
    });
}
exports.default = app;
