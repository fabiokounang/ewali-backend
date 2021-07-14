const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { body } = require('express-validator');
const checkEmailFormat = require('../helper-function/check-email-format');
const checkPasswordHelper = require('../helper-function/check-password-helper');
const { 
  email_required, 
  password_required, 
  confirmation_password_required, 
  email_format, general, 
  password_min_max_length, 
  password_format, 
  password_match, 
  nomor_telepon_required, 
  nomor_telepon_telegram_required, 
  nomor_telepon_whatsapp_required, 
  nomor_telepon_emergency_required, 
  nomor_telepon_min_max,
  nomor_08,
  nomor_telepon_format,
  nama_lengkap_required,
  nama_panggilan_required,
  tanggal_lahir_date_format,
  tanggal_lahir_required,
  alamat_ktp_required,
  alamat_format,
  golongan_darah_required,
  kota_domisili_required,
  provinsi_domisili_required,
  pekerjaan_required,
  snk_required,
  snk_format,
  informasi_wali_required,
  informasi_wali_format,
  emoney_required,
  emoney_not_valid,
  nomor_id_format,
  status_form_required,
  status_form_invalid,
  note_required,
  nomor_vin_required,
  nomor_polisi_required,
  kota_required,
  golongan_darah_enum
} = require('../util/error-message');
const regexList = require('../util/regex-list');
const checkAuth = require('../middleware/check-auth');
const checkAuthAdminChapter = require('../middleware/check-auth-admin-chapter');
const checkOnlyAdmin = require('../middleware/check-only-admin');
const checkOnlyUser = require('../middleware/check-only-user');

router.post('/register/v1_0', [
  body('email')
    .trim()
    .notEmpty().withMessage(email_required)
    .isString().withMessage(email_format)
    .custom((value, {req}) => {
      try {
        if (!value) throw(email_required);
        const isValid = checkEmailFormat(value);
        if (!isValid) throw(email_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('password')
    .trim()
    .notEmpty().withMessage(password_required)
    .isLength({ min: 6, max: 30 }).withMessage(password_min_max_length)
    .custom((value, {req}) => {
      try {
        if (!value) throw(password_required);
        const isValid = checkPasswordHelper(value);
        if (!isValid.status) throw(password_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('confirmation_password')
    .trim()
    .notEmpty().withMessage(confirmation_password_required)
    .custom((value, {req}) => {
      try {
        if (!value) throw(confirmation_password_required);
        if (value != req.body.password) throw(password_match)
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    })
], userController.registerUser);

router.post('/login_admin/v1_0', [
  body('email')
    .trim()
    .notEmpty().withMessage(email_required)
    .isString().withMessage(email_format)
    .custom((value, {req}) => {
      try {
        if (!value) throw(email_required);
        const isValid = checkEmailFormat(value);
        if (!isValid) throw(email_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('password')
    .trim()
    .notEmpty().withMessage(password_required)
    .isLength({ min: 6, max: 30 }).withMessage(password_min_max_length)
    .custom((value, {req}) => {
      try {
        if (!value) throw(password_required);
        const isValid = checkPasswordHelper(value);
        if (!isValid.status) throw(password_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
], userController.loginAdmin);

router.post('/login_user/v1_0', [
  body('email')
    .trim()
    .notEmpty().withMessage(email_required)
    .isString().withMessage(email_format)
    .custom((value, {req}) => {
      try {
        if (!value) throw(email_required);
        const isValid = checkEmailFormat(value);
        if (!isValid) throw(email_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('password')
    .trim()
    .notEmpty().withMessage(password_required)
    .isLength({ min: 6, max: 30 }).withMessage(password_min_max_length)
    .custom((value, {req}) => {
      try {
        if (!value) throw(password_required);
        const isValid = checkPasswordHelper(value);
        if (!isValid.status) throw(password_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
], userController.loginUser);

router.post('/submit_form/v1_0', checkAuth, checkOnlyUser, [
  body('kota_id')
    .trim()
    .notEmpty().withMessage(kota_required),
  body('nomor_id')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value, {req}) => {
      try {
        if (value && !regexList.numeric.test(value)) throw(nomor_id_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('nama_lengkap')
    .trim()
    .notEmpty().withMessage(nama_lengkap_required),
  body('nama_panggilan')
    .trim()
    .notEmpty().withMessage(nama_panggilan_required),
  body('tanggal_lahir')
    .trim()
    .notEmpty().withMessage(tanggal_lahir_required)
    .isDate().withMessage(tanggal_lahir_date_format),
  body('alamat_ktp')
    .trim()
    .notEmpty().withMessage(alamat_ktp_required)
    .isString().withMessage(alamat_format),
  body('alamat_domisili')
    .optional({ checkFalsy: true })
    .isString().withMessage(alamat_format)
    .trim(),
  body('kota_domisili')
    .trim()
    .notEmpty().withMessage(kota_domisili_required),
  body('provinsi_domisili')
    .trim()
    .notEmpty().withMessage(provinsi_domisili_required),
  body('pekerjaan')
    .notEmpty().withMessage(pekerjaan_required),
  body('nomor_telepon_current')
    .trim()
    .notEmpty().withMessage(nomor_telepon_required)
    .isNumeric().withMessage(nomor_telepon_format)
    .isMobilePhone('id-ID').withMessage(nomor_08)
    .isLength({ min: 10, max: 14}).withMessage(nomor_telepon_min_max),
  body('nomor_telepon_telegram')
    .trim()
    .notEmpty().withMessage(nomor_telepon_telegram_required)
    .isNumeric().withMessage(nomor_telepon_format)
    .isMobilePhone('id-ID').withMessage(nomor_08)
    .isLength({ min: 10, max: 14}).withMessage(nomor_telepon_min_max),
  body('nomor_telepon_whatsapp')
    .trim()
    .notEmpty().withMessage(nomor_telepon_whatsapp_required)
    .isNumeric().withMessage(nomor_telepon_format)
    .isMobilePhone('id-ID').withMessage(nomor_08)
    .isLength({ min: 10, max: 14}).withMessage(nomor_telepon_min_max),
  body('nomor_telepon_emergency')
    .trim()
    .notEmpty().withMessage(nomor_telepon_emergency_required)
    .isNumeric().withMessage(nomor_telepon_format)
    .isMobilePhone('id-ID').withMessage(nomor_08)
    .isLength({ min: 10, max: 14}).withMessage(nomor_telepon_min_max),
  body('golongan_darah')
    .trim()
    .notEmpty().withMessage(golongan_darah_required)
    .toUpperCase()
    .custom((value, {req}) => {
      try {
        if (!value) throw(golongan_darah_required);
        if (!['A', 'B', 'AB', 'O'].includes(value)) throw(golongan_darah_enum);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('nomor_vin')
    .trim()
    .notEmpty().withMessage(nomor_vin_required),
  body('nomor_polisi')    
    .trim()
    .notEmpty().withMessage(nomor_polisi_required)
    .toUpperCase(),
  body('informasi_wali') 
  .notEmpty().withMessage(informasi_wali_required)
  .isArray().withMessage(informasi_wali_format)
  .custom((value, {req}) => {
    try {
      if (!value) throw(informasi_wali_required);
      if (!Array.isArray(value)) throw(informasi_wali_format);
      if (value.length <= 0) throw(informasi_wali_required);
      const enums = ['facebook', 'instagram', 'youtube', 'browsing via search engine', 'media cetak', 'teman / kenalan', 'dealer', 'lain-lain'];
      const filteredData = value.filter(val => !enums.includes(val));
      if (filteredData.length > 0) throw(informasi_wali_format);
      return true;
    } catch (error) {
      throw(typeof(error) === 'string' ? error : general);
    }
  }),
  body('snk')
    .notEmpty().withMessage(snk_required)
    .isBoolean().withMessage(snk_format)
    .custom((value, {req}) => {
      try {
        if (!value) throw(snk_required);
        if (value != true) throw(snk_must_accepted);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('emoney')
    .trim()
    .notEmpty().withMessage(emoney_required)
    .custom((value, {req}) => {
      try {
        if (!value) throw(emoney_required);
        if (!['flash', 'e-toll', 'breeze'].includes(value)) throw(emoney_not_valid);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    })
], userController.submitForm);

router.post('/resend_email/v1_0', checkAuth, [
  body('email')
    .trim()
    .notEmpty().withMessage(email_required)
    .isString().withMessage(email_format)
    .custom((value, {req}) => {
      try {
        if (!value) throw(email_required);
        const isValid = checkEmailFormat(value);
        if (!isValid) throw(email_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    })
], userController.resendEmail);

router.get('/get_login/v1_0', checkAuth, userController.getLogin);

// fitur yang hanya bisa diakses oleh admin dan ketua chapter
router.get('/v1_0', checkAuth, checkAuthAdminChapter, userController.getAllUserNotPending);

// fitur yang hanya bisa diakses oleh admin
router.get('/pending/v1_0', checkAuth, checkOnlyAdmin, userController.getAllUserPending);

router.put('/role/v1_0/:id', checkAuth, checkOnlyAdmin, userController.upgradeDowngradeUser);
router.put('/review_form/v1_0/:id', checkAuth, checkOnlyAdmin, [
  body('status_form')
    .notEmpty().withMessage(status_form_required)
    .custom((value, {req}) => {
      try {
        if (!value) throw(status_form_required);
        if (![1, 2].includes(value)) throw(status_form_invalid);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('note')
    .trim()
    .custom((value, {req}) => {
      try {
        if (!value && req.body.status_form == 2) throw(note_required);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    })
], userController.reviewApproveRejectForm);
router.put('/status/v1_0/:id', checkAuth, checkOnlyAdmin, userController.updateStatusUser);
router.put('/activate/v1_0/:id', checkAuth, checkOnlyAdmin, userController.activateUser);
router.put('/v1_0/:id', checkAuth, checkOnlyAdmin, [
  body('nomor_id')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value, {req}) => {
      try {
        if (value && !regexList.numeric.test(value)) throw(nomor_id_format);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('nama_lengkap')
    .trim()
    .notEmpty().withMessage(nama_lengkap_required),
  body('nama_panggilan')
    .trim()
    .notEmpty().withMessage(nama_panggilan_required),
  body('tanggal_lahir')
    .trim()
    .notEmpty().withMessage(tanggal_lahir_required),
    // .isDate().withMessage(tanggal_lahir_date_format),
  body('alamat_ktp')
    .trim()
    .notEmpty().withMessage(alamat_ktp_required)
    .isString().withMessage(alamat_format),
  body('alamat_domisili')
    .optional({ checkFalsy: true })
    .isString().withMessage(alamat_format)
    .trim(),
  body('kota_domisili')
    .trim()
    .notEmpty().withMessage(kota_domisili_required),
  body('provinsi_domisili')
    .trim()
    .notEmpty().withMessage(provinsi_domisili_required),
  body('pekerjaan')
    .notEmpty().withMessage(pekerjaan_required),
  body('nomor_telepon_current')
    .trim()
    .notEmpty().withMessage(nomor_telepon_required)
    .isNumeric().withMessage(nomor_telepon_format)
    .isMobilePhone('id-ID').withMessage(nomor_08)
    .isLength({ min: 10, max: 14}).withMessage(nomor_telepon_min_max),
  body('nomor_telepon_telegram')
    .trim()
    .notEmpty().withMessage(nomor_telepon_telegram_required)
    .isNumeric().withMessage(nomor_telepon_format)
    .isMobilePhone('id-ID').withMessage(nomor_08)
    .isLength({ min: 10, max: 14}).withMessage(nomor_telepon_min_max),
  body('nomor_telepon_whatsapp')
    .trim()
    .notEmpty().withMessage(nomor_telepon_whatsapp_required)
    .isNumeric().withMessage(nomor_telepon_format)
    .isMobilePhone('id-ID').withMessage(nomor_08)
    .isLength({ min: 10, max: 14}).withMessage(nomor_telepon_min_max),
  body('nomor_telepon_emergency')
    .trim()
    .notEmpty().withMessage(nomor_telepon_emergency_required)
    .isNumeric().withMessage(nomor_telepon_format)
    .isMobilePhone('id-ID').withMessage(nomor_08)
    .isLength({ min: 10, max: 14}).withMessage(nomor_telepon_min_max),
  body('golongan_darah')
    .trim()
    .notEmpty().withMessage(golongan_darah_required)
    .toUpperCase()
    .custom((value, {req}) => {
      try {
        if (!value) throw(golongan_darah_required);
        if (!['A', 'B', 'AB', 'O'].includes(value)) throw(golongan_darah_enum);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    }),
  body('nomor_vin')
    .trim()
    .notEmpty().withMessage(nomor_vin_required),
  body('nomor_polisi')    
    .trim()
    .notEmpty().withMessage(nomor_polisi_required)
    .toUpperCase(),
  body('informasi_wali') 
  .notEmpty().withMessage(informasi_wali_required)
  .isArray().withMessage(informasi_wali_format)
  .custom((value, {req}) => {
    try {
      if (!value) throw(informasi_wali_required);
      if (!Array.isArray(value)) throw(informasi_wali_format);
      if (value.length <= 0) throw(informasi_wali_required);
      const enums = ['facebook', 'instagram', 'youtube', 'browsing via search engine', 'media cetak', 'teman / kenalan', 'dealer', 'lain-lain'];
      const filteredData = value.filter(val => !enums.includes(val));
      if (filteredData.length > 0) throw(informasi_wali_format);
      return true;
    } catch (error) {
      throw(typeof(error) === 'string' ? error : general);
    }
  }),
  body('emoney')
    .trim()
    .notEmpty().withMessage(emoney_required)
    .custom((value, {req}) => {
      try {
        if (!value) throw(emoney_required);
        if (!['flash', 'e-toll', 'breeze'].includes(value)) throw(emoney_not_valid);
        return true;
      } catch (error) {
        throw(typeof(error) === 'string' ? error : general);
      }
    })
], userController.updateDataUser);

router.delete('/:id', checkOnlyAdmin, userController.deleteUser);

module.exports = router;