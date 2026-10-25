"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRouter = void 0;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const auth_js_1 = require("../middleware/auth.js");
exports.wishlistRouter = (0, express_1.Router)();
// Get Wishlist Items
exports.wishlistRouter.get('/', auth_js_1.authenticateToken, (req, res) => {
    try {
        const items = database_js_1.db.prepare(`
      SELECT 
        w.id as wishlist_id,
        w.created_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.sku,
        p.regular_price,
        p.discounted_price,
        p.stock_quantity,
        (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC LIMIT 1) as image_url
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.id DESC
    `).all(req.user.id);
        res.json({ items });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch wishlist.' });
    }
});
// Toggle Wishlist item (Add if absent, Remove if present)
exports.wishlistRouter.post('/toggle', auth_js_1.authenticateToken, (req, res) => {
    try {
        const { product_id } = req.body;
        if (!product_id) {
            res.status(400).json({ error: 'Product ID is required.' });
            return;
        }
        const existing = database_js_1.db.prepare('SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
        if (existing) {
            database_js_1.db.prepare('DELETE FROM wishlists WHERE id = ?').run(existing.id);
            res.json({ inWishlist: false, message: 'Removed from wishlist.' });
        }
        else {
            database_js_1.db.prepare('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)').run(req.user.id, product_id);
            res.json({ inWishlist: true, message: 'Added to wishlist.' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to toggle wishlist.' });
    }
});
// Remove from Wishlist
exports.wishlistRouter.delete('/:productId', auth_js_1.authenticateToken, (req, res) => {
    try {
        database_js_1.db.prepare('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
        res.json({ message: 'Removed from wishlist.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to remove from wishlist.' });
    }
});
