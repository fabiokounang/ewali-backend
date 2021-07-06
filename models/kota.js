const database = require("../util/database")

module.exports = class Kota {
  static getKotaByNama (kotaNama) {
    return database.execute(`SELECT kota_id, kota_nama, kota_created_at FROM kota WHERE kota_nama = ?`, [kotaNama]);
  }

  static getKotaById (kotaId) {
    return database.execute(`SELECT kota_id, kota_nama, kota_created_at FROM kota WHERE kota_id = ?`, [kotaId]);
  } 

  static createKota (kotaNama) {
    return database.execute(`INSERT INTO kota (kota_nama) VALUES (?)`, [kotaNama]);
  }

  static updateKota (kotaNama, kotaId) {
    return database.execute(`UPDATE kota SET kota_nama = ? WHERE kota_id = ?`, [kotaNama, kotaId])
  }

  static deleteKota (kotaId) {
    return database.execute(`DELETE FROM kota WHERE kota_id = ?`, [kotaId]);
  }

  static getAllKota (query) {
    return database.execute(query);
  }

  static getTotalData (query) {
    let queryString = query;
    let tempData = query.split('FROM');
    tempData[0] = 'SELECT COUNT(kota_id) AS total ';
    queryString = tempData.join('FROM');
    if (queryString.includes('LIMIT')) queryString = queryString.split(' ').slice(0, queryString.split(' ').length - 2).join(' '); // Remove limit
    return database.execute(queryString);
  } 
}