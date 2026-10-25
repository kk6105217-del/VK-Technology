"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRouter = void 0;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const auth_js_1 = require("../middleware/auth.js");
exports.categoriesRouter = (0, express_1.Router)();
// Public: Get all active categories with product counts
exports.categoriesRouter.get('/', (req, res) => {
    try {
        const categories = database_js_1.db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS product_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();
        res.json({ categories });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});
// Admin: Get all categories including inactive
exports.categoriesRouter.get('/all', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const categories = database_js_1.db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
      FROM categories c
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();
        res.json({ categories });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories.' });
    }
});
// Public: Get single category by slug
exports.categoriesRouter.get('/:slug', (req, res) => {
    try {
        const category = database_js_1.db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS product_count
      FROM categories c
      WHERE c.slug = ?
    `).get(req.params.slug);
        if (!category) {
            res.status(404).json({ error: 'Category not found.' });
            return;
        }
        res.json({ category });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch category details.' });
    }
});
// Admin: Add new category
exports.categoriesRouter.post('/', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { name, slug, description, icon, image_url, sort_order, is_active } = req.body;
        if (!name || !slug) {
            res.status(400).json({ error: 'Category name and slug are required.' });
            return;
        }
        const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        const result = database_js_1.db.prepare(`
      INSERT INTO categories (name, slug, description, icon, image_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, cleanSlug, description || null, icon || 'Cpu', image_url || null, sort_order || 0, is_active ?? 1);
        res.status(201).json({
            message: 'Category created successfully.',
            id: Number(result.lastInsertRowid)
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create category.' });
    }
});
// Admin: Update category
exports.categoriesRouter.put('/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { name, slug, description, icon, image_url, sort_order, is_active } = req.body;
        const catId = req.params.id;
        database_js_1.db.prepare(`
      UPDATE categories SET
        name = ?, slug = ?, description = ?, icon = ?, image_url = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `).run(name, slug, description, icon, image_url, sort_order, is_active, catId);
        res.json({ message: 'Category updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update category.' });
    }
});
// Admin: Delete category
exports.categoriesRouter.delete('/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const catId = req.params.id;
        // Check if category has products
        const prodCount = database_js_1.db.prepare('SELECT COUNT(*) as count FROM products WHERE category_id = ?').get(catId);
        if (prodCount.count > 0) {
            res.status(400).json({ error: `Cannot delete category. It currently contains ${prodCount.count} products. Reassign or delete products first.` });
            return;
        }
        database_js_1.db.prepare('DELETE FROM categories WHERE id = ?').run(catId);
        res.json({ message: 'Category deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete category.' });
    }
});
