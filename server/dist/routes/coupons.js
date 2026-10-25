"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponsRouter = void 0;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const auth_js_1 = require("../middleware/auth.js");
exports.couponsRouter = (0, express_1.Router)();
// Validate Coupon for Cart
exports.couponsRouter.post('/validate', (req, res) => {
    try {
        const { code, subtotal } = req.body;
        if (!code) {
            res.status(400).json({ error: 'Coupon code is required.' });
            return;
        }
        const cleanCode = code.trim().toUpperCase();
        const coupon = database_js_1.db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(cleanCode);
        if (!coupon) {
            res.status(404).json({ error: 'Invalid or expired coupon code.' });
            return;
        }
        // Check expiry
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            res.status(400).json({ error: 'This coupon has expired.' });
            return;
        }
        // Check usage limits
        if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
            res.status(400).json({ error: 'This coupon has reached its maximum usage limit.' });
            return;
        }
        // Check minimum order value
        if (coupon.min_order_value && Number(subtotal) < Number(coupon.min_order_value)) {
            res.status(400).json({
                error: `Minimum order value of ₹${coupon.min_order_value} is required to apply code "${coupon.code}".`
            });
            return;
        }
        // Calculate discount amount
        let discountAmount = 0;
        if (coupon.discount_type === 'percentage') {
            discountAmount = (Number(subtotal) * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
                discountAmount = Number(coupon.max_discount_amount);
            }
        }
        else {
            discountAmount = Number(coupon.discount_value);
        }
        // Cannot exceed subtotal
        discountAmount = Math.min(Number(subtotal), discountAmount);
        res.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                description: coupon.description,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                discount_amount: Math.round(discountAmount * 100) / 100
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to validate coupon.' });
    }
});
// Admin: Get all coupons
exports.couponsRouter.get('/admin/all', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const coupons = database_js_1.db.prepare('SELECT * FROM coupons ORDER BY id DESC').all();
        res.json({ coupons });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch coupons.' });
    }
});
// Admin: Create Coupon
exports.couponsRouter.post('/admin', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { code, description, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, start_date, expiry_date, is_active } = req.body;
        if (!code || !discount_type || discount_value === undefined) {
            res.status(400).json({ error: 'Code, discount type, and discount value are required.' });
            return;
        }
        const cleanCode = code.trim().toUpperCase();
        const result = database_js_1.db.prepare(`
      INSERT INTO coupons (
        code, description, discount_type, discount_value, min_order_value,
        max_discount_amount, usage_limit, start_date, expiry_date, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(cleanCode, description || null, discount_type, Number(discount_value), min_order_value ? Number(min_order_value) : 0, max_discount_amount ? Number(max_discount_amount) : null, usage_limit ? Number(usage_limit) : null, start_date || null, expiry_date || null, is_active !== undefined ? (is_active ? 1 : 0) : 1);
        res.status(201).json({ message: 'Coupon created successfully.', id: Number(result.lastInsertRowid) });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create coupon.' });
    }
});
// Admin: Update Coupon
exports.couponsRouter.put('/admin/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { code, description, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, start_date, expiry_date, is_active } = req.body;
        database_js_1.db.prepare(`
      UPDATE coupons SET
        code = ?, description = ?, discount_type = ?, discount_value = ?, min_order_value = ?,
        max_discount_amount = ?, usage_limit = ?, start_date = ?, expiry_date = ?, is_active = ?
      WHERE id = ?
    `).run(code.toUpperCase(), description, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, start_date, expiry_date, is_active ? 1 : 0, req.params.id);
        res.json({ message: 'Coupon updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update coupon.' });
    }
});
// Admin: Delete Coupon
exports.couponsRouter.delete('/admin/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        database_js_1.db.prepare('DELETE FROM coupons WHERE id = ?').run(req.params.id);
        res.json({ message: 'Coupon deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete coupon.' });
    }
});
