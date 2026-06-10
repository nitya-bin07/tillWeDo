const express = require('express');
const Joi = require('joi');

const c = require('../controllers/marriageController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const upload = require('../middleware/upload');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.use(auth);

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({ 'string.pattern.base': 'Invalid id' });

const submitProofSchema = Joi.object({
  marriageDate: Joi.date().iso().less('now').required().messages({ 'date.less': 'Marriage date must be in the past' }),
  registrationNumber: Joi.string().trim().max(60).allow('', null),
});
const idParamSchema = Joi.object({ id: objectId.required() });
const rejectSchema = Joi.object({ rejectionReason: Joi.string().trim().min(3).max(500).required() });

// multipart: one "certificate" + up to five "photos"
const proofUpload = upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'photos', maxCount: 5 },
]);

router.post('/submit-proof', proofUpload, validateRequest(submitProofSchema), c.submitProof);
router.get('/status', c.getStatus);

// admin
router.get('/all', adminOnly, c.getAll);
router.put('/:id/approve', adminOnly, validateRequest(idParamSchema, 'params'), c.approve);
router.put('/:id/reject', adminOnly, validateRequest(idParamSchema, 'params'), validateRequest(rejectSchema), c.reject);

module.exports = router;