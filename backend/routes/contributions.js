const express = require('express');
const Joi = require('joi');

const c = require('../controllers/contributionController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.use(auth);

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid id' });
const manualPaySchema = Joi.object({ contributionId: objectId }); // optional: target a cycle
const vaultIdParamSchema = Joi.object({ vaultId: objectId.required() });

router.get('/history', c.getHistory);
router.get('/upcoming', c.getUpcoming);
router.post('/manual-pay', validateRequest(manualPaySchema), c.manualPay);

// admin — declared after the literal GET routes
router.get('/:vaultId', adminOnly, validateRequest(vaultIdParamSchema, 'params'), c.getByVaultId);

module.exports = router;