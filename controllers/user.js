const { validationResult } = require('express-validator');
const lodash = require('lodash');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(12);
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const sendResponse = require('../helper-function/send-response');
const processError = require('../helper-function/process-error');
const processErrorForm = require('../helper-function/process-error-form');
const sendCookie = require('../helper-function/send-cookie');

const returnData = require('../util/return-data');
const { 
  validation, 
  message, 
  email_already_registered, 
  register_failed, 
  stack_invalid_data_register, 
  stack_email_already_registered, 
  stack_register_failed, 
  user_not_found,
  stack_user_not_found,
  user_suspend,
  stack_user_suspend,
  password_wrong,
  stack_password_wrong,
  stack_resend_email
} = require('../util/error-message');
const sendEmail = require('../helper-function/send-email');
const processQueryGetAllUserPending = require('../helper-function/process-query-get-all-user-pending');

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

    // 4) kirim email aktivasi
    // await sendEmail(req.body.email);

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
  let { status, data, error, stack} = returnData();
  try {
    // 1) validasi data request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_invalid_data_register));
    }

    // 2) cek email terdaftar, status wajib aktif / pending dan password harus benar
    const [user] = await User.getUserByKey('user_email', req.body.email);
    if (user.length <= 0) throw(processError(message, user_not_found, stack_user_not_found));
    if (user[0].user_status == 2) throw(processError(message, user_suspend, stack_user_suspend));
    const isCorrectPassword = await bcrypt.compare(req.body.password, user[0].user_password);
    if (!isCorrectPassword) throw(processError(message, password_wrong, stack_password_wrong))

    // 3) create jsonwebtoken dengan secret key di env, expired 3 hari
    const token = jwt.sign({user_id: user[0].user_id, user_email: user[0].user_email, user_role: user[0].user_role, user_status: user[0].user_status}, process.env.SECRET_KEY, { algorithm: 'HS512'}, { expiresIn: '7d' });
    
    data = {
      user_id: user[0].user_id,
      user_email: user[0].user_email,
      user_nama: user[0].user_nama || null,
      user_role: +user[0].user_role,
      user_status: +user[0].user_status
    }
    const cookieOptions = sendCookie(req);
    res.cookie('tokenuser', token, cookieOptions);
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.submitForm = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    // 1) validasi data request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_invalid_data_submit_form));
    }

    // 2) proses data masing2 per key
    const objDetail = {   
      nomor_id:  req.body.nomor_id,
      nama_lengkap:  req.body.nama_lengkap,
      nama_panggilan:  req.body.nama_panggilan,
      tanggal_lahir:  req.body.tanggal_lahir,
      alamat_ktp:  req.body.alamat_ktp,
      alamat_domisili:  req.body.alamat_domisili,
      kota_domisili:  req.body.kota_domisili,
      provinsi_domisili:  req.body.provinsi_domisili,
      pekerjaan:  req.body.pekerjaan,
      nomor_telepon_current:  req.body.nomor_telepon_current,
      nomor_telepon_telegram:  req.body.nomor_telepon_telegram,
      nomor_telepon_whatsapp:  req.body.nomor_telepon_whatsapp,
      nomor_telepon_emergency:  req.body.nomor_telepon_emergency,
      golongan_darah:  req.body.golongan_darah,
      informasi_wali: req.body.informasi_wali,
      snk: req.body.snk,
      emoney:  req.body.emoney
    }

    // 3) insert ke user_detail
    await User.insertDetailUser(req.userData.user_id, objDetail);
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.resendEmail = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    // 1) validasi data request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_resend_email));
    }

    // 2) kirim email aktivasi
    // await sendEmail(req.body.email);
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllUserPending = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    const queryData = processQueryGetAllUserPending(req);
    const [users] = await User.getAllUser(queryData.query);
    const [totalData] = await User.getTotalData(queryData.query);
    
    data = {
      page: req.body.column && req.body.column.page ? req.body.column.page == 0 ? 1 : req.body.column.page : 1,
      limit: queryData.limit,
      max: totalData[0].total > 0 ? Math.ceil(totalData[0].total / queryData.limit) : 1,
      total: totalData[0].total,
      values: users.map(val => {
        if (val.user_detail) val.user_detail = JSON.parse(val.user_detail);
        return val;
      })
    }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
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
