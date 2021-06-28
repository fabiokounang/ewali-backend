const { message, auth } = require("../util/error-message");
const returnData = require("../util/return-data");
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const sendResponse = require("../helper-function/send-response");

function helperResponse(error) {
  let fixError = error;
  fixError.type = message;
  fixError.msg = { default: auth };
  return fixError;
}

module.exports = async (req, res, next) => {
  let { status, data, error, stack } = returnData();
  try {
    if (!req.headers.authorization) return helperResponse(error);
    if (!req.headers.authorization.startsWith('Bearer ')) return helperResponse(error); 
    const token = req.headers.authorization.split(' ')[1]; // Bearer token
    if (!token) return helperResponse(error);
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    const [userData] = await User.getUserByKey('user_id', decoded.user_id);
    if (userData.length <= 0) return helperResponse(error);
    if (userData.status == 2) return helperResponse(error);
    req.userData = userData[0];
    status = true;
  } catch (err) {
    error = err.error;
    stack = err.stack;
  } finally {
    if (status) return next();
    sendResponse(res, status, data, error, stack);
  }
}