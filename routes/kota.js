const express = require('express');
const router = express.Router();
const kotaController = require('../controllers/kota');
const { body } = require('express-validator');
const { 
  kota_required, kota_format
} = require('../util/error-message');
const checkAuth = require('../middleware/check-auth');
const checkAuthAdminChapter = require('../middleware/check-auth-admin-chapter');
const checkOnlyAdmin = require('../middleware/check-only-admin');

router.post('/v1_0', checkAuth, checkOnlyAdmin, [
  body('kota_nama')
    .trim()
    .notEmpty().withMessage(kota_required)
    .isString().withMessage(kota_format)
    .toLowerCase()
], kotaController.createKotaChapter);

router.get('/v1_0', checkAuth, checkAuthAdminChapter, kotaController.getAllKotaChapter);
router.put('/v1_0/:id', [
  body('kota_nama')
    .trim()
    .notEmpty().withMessage(kota_required)
    .isString().withMessage(kota_format)
    .toLowerCase()
], checkOnlyAdmin, kotaController.updateKotaChapter);

router.delete('/v1_0/:id', checkOnlyAdmin, kotaController.deleteKotaChapter);

module.exports = router;