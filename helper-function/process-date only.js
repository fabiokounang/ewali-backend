module.exports = (valueDate = null, condition = false) => {
  let date = {};
  if (valueDate) {
    date = {
      day: new Date(valueDate).getDate(),
      month: new Date(valueDate).getMonth() + 1,
      year: new Date(valueDate).getFullYear()
    };
  } else {
    date = {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    };
  }
  
  date.month = date.month < 10 ? '0' + date.month : date.month;
  date.day = date.day < 10 ? '0' + date.day : date.day;
  return date.year + '-' + date.month + '-' + date.day;
}