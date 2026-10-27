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
try {
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
}
catch { }
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        cb(null, true);
    }
});
// Admin upload single image
exports.uploadRouter.post('/', auth_js_1.authenticateToken, auth_js_1.requireAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image file uploaded.' });
            return;
        }
        const ext = path_1.default.extname(req.file.originalname).toLowerCase() || '.png';
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `img-${uniqueSuffix}${ext}`;
        let fileUrl = '';
        // Attempt to write to disk if uploads directory is writable
        try {
            if (!fs_1.default.existsSync(uploadsDir)) {
                fs_1.default.mkdirSync(uploadsDir, { recursive: true });
            }
            const targetPath = path_1.default.join(uploadsDir, filename);
            fs_1.default.writeFileSync(targetPath, req.file.buffer);
            fileUrl = `/uploads/${filename}`;
        }
        catch (diskErr) {
            // In serverless / read-only filesystem, use base64 data URL so upload never fails
            fileUrl = `data:${req.file.mimetype || 'image/png'};base64,${req.file.buffer.toString('base64')}`;
        }
        res.json({
            url: fileUrl,
            filename,
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
        const uploaded = files.map(f => {
            const ext = path_1.default.extname(f.originalname).toLowerCase() || '.png';
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const filename = `img-${uniqueSuffix}${ext}`;
            let fileUrl = '';
            try {
                if (!fs_1.default.existsSync(uploadsDir)) {
                    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
                }
                const targetPath = path_1.default.join(uploadsDir, filename);
                fs_1.default.writeFileSync(targetPath, f.buffer);
                fileUrl = `/uploads/${filename}`;
            }
            catch {
                fileUrl = `data:${f.mimetype || 'image/png'};base64,${f.buffer.toString('base64')}`;
            }
            return {
                url: fileUrl,
                filename,
                size: f.size
            };
        });
        res.json({ files: uploaded });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Multiple upload failed.' });
    }
});
