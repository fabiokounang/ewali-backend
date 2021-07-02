module.exports = (valueDate = null, condition = false) => {
  let date = {};
  if (valueDate) {
    date = {
      day: new Date(valueDate).getDate(),
      month: new Date(valueDate).getMonth() + 1,
      year: new Date(valueDate).getFullYear(),
      hour: new Date(valueDate).getHours(),
      minute: new Date(valueDate).getMinutes(),
      second: new Date(valueDate).getSeconds()
    };
  } else {
    date = {
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes(),
      second: new Date().getSeconds()
    };
  }
  
  date.month = date.month < 10 ? '0' + date.month : date.month;
  date.day = date.day < 10 ? '0' + date.day : date.day;
  date.hour = date.hour < 10 ? '0' + date.hour : date.hour;
  date.minute = date.minute < 10 ? '0' + date.minute : date.minute;
  date.second = date.second < 10 ? '0' + date.second : date.second;
  return date.year + '-' + date.month + '-' + date.day + ' ' + date.hour + ':' + date.minute + ':' + date.second;
}