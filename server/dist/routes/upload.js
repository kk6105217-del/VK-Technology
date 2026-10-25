"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_js_1 = require("../middleware/auth.js");
exports.uploadRouter = (0, express_1.Router)();
const uploadsDir = path_1.default.resolve(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `img-${uniqueSuffix}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|svg/;
        const ext = path_1.default.extname(file.originalname).toLowerCase().replace('.', '');
        const mime = file.mimetype;
        if (allowed.test(ext) && (mime.startsWith('image/') || mime === 'image/svg+xml')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files (JPG, PNG, WebP, SVG) up to 5MB are permitted.'));
        }
    }
});
// Admin upload single image
exports.uploadRouter.post('/', auth_js_1.authenticateToken, auth_js_1.requireAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image file uploaded.' });
            return;
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({
            url: fileUrl,
            filename: req.file.filename,
            size: req.file.size
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'File upload failed.' });
    }
});
// Admin upload multiple images
exports.uploadRouter.post('/multiple', auth_js_1.authenticateToken, auth_js_1.requireAdmin, upload.array('images', 8), (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No images uploaded.' });
            return;
        }
        const uploaded = files.map(f => ({
            url: `/uploads/${f.filename}`,
            filename: f.filename,
            size: f.size
        }));
        res.json({ files: uploaded });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Multiple upload failed.' });
    }
});
