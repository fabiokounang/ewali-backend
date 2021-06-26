module.exports = (errors) => {
  const resultError = {};
  errors.forEach((value) => {
    if (value.param.split('.').length > 1) {
      resultError[value.param.split('.')[1]] = value.msg;
    } else {
      resultError[value.param] = value.msg;
    }
  });
  return resultError;
}