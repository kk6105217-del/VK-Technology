import { Router, Response } from 'express';
import { db } from '../database.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

export const categoriesRouter = Router();

// Public: Get all active categories with product counts
categoriesRouter.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS product_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();

    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// Admin: Get all categories including inactive
categoriesRouter.get('/all', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
      FROM categories c
      ORDER BY c.sort_order ASC, c.name ASC
    `).all();

    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// Public: Get single category by slug
categoriesRouter.get('/:slug', (req, res) => {
  try {
    const category = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) AS product_count
      FROM categories c
      WHERE c.slug = ?
    `).get(req.params.slug) as any;

    if (!category) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }

    res.json({ category });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch category details.' });
  }
});

// Admin: Add new category
categoriesRouter.post('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, icon, image_url, sort_order, is_active } = req.body;

    if (!name || !slug) {
      res.status(400).json({ error: 'Category name and slug are required.' });
      return;
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, icon, image_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, cleanSlug, description || null, icon || 'Cpu', image_url || null, sort_order || 0, is_active ?? 1);

    res.status(201).json({
      message: 'Category created successfully.',
      id: Number(result.lastInsertRowid)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create category.' });
  }
});

// Admin: Update category
categoriesRouter.put('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, description, icon, image_url, sort_order, is_active } = req.body;
    const catId = req.params.id;

    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(catId);
    if (!existing) {
      db.prepare(`
        INSERT INTO categories (id, name, slug, description, icon, image_url, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(catId, name, slug, description || null, icon || 'Cpu', image_url || null, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1);
    } else {
      db.prepare(`
        UPDATE categories SET
          name = ?, slug = ?, description = ?, icon = ?, image_url = ?, sort_order = ?, is_active = ?
        WHERE id = ?
      `).run(name, slug, description || null, icon || 'Cpu', image_url || null, sort_order || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, catId);
    }

    res.json({ message: 'Category updated successfully.' });
  } catch (error: any) {
    console.error('Update category error:', error);
    res.status(500).json({ error: error.message || 'Failed to update category.' });
  }
});

// Admin: Delete category
categoriesRouter.delete('/:id', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const catId = req.params.id;

    // Safely reassign any products in this category to an alternative category so FOREIGN KEY constraints never fail
    try {
      const fallbackCat = db.prepare('SELECT id FROM categories WHERE id != ? ORDER BY id ASC LIMIT 1').get(catId) as any;
      const fallbackId = fallbackCat?.id || 1;
      db.prepare('UPDATE products SET category_id = ? WHERE category_id = ?').run(fallbackId, catId);
    } catch (reassignErr) {
      console.warn('Reassigning products during category delete:', reassignErr);
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(catId);
    res.json({ message: 'Category deleted successfully.' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete category.' });
  }
});
