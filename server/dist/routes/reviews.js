"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewsRouter = void 0;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const auth_js_1 = require("../middleware/auth.js");
exports.reviewsRouter = (0, express_1.Router)();
// Recompute product rating average
function updateProductRating(productId) {
    const stats = database_js_1.db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as count 
    FROM reviews 
    WHERE product_id = ? AND status = 'approved'
  `).get(productId);
    if (stats && stats.count > 0) {
        database_js_1.db.prepare(`
      UPDATE products SET 
        rating_avg = ROUND(?, 1), 
        rating_count = ?, 
        updated_at = datetime('now') 
      WHERE id = ?
    `).run(stats.avg_rating || 5.0, stats.count, productId);
    }
}
// Get approved reviews for a product
exports.reviewsRouter.get('/product/:productId', (req, res) => {
    try {
        const reviews = database_js_1.db.prepare(`
      SELECT * FROM reviews 
      WHERE product_id = ? AND status = 'approved'
      ORDER BY id DESC
    `).all(req.params.productId);
        res.json({ reviews });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
});
// Submit a review
exports.reviewsRouter.post('/', auth_js_1.optionalToken, (req, res) => {
    try {
        const { product_id, customer_name, rating, title, comment } = req.body;
        if (!product_id || !rating || !comment) {
            res.status(400).json({ error: 'Product ID, rating (1-5), and review text are required.' });
            return;
        }
        if (rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
            return;
        }
        const userId = req.user ? req.user.id : null;
        let name = customer_name ? customer_name.trim() : (req.user ? req.user.full_name : 'Customer');
        // Check if verified purchase
        let isVerified = 0;
        if (userId) {
            const purchaseCheck = database_js_1.db.prepare(`
        SELECT oi.id 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ? AND oi.product_id = ? AND o.payment_status = 'Paid'
        LIMIT 1
      `).get(userId, product_id);
            if (purchaseCheck)
                isVerified = 1;
        }
        const result = database_js_1.db.prepare(`
      INSERT INTO reviews (product_id, user_id, customer_name, rating, title, comment, is_verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'approved')
    `).run(product_id, userId, name, Number(rating), title || null, comment.trim(), isVerified);
        updateProductRating(Number(product_id));
        res.status(201).json({
            message: 'Thank you! Your review has been submitted.',
            reviewId: Number(result.lastInsertRowid)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit review.' });
    }
});
// Admin: Get all reviews for moderation
exports.reviewsRouter.get('/admin/all', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const reviews = database_js_1.db.prepare(`
      SELECT r.*, p.name as product_name, p.slug as product_slug
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.id DESC
    `).all();
        res.json({ reviews });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews for moderation.' });
    }
});
// Admin: Moderate review status (approve / reject)
exports.reviewsRouter.patch('/admin/:id/status', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            res.status(400).json({ error: 'Invalid status.' });
            return;
        }
        const review = database_js_1.db.prepare('SELECT product_id FROM reviews WHERE id = ?').get(req.params.id);
        if (!review) {
            res.status(404).json({ error: 'Review not found.' });
            return;
        }
        database_js_1.db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, req.params.id);
        updateProductRating(review.product_id);
        res.json({ message: `Review marked as ${status}.` });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update review status.' });
    }
});
// Admin: Delete review
exports.reviewsRouter.delete('/admin/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const review = database_js_1.db.prepare('SELECT product_id FROM reviews WHERE id = ?').get(req.params.id);
        if (review) {
            database_js_1.db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
            updateProductRating(review.product_id);
        }
        res.json({ message: 'Review deleted.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete review.' });
    }
});
