const express = require('express');
const Joi = require('joi');

const c = require('../controllers/breakupController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.use(auth);

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid id' });
const confirmSchema = Joi.object({ coupleId: objectId.required() });

router.post('/initiate', c.initiate);
router.post('/cancel', c.cancel);
router.get('/status', c.status);

// Admin-only force-confirm / after-timeout (§8.6). Partners never call this.
router.post('/confirm', adminOnly, validateRequest(confirmSchema), c.confirm);

module.exports = router;