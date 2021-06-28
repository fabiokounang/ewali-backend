const database = require("../util/database")

module.exports = class User {
  static getUserByKey (key, value) {
    return database.execute(`SELECT user_id, user_email, user_nama, user_password, user_role, user_status FROM user WHERE ${key} = ?`, [value]);
  }

  static createUser (data) {
    return database.execute(`INSERT INTO user (user_email, user_password, user_role, user_status, user_activate) VALUES (?, ?, ?, ?, ?)`, [data.email, data.password, 3, 3, 2]);
  }

  static insertDetailUser (userId, data) {
    let fixData = [];
    Object.keys(data).forEach((key) => {
      if (data[key]) fixData.push([userId, key, data[key]]);
    });
    console.log(fixData);
    return database.query(`INSERT INTO user_detail (user_id, user_key, user_value) VALUES ?`, [fixData]);
  }
}