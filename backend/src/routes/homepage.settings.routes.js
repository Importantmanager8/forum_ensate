import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { adminOnly } from '../middlewares/validation.middleware.js';
import {
    getHomepageSettings,
    updateHomepageSettings,
    resetHomepageSettings
} from '../controllers/homepage.settings.controller.js';

const router = express.Router();

// Get homepage settings (public access)
router.get('/', getHomepageSettings);

// Update homepage settings (admin only)
router.post('/', authenticate, adminOnly, updateHomepageSettings);

// Reset homepage settings to default (admin only)
router.delete('/', authenticate, adminOnly, resetHomepageSettings);

export default router;
