const express = require('express');
const Joi = require('joi');

const vaultController = require('../controllers/vaultController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.use(auth);

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid id' });

const setupSchema = Joi.object({
  vaultName: Joi.string().trim().max(60),
  monthlyAmountA: Joi.number().positive().max(10000000).required(),
  monthlyAmountB: Joi.number().positive().max(10000000).required(),
  contributionInterval: Joi.string().valid('monthly', 'custom').default('monthly'),
  contributionDay: Joi.number().integer().min(1).max(28).when('contributionInterval', { is: 'monthly', then: Joi.required() }),
  customIntervalDays: Joi.number().integer().min(1).max(365).when('contributionInterval', { is: 'custom', then: Joi.required() }),
  startDate: Joi.date().iso().required(),
  // interestRate intentionally NOT accepted — platform-set
});
const settingsSchema = Joi.object({ vaultName: Joi.string().trim().min(1).max(60).required() });
const listQuerySchema = Joi.object({
  status: Joi.string().valid('setup', 'active', 'paused', 'forfeited', 'paid_out'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
const idParamSchema = Joi.object({ id: objectId.required() });

router.post('/setup', validateRequest(setupSchema), vaultController.setupVault);
router.get('/me', vaultController.getMyVault);
router.put('/settings', validateRequest(settingsSchema), vaultController.updateSettings);
router.get('/balance', vaultController.getBalance);
router.get('/all', adminOnly, validateRequest(listQuerySchema, 'query'), vaultController.getAllVaults);
router.get('/:id', adminOnly, validateRequest(idParamSchema, 'params'), vaultController.getVaultById);

module.exports = router;