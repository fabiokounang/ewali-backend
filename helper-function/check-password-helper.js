const { alphanumeric } = require("../util/error-message");
const regexList = require('../util/regex-list');

module.exports = (password = '') => {
  let result = { status: false, error: '' }

  const resultCheck = regexList.alphanumeric.test(password);
  if (!resultCheck) {
    result.error = alphanumeric;
    return result;
  }
  const lettersAndNumbers = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numbers = '1234567890'.split('');
  
  const resultPassword = password.split('').filter(val => lettersAndNumbers.includes(val));
  if (resultPassword.length != password.length) {
    result.error = alphanumeric;
    return result;
  }
  const l = password.split('').filter(val => !letters.includes(val));
  const n = password.split('').filter(val => !numbers.includes(val));
  if (l.length == 0 || n.length == 0) {
    result.error = alphanumeric;
    return result;
  }
  result.status = true;
  return result;
}