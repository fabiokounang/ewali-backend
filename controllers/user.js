const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(12);

const User = require('../models/user');

const sendResponse = require('../helper-function/send-response');
const processError = require('../helper-function/process-error');
const processErrorForm = require('../helper-function/process-error-form');

const returnData = require('../util/return-data');
const { 
  validation, 
  message, 
  email_already_registered, 
  register_failed, 
  stack_invalid_data_register, 
  stack_email_already_registered, 
  stack_register_failed 
} = require('../util/error-message');

exports.getAllUser = async (req, res, next) => {
  try {

  } catch (err) {

  } finally {

  }
}

exports.registerUser = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    // 1) validasi data request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_invalid_data_register));
    }

    // 2) cek user exist di database by email
    let [user] = await User.getUserByKey('user_email', req.body.email);
    if (user.length > 0) throw(processError(message, email_already_registered, stack_email_already_registered));

    // 3) hash password dan insert ke database tabel user
    const objDataRegister = { // user register pasti selalu pending (3)
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt)
    }
    let [resultInsert] = await User.createUser(objDataRegister);
    if (resultInsert.affectedRows < 1) throw(processError(message, register_failed, stack_register_failed));

    data = { user_id: resultInsert.insertId }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.loginUser = async (req, res, next) => {
  try {

  } catch (err) {

  } finally {

  }
}

exports.updateUser = async (req, res, next) => {
  try {

  } catch (err) {

  } finally {

  }
}

exports.deleteUser = async (req, res, next) => {
  try {

  } catch (err) {

  } finally {

  }
}
