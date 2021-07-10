const processDate = require("../helper-function/process-date");
const database = require("../util/database")

module.exports = class User {
  static getUserByKey (key, value) {
    return database.execute(`SELECT user_id, kota_id, user_email, user_nama, user_password, user_role, user_status, user_detail FROM user WHERE ${key} = ?`, [value]);
  }

  static getUserByNamaVinPlat (data) {
    return database.execute(`SELECT user_id, kota_id, user_email, user_nama, user_password, user_role, user_status, user_detail FROM user WHERE user_nama = ? OR user_vin = ? OR user_plat = ?`, [data.nama_lengkap, data.nomor_vin, data.nomor_polisi]);
  }

  static getAllUser (query) {
    return database.execute(query);
  }

  static getTotalData (query) {
    let queryString = query;
    let tempData = query.split('FROM');
    tempData[0] = 'SELECT COUNT(user_id) AS total ';
    queryString = tempData.join('FROM');
    if (queryString.includes('LIMIT')) queryString = queryString.split(' ').slice(0, queryString.split(' ').length - 2).join(' '); // Remove limit
    return database.execute(queryString);
  } 

  static createUser (data) {
    return database.execute(`INSERT INTO user (user_email, user_password, user_role, user_status, user_activate) VALUES (?, ?, ?, ?, ?)`, [data.email, data.password, 3, 3, 2]);
  }

  static insertOrUpdateDetailUser (userId, data) {
    return database.query(`UPDATE user SET user_detail = ?, user_last_update = ? WHERE user_id = ?`, [JSON.stringify(data), processDate(), userId]);
  }

  static updateRole (userId, userRole) {
    return database.execute(`UPDATE user SET user_role = ? WHERE user_id = ?`, [userRole, userId]);
  }

  static updateDataUserForm (userId, data, kotaId) {
    console.log(userId, data, kotaId);
    return database.execute(`UPDATE user SET user_nama = ?, user_vin = ?, user_plat = ?, user_status = ?, kota_id = ? WHERE user_id = ?`, [data.user_nama, data.user_vin, data.user_plat, '1', kotaId, userId]);
  }

  static removeKotaAndUpdateStatusPendingUser (usersId) {
    return database.execute(`UPDATE user SET kota_id = ?, user_status = 3 WHERE user_id IN (${usersId})`, [null]);
  }

  static updateStatusUser (userId, status) {
    return database.execute(`UPDATE user SET user_status = ? WHERE user_id = ? AND user_status = 3`, [status, userId]);
  }
}