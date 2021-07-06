const database = require('../util/database');

module.exports = async () => {
  return await database.getConnection();
}