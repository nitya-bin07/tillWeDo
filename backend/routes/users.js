const express = require('express');
const Joi = require('joi');

const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.use(auth); // every user route requires authentication

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  profilePhoto: Joi.string().uri(),
  dob: Joi.date().iso().less('now').messages({ 'date.less': 'Date of birth must be in the past' }),
  location: Joi.string().trim().max(120).allow('', null),
})
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });

router.get('/profile', userController.getProfile);
router.put('/profile', validateRequest(updateProfileSchema), userController.updateProfile);
router.post('/upload-photo', upload.single('photo'), userController.uploadPhoto); // field name: "photo"
router.delete('/account', userController.deleteAccount);

module.exports = router;