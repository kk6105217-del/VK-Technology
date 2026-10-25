"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRouter = void 0;
const express_1 = require("express");
const config_js_1 = require("../config.js");
const database_js_1 = require("../database.js");
exports.contactRouter = (0, express_1.Router)();
exports.contactRouter.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) {
            res.status(400).json({ error: 'Please provide name, email, and message.' });
            return;
        }
        // Log contact inquiry in notification_logs
        try {
            database_js_1.db.prepare(`
        INSERT INTO notification_logs (order_id, channel, recipient, subject_or_template, status, error_message)
        VALUES (NULL, 'email', ?, ?, 'logged', ?)
      `).run(config_js_1.config.adminEmail, `Contact Query: ${subject || 'New Message'}`, `From: ${name} (${email}, ${phone || 'N/A'})\n\nMessage: ${message}`);
        }
        catch (e) {
            console.error('Failed to log contact message:', e);
        }
        res.json({
            message: 'Thank you for reaching out to VK Technology! Your message has been received and our team will get back to you shortly.'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit contact message.' });
    }
});
