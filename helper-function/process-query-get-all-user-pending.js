module.exports = (req, userId) => {
  let query = `SELECT user_id, u.kota_id, user_email, user_nama, user_vin, user_plat, user_role, user_status, user_detail, user_last_update, user_created_at, user_activate FROM user AS u LEFT JOIN kota AS k ON u.kota_id = k.kota_id WHERE user_status = 3`;
  let page = 0;
  let limit = 10;
  let sort_attr = 'user_last_update';
  let sort = 'DESC';
  let search = '';
  let filter = {};
  
  if (req.body.column) {
    limit = req.body.column.limit ? +req.body.column.limit : limit;
    page = req.body.column.page ? ((+req.body.column.page -1) * limit) : (page * limit);
    if (['user_email', 'user_nama', 'user_last_update', 'user_created_at'].includes(sort_attr)) sort_attr = req.body.column.sort_attr ? req.body.column.sort_attr : sort_attr;
    sort = req.body.column.sort ? req.body.column.sort == 1 ? 'ASC' : 'DESC' : sort;
    search = req.body.column.search ? req.body.column.search : search;
    filter = req.body.column.filter ? req.body.column.filter : filter;   
  }
  
  if (userId) query += ` AND user_id = ${userId}`;
  
  if (filter && Object.keys(filter).length > 0) {
    // let userStatus = filter.user_status;
    let userKota = filter.kota;
    // if (userStatus) query += ` AND user_status = ${userStatus}`;
    if (userKota) query += ` AND u.kota_id = ${userKota}`;
  }

  //user_nama;user_email;user_plat;user_vin;user_hp
  if (search) query += ` AND user_nama LIKE '%${search}%' OR user_email LIKE '%${search}%' OR user_plat LIKE '%${search}%' OR user_vin LIKE '%${search}%' OR JSON_UNQUOTE(JSON_EXTRACT(user_detail, "$.nomor_telepon_current")) LIKE '%${search}%'`;

  if (sort_attr) query += ` ORDER BY ${sort_attr} `;
  if (sort && sort_attr) query += sort;
  if (limit != -1) query +=  ` LIMIT ${page},${limit}`;
  console.log(query);
  return { query: query, limit: limit }
}