module.exports = (req) => {
  let query = `SELECT kota_id, kota_nama, kota_created_at FROM kota`;
  let page = 0;
  let limit = 10;
  let sort_attr = 'kota_created_at';
  let sort = 'DESC';
  let search = '';
  
  limit = req.query.limit ? +req.query.limit : limit;
  page = req.query.page ? ((+req.query.page -1) * limit) : (page * limit);
  if (['kota_nama', 'kota_created_at'].includes(sort_attr)) sort_attr = req.query.sort_attr ? req.query.sort_attr : sort_attr;
  sort = req.query.sort ? req.query.sort == 1 ? 'ASC' : 'DESC' : sort;
  search = req.query.search ? req.query.search : search;

  if (search) query += ` WHERE kota_nama LIKE '%${search}%'`;
  if (sort_attr) query += ` ORDER BY ${sort_attr} `;
  if (sort && sort_attr) query += sort;
  if (limit != -1) query +=  ` LIMIT ${page},${limit}`;
  return { query: query, limit: limit }
}