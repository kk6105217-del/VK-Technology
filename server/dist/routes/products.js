"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = require("express");
const database_js_1 = require("../database.js");
const auth_js_1 = require("../middleware/auth.js");
exports.productsRouter = (0, express_1.Router)();
// Public: Get all products with search, filters, pagination, and sorting
exports.productsRouter.get('/', (req, res) => {
    try {
        const { q, category, brand, min_price, max_price, in_stock, rating, featured, sort, page = 1, limit = 24 } = req.query;
        let conditions = ['p.is_active = 1'];
        let params = [];
        // Search query
        if (q && typeof q === 'string' && q.trim()) {
            const searchPattern = `%${q.trim()}%`;
            conditions.push(`(
        p.name LIKE ? OR 
        p.sku LIKE ? OR 
        p.short_description LIKE ? OR 
        p.description LIKE ? OR 
        p.brand LIKE ? OR
        p.specifications_json LIKE ? OR
        c.name LIKE ?
      )`);
            params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
        }
        // Category filter
        if (category && typeof category === 'string') {
            conditions.push('(c.slug = ? OR c.id = ?)');
            params.push(category, category);
        }
        // Brand filter
        if (brand && typeof brand === 'string') {
            conditions.push('p.brand = ?');
            params.push(brand);
        }
        // Price range
        if (min_price) {
            conditions.push('COALESCE(p.discounted_price, p.regular_price) >= ?');
            params.push(parseFloat(min_price));
        }
        if (max_price) {
            conditions.push('COALESCE(p.discounted_price, p.regular_price) <= ?');
            params.push(parseFloat(max_price));
        }
        // In stock
        if (in_stock === 'true' || in_stock === '1') {
            conditions.push('p.stock_quantity > 0');
        }
        // Rating
        if (rating) {
            conditions.push('p.rating_avg >= ?');
            params.push(parseFloat(rating));
        }
        // Featured
        if (featured === 'true' || featured === '1') {
            conditions.push('p.is_featured = 1');
        }
        // Sorting
        let orderBy = 'p.id DESC';
        switch (sort) {
            case 'price-asc':
                orderBy = 'COALESCE(p.discounted_price, p.regular_price) ASC';
                break;
            case 'price-desc':
                orderBy = 'COALESCE(p.discounted_price, p.regular_price) DESC';
                break;
            case 'newest':
                orderBy = 'p.created_at DESC';
                break;
            case 'bestselling':
                orderBy = 'p.rating_count DESC, p.view_count DESC';
                break;
            case 'rating':
                orderBy = 'p.rating_avg DESC';
                break;
            case 'relevance':
            default:
                orderBy = 'p.is_featured DESC, p.id DESC';
                break;
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Count total products
        const countSql = `
      SELECT COUNT(*) as total 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
        const countRow = database_js_1.db.prepare(countSql).get(...params);
        const total = countRow.total;
        // Fetch paginated products with primary image
        const offset = (Number(page) - 1) * Number(limit);
        const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        (
          SELECT image_url FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_primary DESC, pi.sort_order ASC 
          LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
        const products = database_js_1.db.prepare(sql).all(...params, Number(limit), offset);
        // Format JSON fields
        const formattedProducts = products.map((prod) => ({
            ...prod,
            specifications: prod.specifications_json ? JSON.parse(prod.specifications_json) : {},
            features: prod.features_json ? JSON.parse(prod.features_json) : [],
            package_contents: prod.package_contents_json ? JSON.parse(prod.package_contents_json) : [],
        }));
        res.json({
            products: formattedProducts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Products fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
});
// Admin: Get all products (including inactive) with inventory status
exports.productsRouter.get('/admin/all', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { search, category, status } = req.query;
        let conditions = ['1=1'];
        let params = [];
        if (search && typeof search === 'string') {
            conditions.push('(p.name LIKE ? OR p.sku LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            conditions.push('p.category_id = ?');
            params.push(category);
        }
        if (status === 'active')
            conditions.push('p.is_active = 1');
        if (status === 'inactive')
            conditions.push('p.is_active = 0');
        if (status === 'low_stock')
            conditions.push('p.stock_quantity <= 5 AND p.stock_quantity > 0');
        if (status === 'out_of_stock')
            conditions.push('p.stock_quantity = 0');
        const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        (
          SELECT image_url FROM product_images pi 
          WHERE pi.product_id = p.id 
          ORDER BY pi.is_primary DESC, pi.sort_order ASC 
          LIMIT 1
        ) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.id DESC
    `;
        const products = database_js_1.db.prepare(sql).all(...params);
        res.json({ products });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admin products.' });
    }
});
// Public: Get single product by slug or id
exports.productsRouter.get('/:slug', (req, res) => {
    try {
        const isId = /^\d+$/.test(req.params.slug);
        const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${isId ? 'p.id = ?' : 'p.slug = ?'}
    `;
        const product = database_js_1.db.prepare(sql).get(req.params.slug);
        if (!product) {
            res.status(404).json({ error: 'Product not found.' });
            return;
        }
        // Increment view count
        database_js_1.db.prepare('UPDATE products SET view_count = view_count + 1 WHERE id = ?').run(product.id);
        // Fetch images
        const images = database_js_1.db.prepare(`
      SELECT id, image_url, alt_text, is_primary, sort_order 
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY is_primary DESC, sort_order ASC
    `).all(product.id);
        // Fetch approved reviews
        const reviews = database_js_1.db.prepare(`
      SELECT id, customer_name, rating, title, comment, is_verified_purchase, created_at
      FROM reviews
      WHERE product_id = ? AND status = 'approved'
      ORDER BY id DESC
    `).all(product.id);
        // Fetch related products from same category
        const relatedProducts = database_js_1.db.prepare(`
      SELECT 
        p.id, p.name, p.slug, p.regular_price, p.discounted_price, p.stock_quantity, p.rating_avg, p.rating_count,
        (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC LIMIT 1) as primary_image
      FROM products p
      WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
      LIMIT 6
    `).all(product.category_id, product.id);
        res.json({
            product: {
                ...product,
                specifications: product.specifications_json ? JSON.parse(product.specifications_json) : {},
                features: product.features_json ? JSON.parse(product.features_json) : [],
                package_contents: product.package_contents_json ? JSON.parse(product.package_contents_json) : [],
                images,
                reviews,
                relatedProducts
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch product details.' });
    }
});
// Admin: Create product
exports.productsRouter.post('/', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { name, slug, sku, category_id, subcategory, short_description, description, regular_price, discounted_price, stock_quantity, brand, specifications, features, compatibility, package_contents, shipping_weight_grams, estimated_dispatch_days, warranty_info, is_featured, is_active, images = [] } = req.body;
        if (!name || !sku || !category_id || regular_price === undefined) {
            res.status(400).json({ error: 'Please provide product name, SKU, category, and regular price.' });
            return;
        }
        const cleanSlug = (slug || name).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        const result = database_js_1.db.prepare(`
      INSERT INTO products (
        name, slug, sku, category_id, subcategory, short_description, description,
        regular_price, discounted_price, stock_quantity, brand, specifications_json,
        features_json, compatibility, package_contents_json, shipping_weight_grams,
        estimated_dispatch_days, warranty_info, is_featured, is_active
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `).run(name.trim(), cleanSlug, sku.trim().toUpperCase(), category_id, subcategory || null, short_description || null, description || name, Number(regular_price), discounted_price ? Number(discounted_price) : null, Number(stock_quantity || 0), brand || 'VK Technology', specifications ? JSON.stringify(specifications) : '{}', features ? JSON.stringify(features) : '[]', compatibility || null, package_contents ? JSON.stringify(package_contents) : '[]', Number(shipping_weight_grams || 250), Number(estimated_dispatch_days || 1), warranty_info || '6 Months Warranty', is_featured ? 1 : 0, is_active !== undefined ? (is_active ? 1 : 0) : 1);
        const productId = Number(result.lastInsertRowid);
        // Insert images
        if (Array.isArray(images) && images.length > 0) {
            const imgInsert = database_js_1.db.prepare(`
        INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
        VALUES (?, ?, ?, ?, ?)
      `);
            images.forEach((img, idx) => {
                const url = typeof img === 'string' ? img : img.url;
                if (url) {
                    imgInsert.run(productId, url, name, idx, idx === 0 ? 1 : 0);
                }
            });
        }
        res.status(201).json({
            message: 'Product created successfully.',
            productId
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: error.message || 'Failed to create product.' });
    }
});
// Admin: Update product
exports.productsRouter.put('/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const productId = req.params.id;
        const { name, slug, sku, category_id, subcategory, short_description, description, regular_price, discounted_price, stock_quantity, brand, specifications, features, compatibility, package_contents, shipping_weight_grams, estimated_dispatch_days, warranty_info, is_featured, is_active, images } = req.body;
        database_js_1.db.prepare(`
      UPDATE products SET
        name = ?, slug = ?, sku = ?, category_id = ?, subcategory = ?, short_description = ?, description = ?,
        regular_price = ?, discounted_price = ?, stock_quantity = ?, brand = ?, specifications_json = ?,
        features_json = ?, compatibility = ?, package_contents_json = ?, shipping_weight_grams = ?,
        estimated_dispatch_days = ?, warranty_info = ?, is_featured = ?, is_active = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, slug, sku.toUpperCase(), category_id, subcategory || null, short_description || null, description, Number(regular_price), discounted_price ? Number(discounted_price) : null, Number(stock_quantity), brand, typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {}), typeof features === 'string' ? features : JSON.stringify(features || []), compatibility, typeof package_contents === 'string' ? package_contents : JSON.stringify(package_contents || []), shipping_weight_grams, estimated_dispatch_days, warranty_info, is_featured ? 1 : 0, is_active ? 1 : 0, productId);
        // Update images if provided
        if (Array.isArray(images)) {
            database_js_1.db.prepare('DELETE FROM product_images WHERE product_id = ?').run(productId);
            const imgInsert = database_js_1.db.prepare(`
        INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
        VALUES (?, ?, ?, ?, ?)
      `);
            images.forEach((img, idx) => {
                const url = typeof img === 'string' ? img : img.image_url || img.url;
                if (url) {
                    imgInsert.run(productId, url, name, idx, idx === 0 ? 1 : 0);
                }
            });
        }
        res.json({ message: 'Product updated successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update product.' });
    }
});
// Admin: Quick update stock
exports.productsRouter.patch('/:id/stock', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { stock_quantity } = req.body;
        database_js_1.db.prepare('UPDATE products SET stock_quantity = ?, updated_at = datetime(\'now\') WHERE id = ?').run(stock_quantity, req.params.id);
        res.json({ message: 'Stock updated.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update stock.' });
    }
});
// Admin: Quick toggle publish / unpublish
exports.productsRouter.patch('/:id/status', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        const { is_active } = req.body;
        database_js_1.db.prepare('UPDATE products SET is_active = ?, updated_at = datetime(\'now\') WHERE id = ?').run(is_active ? 1 : 0, req.params.id);
        res.json({ message: `Product ${is_active ? 'published' : 'unpublished'}.` });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update status.' });
    }
});
// Admin: Delete product
exports.productsRouter.delete('/:id', auth_js_1.authenticateToken, auth_js_1.requireAdmin, (req, res) => {
    try {
        database_js_1.db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
        res.json({ message: 'Product deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product.' });
    }
});
