const express = require('express');
const Joi = require('joi');

const coupleController = require('../controllers/coupleController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.use(auth);

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid id' });

const createInviteSchema = Joi.object({
  relationshipStartDate: Joi.date().iso().less('now').messages({ 'date.less': 'Relationship start date must be in the past' }),
});
const acceptInviteSchema = Joi.object({ inviteCode: Joi.string().trim().min(4).max(16).required() });
const idParamSchema = Joi.object({ id: objectId.required() });

router.post('/create-invite', validateRequest(createInviteSchema), coupleController.createInvite);
router.post('/accept-invite', validateRequest(acceptInviteSchema), coupleController.acceptInvite);
router.get('/me', coupleController.getMyCouple);
router.delete('/unlink', coupleController.unlink);

// AFTER /me so "GET /couples/me" isn't captured by this param route. Admin-only.
router.get('/:id', adminOnly, validateRequest(idParamSchema, 'params'), coupleController.getCoupleById);

module.exports = router;