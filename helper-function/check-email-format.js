const regexList = require("../util/regex-list");

module.exports = (email) => {
  let regexEmail = regexList.email;
  if (email && email.length > 253) return false;
  if (email && !regexEmail.test(email)) return false;
  return true;
}