import { statusCodes } from "./statusCode.helper.js";

export class BadRequestException extends Error {
  code = statusCodes.BAD_REQUEST;
  name = "BadRequestException";
  constructor(message = "Bad request") {
    super(message);
  }
}

export class UnauthorizedException extends Error {
  code = statusCodes.UNAUTHORIZED;
  name = "UnauthorizedException";
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class ForbiddenException extends Error {
  code = statusCodes.FORBIDDEN;
  name = "ForbiddenException";
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class NotFoundException extends Error {
  code = statusCodes.NOT_FOUND;
  name = "NotFoundException";
  constructor(message = "Not found") {
    super(message);
  }
}

export class TooManyRequestsException extends Error {
  code = statusCodes.TOO_MANY_REQUESTS;
  name = "TooManyRequestsException";
  constructor(message = "Too many requests") {
    super(message);
  }
}
