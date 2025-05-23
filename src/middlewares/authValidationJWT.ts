import { Request, Response, NextFunction } from "express";
import jsonWebToken, { JwtPayload } from "jsonwebtoken";
import HTTP_STATUS from "../constants/statusCodes";
import { failure } from "../utilities/common";
import { IUser } from "../interfaces/user.interface";

interface UserRequest extends Request {
  user: IUser;
}

const isAuthorizedAdmin = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization);
    if (!authorization) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access, admin not logged in"));
    }
    const token = authorization.split(" ")[1];
    console.log("token", token);
    const validate = jsonWebToken.verify(
      token,
      process.env.JWT_SECRET ?? "default_secret"
    ) as JwtPayload;

    if (!validate) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access, token not validated"));
    }

    req.user = validate as IUser;
    console.log("validate", validate.role);
    if (validate.role == "admin" || validate.role == "superadmin") {
      next();
    } else {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure("Admin access required"));
    }
  } catch (error) {
    console.log(error);
    if (error instanceof jsonWebToken.TokenExpiredError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Access expired"));
    } else if (error instanceof jsonWebToken.JsonWebTokenError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    } else {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
};
const isAuthorizedSuperAdmin = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    console.log(authorization);
    if (!authorization) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access, super admin not logged in"));
    }
    const token = authorization.split(" ")[1];
    console.log("token", token);
    const validate = jsonWebToken.verify(
      token,
      process.env.JWT_SECRET ?? "default_secret"
    ) as JwtPayload;

    if (!validate) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access, token not validated"));
    }

    req.user = validate as IUser;
    console.log("validate", validate.role);
    if (validate.role == "superadmin") {
      next();
    } else {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure("super admin access required"));
    }
  } catch (error) {
    console.log(error);
    if (error instanceof jsonWebToken.TokenExpiredError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Access expired"));
    } else if (error instanceof jsonWebToken.JsonWebTokenError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    } else {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
};

const isAuthorizedUser = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    console.log("headers", req.headers);

    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    }
    console.log(authorization);
    const token = authorization.split(" ")[1];
    console.log("token", token);
    const validate = jsonWebToken.verify(
      token,
      process.env.JWT_SECRET ?? "default_secret"
    ) as JwtPayload;

    if (!validate) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access, token not validated"));
    }

    req.user = validate as IUser;

    // console.log("validate", validate.role);
    // console.log("validate _id", validate._id);
    // if (validate._id == userId && validate.role == "user") {
    next();
    // } else {
    //   return res
    //     .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
    //     .send(failure("Something went wrong"));
    // }
  } catch (error) {
    console.log(error);
    if (error instanceof jsonWebToken.TokenExpiredError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Access expired"));
    } else if (error instanceof jsonWebToken.JsonWebTokenError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    } else {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
};

module.exports = {
  isAuthorizedAdmin,
  isAuthorizedSuperAdmin,
  isAuthorizedUser,
};
