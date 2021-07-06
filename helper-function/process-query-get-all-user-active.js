module.exports = (req) => {
  let query = `SELECT user_id, u.kota_id, k.kota_nama, user_email, user_nama, user_vin, user_plat, user_role, user_status, user_detail, user_last_update, user_created_at, user_activate FROM user AS u LEFT JOIN kota AS k ON u.kota_id = k.kota_id WHERE user_status != 3`;
  if (req.userData.user_role == 2) query += ` AND kota_id = ${req.userData.kota_id}`;
  let page = 0;
  let limit = 10;
  let sort_attr = 'user_last_update';
  let sort = 'DESC';
  let search = '';
  let filteredKeys = [];
  let objFilterSearch = [];
  
  limit = req.query.limit ? +req.query.limit : limit;
  page = req.query.page ? ((+req.query.page -1) * limit) : (page * limit);
  if (['user_email', 'user_nama', 'user_last_update', 'user_created_at'].includes(sort_attr)) sort_attr = req.query.sort_attr ? req.query.sort_attr : sort_attr;
  sort = req.query.sort ? req.query.sort == 1 ? 'ASC' : 'DESC' : sort;
  search = req.query.search ? req.query.search : search;
  filteredKeys = Object.keys(req.query).filter(val => val.includes('filter_'));

  if (filteredKeys.length > 0) {
    filteredKeys.forEach((key) => {
      let queryKey = key.split('_').slice(1).join('_');
      objFilterSearch.push('u.' + queryKey + ' = ' + req.query[key]);
    });
    query += ` AND ${objFilterSearch.join(' AND ')}`;
  }

  //user_nama;user_email;user_plat;user_vin;user_hp
  if (search) query += ` AND user_nama LIKE '%${search}%' OR user_email LIKE '%${search}%' OR user_plat LIKE '%${search}%' OR user_vin LIKE '%${search}%' OR JSON_UNQUOTE(JSON_EXTRACT(user_detail, "$.nomor_telepon_current")) LIKE '%${search}%'`;

  if (sort_attr) query += ` ORDER BY ${sort_attr} `;
  if (sort && sort_attr) query += sort;
  if (limit != -1) query +=  ` LIMIT ${page},${limit}`;
  return { query: query, limit: limit }
}