const database = require('../util/database');
const processDate = require('./process-date');

async function clearDb () {
  await database.execute(`TRUNCATE TABLE user`);
  await database.execute(`TRUNCATE TABLE kota`);
}

module.exports = async () => {
  try {
    let [user] = await database.execute(`SELECT * FROM user`);
    if (user.length == 0) {
      await clearDb();
      await database.execute(`INSERT INTO user (user_email, user_nama, user_password, user_role, user_status, user_created_at, user_activate) VALUES (?, ?, ?, ?, ?, ?, ?)`, ['admin@ewali.id', 'admin', '$2a$12$HBDf8LKPcvtHDmYGljc3teCob7dNbaj0MsqJsInKCt/mkDD.OakpK', '1', '1', processDate(), '1'])
    }
  } catch (error) {
    console.log(error, 'error initialize default');
  }
}