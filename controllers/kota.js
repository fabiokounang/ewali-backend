const { validationResult } = require("express-validator");

const Kota = require('../models/kota');
const User = require('../models/user');

const processError = require("../helper-function/process-error");
const processErrorForm = require("../helper-function/process-error-form");
const sendResponse = require("../helper-function/send-response");

const { validation, stack_create_kota_chapter, message, kota_exist, stack_kota_exist, invalid_request, kota_not_exist, stack_kota_not_exist } = require("../util/error-message");
const returnData = require("../util/return-data");
const processQueryGetAllKota = require("../helper-function/process-query-get-all-kota");
const getConnection = require("../helper-function/get-connection");

exports.createKotaChapter = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    // 1) validasi request ata
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_create_kota_chapter));
    }

    // 2) Cek jika kota sudah ada, tolak
    const [kota] = await Kota.getKotaByNama(req.body.kota_nama);
    if (kota.length > 0) throw(processError(message, kota_exist, stack_kota_exist));

    const [resultInsertKota] = await Kota.createKota(req.body.kota_nama);
    if (resultInsertKota.affectedRows != 1) throw(processError(message, create_kota_failed, stack_create_kota_failed));
    data = kota;
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.getAllKotaChapter = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    const queryData = processQueryGetAllKota(req);
    const [kotas] = await Kota.getAllKota(queryData.query);
    const [totalData] = await Kota.getTotalData(queryData.query);
    data = {
      page: req.query.page ? req.query.page == 0 ? 1 : req.query.page : 1,
      limit: queryData.limit,
      max: totalData[0].total > 0 ? Math.ceil(totalData[0].total / queryData.limit) : 1,
      total: totalData[0].total,
      values: kotas
    }
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.updateKotaChapter = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    // 1) validasi data
    if (!req.params.id) throw(processError(validation, invalid_request, stack_invalid_update_kota));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorRequest = processErrorForm(errors.array());
      throw(processError(validation, errorRequest, stack_create_kota_chapter));
    }

    // 2) Cek jika kota sudah ada, tolak
    const [kota] = await Kota.getKotaById(req.params.id);
    if (kota.length <= 0) throw(processError(message, kota_not_exist, stack_kota_not_exist));

    const [resultUpdateKota] = await Kota.updateKota(req.body.kota_nama, kota[0].kota_id);
    if (resultUpdateKota.affectedRows != 1) throw(processError(message, create_kota_failed, stack_create_kota_failed));
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    sendResponse(res, status, data, error, stack);
  }
}

exports.deleteKotaChapter = async (req, res, next) => {
  let { status, data, error, stack} = returnData();
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // 1) validasi data
    if (!req.params.id) throw(processError(validation, invalid_request, stack_invalid_update_kota));

    // 2) Cek jika kota sudah ada, tolak
    const [kota] = await Kota.getKotaById(req.params.id);
    if (kota.length <= 0) throw(processError(message, kota_not_exist, stack_kota_not_exist));

    const [users] = await User.getUserByKey('kota_id', kota[0].kota_id);
    if (users.length > 0) {
      let ids = users.map(val => val.user_id);
      await User.removeKotaAndUpdateStatusPendingUser(ids.join(','));
    }
    const [resultDelete] = await Kota.deleteKota(kota[0].kota_id);
    if (resultDelete.affectedRows != 1) throw(processError(message, create_kota_failed, stack_create_kota_failed));
    await conn.commit();
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
    await conn.rollback();
  } finally {
    await conn.release();
    sendResponse(res, status, data, error, stack);
  }
}
