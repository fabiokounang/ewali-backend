const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(12);
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/user');
const Kota = require('../models/kota');

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
  stack_resend_email,
  invalid_request,
  stack_forbidden,
  stack_invalid_body,
  stack_invalid_parameter,
  update_role_failed,
  stack_invalid_data_submit_form,
  stack_admin_cannot_upgrade,
  stack_update_role_failed,
  note_required,
  stack_note_required,
  stack_invalid_data_approve_reject_form,
  update_status_failed,
  stack_update_status_failed,
  user_not_submit_form_yet,
  stack_user_not_submit_form_yet,
  kota_required,
  kota_not_exist,
  stack_kota_not_exist,
  stack_kota_required,
  stack_user_still_pending,
  user_still_pending,
  stack_forbidden_submit,
  user_not_valid,
  stack_user_not_valid,
  unique_user_data,
  stack_unique_user_data,
  stack_invalid_data_update,
  stack_user_block,
  user_block,
  old_password_wrong,
  stack_old_password_wrong,
  stack_invalid_data_change_password,
  stack_invalid_data_forget_password,
  stack_invalid_data_reset_password,
  invalid_token,
  stack_invalid_token
} = require('../util/error-message');
const sendEmail = require('../helper-function/send-email');
const processQueryGetAllUserPending = require('../helper-function/process-query-get-all-user-pending');
const processQueryGetAllUserActive = require('../helper-function/process-query-get-all-user-active');
const getConnection = require("../helper-function/get-connection");
const processDate = require('../helper-function/process-date');
const processDateOnly = require('../helper-function/process-date only');
const sendManyEmail = require('../helper-function/send-many-email');

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

    // 4) create token
    let token = crypto.randomBytes(64).toString('hex');
    let registerToken = crypto.createHash('sha256').update(token).digest('hex'); // encrypt
    let registerExpired = processDate(Date.now() + 10800000); // + 3 jam
    let [resultUpdate] = await User.updateToken(registerToken, registerExpired, resultInsert.insertId);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, invalid_request, stack_invalid_data_register));

    // 4) kirim email aktivasi ke user yang daftar
    sendEmail(req.body.email, token);

    // 5) kirim email kalo ada yg register ke semua admin
    // const [adminEmails] = await User.getUserByKey('user_role', '1');
    // if (adminEmails.length > 0) sendManyEmail(adminEmails.map(val => val.user_email), req.body.email);

    data = { user_id: resultInsert.insertId, token: token }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.loginAdmin = async (req, res, next) => {
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
    if (user[0].user_status == 4) throw(processError(message, user_block, stack_user_block));
    if (user[0].user_role == 3) throw(processError(message, user_not_found, stack_user_not_found));
    const isCorrectPassword = await bcrypt.compare(req.body.password, user[0].user_password);
    if (!isCorrectPassword) throw(processError(message, password_wrong, stack_password_wrong));

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
    res.cookie('token', token, cookieOptions);
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
    if (user[0].user_status == 4) throw(processError(message, user_block, stack_user_block));
    if (user[0].user_role == 1) throw(processError(message, user_not_found, stack_user_not_found));
    const isCorrectPassword = await bcrypt.compare(req.body.password, user[0].user_password);
    if (!isCorrectPassword) throw(processError(message, password_wrong, stack_password_wrong));

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
    res.cookie('token', token, cookieOptions);
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

    // 2) cek sudah pernah submit ? 
       // jika iya dan belum direview, tolak, 
       // jika ditolak oleh admin boleh submit lagi
    if (req.userData.user_detail && !req.userData.user_detail.note) throw(processError(message, invalid_request, stack_forbidden_submit));

    // 3) cek user_vin, user_nama, user_plat sudah ada / tidak (wajib unique)
    const [user] = await User.getUserByNamaVinPlat(req.body); 
    if (user.length > 0) throw(processError(message, unique_user_data, stack_unique_user_data));

    // 4) proses data masing2 per key
    const objDetail = {
      user_nama: req.body.nama_lengkap,
      user_vin: req.body.nomor_vin,
      user_plat: req.body.nomor_polisi,
      nomor_id:  req.body.nomor_id,
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

    // 5) insert ke user_detail
    await User.insertOrUpdateDetailUser(req.userData.user_id, objDetail);
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
    if (req.userData.user_activate == 1) throw(processError(message, invalid_request, stack_resend_email));

    // 2) create token
    let token = crypto.randomBytes(64).toString('hex');
    let registerToken = crypto.createHash('sha256').update(token).digest('hex'); // encrypt
    let registerExpired = processDate(Date.now() + 10800000); // + 3 jam
    let [resultUpdate] = await User.updateToken(registerToken, registerExpired, req.userData.user_id);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, invalid_request, stack_resend_email));

    // 2) kirim email aktivasi
    await sendEmail(req.userData.user_email, token);
    data = { token }
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
    const [kota] = await Kota.getAllKota(`SELECT kota_id, kota_nama FROM kota`);
    data = {
      page: req.query.page ? req.query.page == 0 ? 1 : req.query.page : 1,
      limit: queryData.limit,
      max: totalData[0].total > 0 ? Math.ceil(totalData[0].total / queryData.limit) : 1,
      total: totalData[0].total,
      values: users.map(val => {
        if (val.user_detail) val.user_detail = JSON.parse(val.user_detail);
        return val;
      }),
      kota: kota
    }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllUserNotPending = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    const queryData = processQueryGetAllUserActive(req);
    const [users] = await User.getAllUser(queryData.query);
    const [totalData] = await User.getTotalData(queryData.query);
    const [kota] = await Kota.getAllKota(`SELECT kota_id, kota_nama FROM kota`);

    data = {
      page: req.query.page ? req.query.page == 0 ? 1 : req.query.page : 1,
      limit: queryData.limit,
      max: totalData[0].total > 0 ? Math.ceil(totalData[0].total / queryData.limit) : 1,
      total: totalData[0].total,
      values: users.map(val => {
        if (val.user_detail) {
          val.user_detail = JSON.parse(val.user_detail);
          if (req.userData.user_role == 2) {
            Object.keys(val.user_detail).forEach((key) => {
              if (key != 'nomor_telepon_current' && key != 'nomor_telepon_emergency') delete val.user_detail[key];
            });
          }
        }
        if (req.userData.user_role == 2) {
          delete val.kota_id;
          delete val.user_last_update;
          delete val.user_vin;
          delete val.user_role;
          delete val.user_status;
        }
        return val;
      }),
      kota: kota
    }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.upgradeDowngradeUser = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    if (!req.params.id) throw(processError(message, invalid_request, stack_invalid_parameter));
    if (!req.body.user_role) throw(processError(message, invalid_request, stack_invalid_body));
    if (req.userData.user_id == req.params.id) throw(processError(message, invalid_request, stack_forbidden));
    const [user] = await User.getUserByKey('user_id', req.params.id);
    if (user.length <= 0) throw(processError(message, user_not_found, stack_user_not_found));
    if (user[0].user_status == 3) throw(processError(message, user_still_pending, stack_user_still_pending));
    if (user[0].user_role == 1 && req.body.user_role <= 1) throw(processError(message, invalid_request, stack_admin_cannot_upgrade));
    const [resultUpdate] = await User.updateRole(req.params.id, req.body.user_role);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, update_role_failed, stack_update_role_failed));
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.reviewApproveRejectForm = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    if (!req.params.id) throw(processError(message, invalid_request, stack_invalid_parameter));
    // 1) validasi data request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_invalid_data_approve_reject_form));
    }

    const [user] = await User.getUserByKey('user_id', req.params.id);
    if (user.length <= 0) throw(processError(message, user_not_found, stack_user_not_found));
    if (user[0].user_role != 3) throw(processError(message, user_not_valid, stack_user_not_valid));
    if (!user[0].user_detail) throw(processError(message, user_not_submit_form_yet, stack_user_not_submit_form_yet));
    user[0].user_detail = JSON.parse(user[0].user_detail);
    
    if (req.body.status_form == 1) {
      if (!req.body.kota) throw(processError(message, kota_required, stack_kota_required));
      const [kota] = await Kota.getKotaById(req.body.kota);
      if (kota.length <= 0) throw(processError(message, kota_not_exist, stack_kota_not_exist));
      // if (user[0].user_detail && user[0].user_detail.note) delete user[0].user_detail.note;
      // update data user & last update
      const userData = {
        user_nama: user[0].user_detail.user_nama,
        user_vin: user[0].user_detail.user_vin,
        user_plat: user[0].user_detail.user_plat
      }
      delete user[0].user_detail.user_nama;
      delete user[0].user_detail.user_vin;
      delete user[0].user_detail.user_plat;
      const resultUpdate = await User.updateDataUserForm(req.params.id, userData, req.body.kota);
      if (resultUpdate.affectedRows <= 0) throw(processError(message, update_status_failed, stack_update_status_failed));
    } else {
      user[0].user_detail.note = req.body.note;
      // send email
      const [resultUpdate] = await User.insertOrUpdateDetailUser(req.params.id, user[0].user_detail);
      if (resultUpdate.affectedRows <= 0) throw(processError(message, update_status_failed, stack_update_status_failed));
    }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateDataUser = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    if (!req.params.id) throw(processError(message, invalid_request, stack_invalid_parameter));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_invalid_data_update));
    }

    // 2) cek user_vin, user_nama, user_plat sudah ada / tidak (wajib unique)
    const [user] = await User.getUserByNamaVinPlat(req.body); 
    if (user.length > 0) {
      let otherUser = user.find(val => val.user_id != req.params.id);
      if (otherUser) throw(processError(message, unique_user_data, stack_unique_user_data));
    }

    // 3) proses data masing2 per key
    const objDetail = {
      nomor_id:  req.body.nomor_id,
      nama_panggilan:  req.body.nama_panggilan,
      tanggal_lahir: processDateOnly(new Date(req.body.tanggal_lahir).getTime()),
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

    // 4) insert ke user_detail
    const [resultUpdateDetail] = await User.insertOrUpdateDetailUser(req.params.id, objDetail);
    if (resultUpdateDetail.affectedRows <= 0) throw(processError(message, update_status_failed, stack_update_status_failed));
    
    const userData = {
      user_nama: req.body.nama_lengkap,
      user_vin: req.body.nomor_vin,
      user_plat: req.body.nomor_polisi
    }

    const resultUpdate = await User.updateDataUserForm(req.params.id, userData, req.body.kota_id);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, update_status_failed, stack_update_status_failed));
    status = true;
    await conn.commit();
  } catch (err) {
    error = err.error;
    stack = err.stack;
    await conn.rollback();
  } finally {
    await conn.release();
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateStatusUser = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    if (!req.params.id) throw(processError(message, invalid_request, stack_invalid_parameter));
    if (req.userData.user_id == req.params.id) throw(processError(message, invalid_request, stack_forbidden));
    if (!req.body.user_status) throw(processError(message, invalid_request, stack_invalid_parameter));
    
    const [user] = await User.getUserByKey('user_id', req.params.id);
    if (user.length <= 0) throw(processError(message, invalid_request, stack_user_not_found));
    if (req.body.user_status == user[0].user_status) throw(processError(message, invalid_request, stack_invalid_parameter)); // tidak bisa update dengan status sama
    if (req.body.user_status == 3) throw(processError(message, invalid_request, stack_invalid_parameter)); // tidak bisa update jd pending
    await User.updateStatusUser(req.params.id, req.body.user_status); // update status user
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getLogin = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {  
    data = {
      user_id: req.userData.user_id,
      user_email: req.userData.user_email,
      user_role: req.userData.user_role,
      user_nama: req.userData.user_nama
    }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.activateUser = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    if (!req.params.id) throw(processError(message, invalid_request, stack_invalid_parameter));
    if (req.userData.user_id == req.params.id) throw(processError(message, invalid_request, stack_forbidden));
    const [user] = await User.getUserByKey('user_id', req.params.id);
    if (user.length <= 0) throw(processError(message, invalid_request, stack_user_not_found));
    if (user[0].user_activate == 1) throw(processError(message, invalid_request, stack_forbidden));
    const [resultUpdate] = await User.activateUser(user[0].user_id);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, invalid_request, stack_update_verified_failed));
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.changePassword = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_invalid_data_change_password));
    }
    const [user] = await User.getUserByKey('user_id', req.userData.user_id);
    const isOldPasswordCorrect = await bcrypt.compare(req.body.old_password, user[0].user_password);
    if (!isOldPasswordCorrect) throw(processError(message, old_password_wrong, stack_old_password_wrong));
    const hashPassword = await bcrypt.hash(req.body.new_password, salt);
    const [resultUpdate] = await User.updatePassword(req.userData.user_id, hashPassword);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, invalid_request, stack_update_password_failed));
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.forgetPassword = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_invalid_data_forget_password));
    }
    const [user] = await User.getUserByKey('user_email', req.body.email);
    if (user.length <= 0) throw(processError(message, user_not_found, stack_user_not_found));
    let resetToken = crypto.randomBytes(64).toString('hex');
    let passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); // encrypt
    let passwordResetExpired = processDate(Date.now() + 10800000); // + 3 jam
    let [resultUpdate] = await User.updateToken(passwordResetToken, passwordResetExpired, user[0].user_id);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, invalid_request, stack_forget_password));

    // send email token nya (resetToken)
    data = {
      token_temp: resetToken
    }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.resetPassword = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_invalid_data_reset_password));
    }
    if (!req.params.token) throw(processError(message, invalid_request, stack_invalid_parameter));
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const [user] = await User.getUserByTokenAndExpired(hashedToken);
    if (user.length <= 0) throw(processError(message, invalid_token, stack_invalid_token));
    if (Date.now() > new Date(user[0].user_token_expired).getTime()) throw(processError(message, user_token_expired, stack_user_token_expired));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const [resultUpdate] = await User.updatePasswordAndDeleteToken(user[0].user_id, hashedPassword);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, invalid_request, stack_update_password_failed));
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.verifikasiEmail = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    if (!req.params.token) throw(processError(message, invalid_request, stack_invalid_parameter));
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const [user] = await User.getUserByTokenAndExpired(hashedToken);
    if (user.length <= 0) throw(processError(message, invalid_token, stack_invalid_token));
    if (Date.now() > new Date(user[0].user_token_expired).getTime()) throw(processError(message, user_token_expired, stack_user_token_expired));
    const [resultUpdate] = await User.activateUserAndDeleteToken(user[0].user_id);
    if (resultUpdate.affectedRows <= 0) throw(processError(message, invalid_request, stack_update_password_failed));
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteUser = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.logout = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    const cookieOptions = sendCookie(req, true);
    res.cookie('token', '', cookieOptions);
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}