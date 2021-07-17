module.exports = (req) => {
  let query = `SELECT user_id, u.kota_id, k.kota_nama, u.user_email, u.user_nama, u.user_vin, u.user_plat, u.user_role, u.user_status, u.user_detail, u.user_created_at, u.user_last_update, u.user_activate FROM user AS u JOIN kota AS k ON u.kota_id = k.kota_id WHERE user_status NOT IN (3)`;
  if (req.userData.user_role == 2) query += ` AND u.kota_id = ${req.userData.kota_id} AND u.user_id != ${req.userData.user_id}`;
  let page = 0;
  let limit = 10;
  let sort_attr = 'user_created_at';
  let sort = 'DESC';
  let search = '';
  let filteredKeys = [];
  let objFilterSearch = [];
  
  limit = req.query.limit ? +req.query.limit : limit;
  page = req.query.page ? ((+req.query.page -1) * limit) : (page * limit);
  if (['user_email', 'user_nama', 'user_created_at'].includes(sort_attr)) sort_attr = req.query.sort_attr ? req.query.sort_attr : sort_attr;
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
  // console.log(query);
  return { query: query, limit: limit }
}