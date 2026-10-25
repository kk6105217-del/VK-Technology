"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannersRouter = void 0;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const auth_js_1 = require("../middleware/auth.js");
exports.bannersRouter = (0, express_1.Router)();
// Public: Get active banners
exports.bannersRouter.get('/', (req, res) => {
    try {
        const banners = database_js_1.db.prepare(`
      SELECT * FROM banners 
      WHERE is_active = 1 
      ORDER BY display_order ASC, id ASC
    `).all();
        res.json({ banners });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch banners.' });
    }
});
// Admin: Get all banners
exports.bannersRouter.get('/admin/all', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const banners = database_js_1.db.prepare('SELECT * FROM banners ORDER BY display_order ASC, id ASC').all();
        res.json({ banners });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch banners.' });
    }
});
// Admin: Create Banner
exports.bannersRouter.post('/admin', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { title, subtitle, image_url, link_url, button_text, display_order, is_active } = req.body;
        if (!title || !image_url) {
            res.status(400).json({ error: 'Title and image URL are required.' });
            return;
        }
        const result = database_js_1.db.prepare(`
      INSERT INTO banners (title, subtitle, image_url, link_url, button_text, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, subtitle || null, image_url, link_url || '/products', button_text || 'Shop Now', display_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1);
        res.status(201).json({ message: 'Banner created.', id: Number(result.lastInsertRowid) });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create banner.' });
    }
});
// Admin: Update Banner
exports.bannersRouter.put('/admin/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { title, subtitle, image_url, link_url, button_text, display_order, is_active } = req.body;
        database_js_1.db.prepare(`
      UPDATE banners SET
        title = ?, subtitle = ?, image_url = ?, link_url = ?, button_text = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `).run(title, subtitle, image_url, link_url, button_text, display_order, is_active ? 1 : 0, req.params.id);
        res.json({ message: 'Banner updated.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update banner.' });
    }
});
// Admin: Delete Banner
exports.bannersRouter.delete('/admin/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        database_js_1.db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
        res.json({ message: 'Banner deleted.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete banner.' });
    }
});
