const express = require('express');
const Joi = require('joi');

const c = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Every admin route requires an authenticated admin.
router.use(auth, adminOnly);

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid id' });
const vaultIdParamSchema = Joi.object({ vaultId: objectId.required() });

router.get('/dashboard', c.getDashboard);
router.get('/users', c.getUsers);
router.get('/vaults', c.getVaults);
router.get('/forfeiture-log', c.getForfeitureLog);
router.post('/payout/:vaultId', validateRequest(vaultIdParamSchema, 'params'), c.triggerPayout);
router.get('/logs', c.getLogs);

module.exports = router;