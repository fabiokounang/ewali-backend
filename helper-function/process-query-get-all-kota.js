module.exports = (req) => {
  let query = `SELECT kota_id, kota_nama, kota_created_at FROM kota`;
  let page = 0;
  let limit = 10;
  let sort_attr = 'kota_created_at';
  let sort = 'DESC';
  let search = '';
  let filter = {};
  
  if (req.body.column) {
    limit = req.body.column.limit ? +req.body.column.limit : limit;
    page = req.body.column.page ? ((+req.body.column.page -1) * limit) : (page * limit);
    if (['kota_nama', 'kota_created_at'].includes(sort_attr)) sort_attr = req.body.column.sort_attr ? req.body.column.sort_attr : sort_attr;
    sort = req.body.column.sort ? req.body.column.sort == 1 ? 'ASC' : 'DESC' : sort;
    search = req.body.column.search ? req.body.column.search : search;
    filter = req.body.column.filter ? req.body.column.filter : filter;   
  }

  if (search) query += ` WHERE kota_nama LIKE '%${search}%'`;
  if (sort_attr) query += ` ORDER BY ${sort_attr} `;
  if (sort && sort_attr) query += sort;
  if (limit != -1) query +=  ` LIMIT ${page},${limit}`;
  return { query: query, limit: limit }
}