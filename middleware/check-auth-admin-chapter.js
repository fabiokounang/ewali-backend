const processError = require("../helper-function/process-error");
const sendResponse = require("../helper-function/send-response");
const { message, stack_permission_must_admin, permission } = require("../util/error-message");
const returnData = require("../util/return-data");

module.exports = (req, res, next) => {
  let { status, data, error, stack} = returnData();
  try {
    if (req.userData.user_role == 3) throw(processError(message, permission, stack_permission_must_admin));
    next();
  } catch (err) {
    error = err.error;
    stack = err.stack;
    sendResponse(res, status, data, error, stack);
  }
} 