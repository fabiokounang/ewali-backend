const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { body } = require('express-validator');
const checkEmailFormat = require('../helper-function/check-email-format');
const checkPasswordHelper = require('../helper-function/check-password-helper');
const { email_required, password_required, confirmation_password_required, email_format, general, password_min_max_length, password_format, password_match } = require('../util/error-message');

router.post('/register', [
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

router.post('/login', userController.loginUser);
router.get('/', userController.getAllUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;