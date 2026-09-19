import { statusCodes } from "./statusCode.helper.js";

export const responseSuccess = (
  result,
  messageText = "Xử lý thành công",
  statusCode = statusCodes.OK
) => {
  return {
    status: "success",
    statusCode: statusCode,
    message: messageText,
    doc: "/api-docs",
    data: result,
  };
};

export const responseError = (
  message = "Internal server error",
  statusCode = statusCodes.INTERNAL_SERVER_ERROR,
  stack
) => {
  return {
    status: "error",
    statusCode: statusCode || statusCodes.INTERNAL_SERVER_ERROR,
    message: message || "Internal server error",
    stack,
    doc: "/api-docs",
  };
};
