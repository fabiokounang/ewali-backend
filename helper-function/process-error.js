const { message, general, config, auth, validation } = require("../util/error-message");

module.exports = (type, msg, stack) => {
  let err = {
    error: {
      type: type,
      msg: msg
    },
    stack: stack || {}
  }
  if (type === validation) err.error.msg = msg;
  if (type === message) err.error.msg = { default: msg };
  return err;
}