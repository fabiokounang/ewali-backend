module.exports = (res, status = true, data = [], error = {}, stack = {}) => {
  let objData = {
    status: status,
    data: data,
    error: error,
    stack: stack
  }
  if (process.env.ENV_NODE === 'production') delete objData.stack;
  if (objData.status) {
    delete objData.error;
    delete objData.stack;
  }
  res.status(200).send(objData);
}