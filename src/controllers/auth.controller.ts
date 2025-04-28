import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { success, failure, generateRandomCode } from "../utilities/common";
import User from "../models/user.model";
import Notification from "../models/notification.model";

import HTTP_STATUS from "../constants/statusCodes";
import { emailWithNodemailerGmail } from "../config/email.config";
import { CreateUserQueryParams } from "../types/query-params";

import { IUser } from "../interfaces/user.interface";

const signup = async (req: Request, res: Response) => {
  try {
    // const validation = validationResult(req).array();
    // console.log(validation);
    // if (validation.length > 0) {
    //   return res
    //     .status(HTTP_STATUS.OK)
    //     .send(failure("Failed to add the user", validation[0].msg));
    // }

    // if (req.body.role === "admin") {
    //   return res
    //     .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
    //     .send(failure(`Admin cannot be signed up`));
    // }

    if (!req.body.email || !req.body.password || !req.body.confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("please provide mail, password and confirm password"));
    }

    const emailCheck = await User.findOne({ email: req.body.email });

    if (emailCheck && !emailCheck.emailVerified) {
      const emailVerifyCode = generateRandomCode(4); //4 digits
      emailCheck.emailVerifyCode = emailVerifyCode;
      await emailCheck.save();

      const emailData = {
        email: emailCheck.email,
        subject: "Account Activation Email",
        html: `
                        <div style="max-width: 500px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); text-align: center; font-family: Arial, sans-serif;">
        <h6 style="font-size: 16px; color: #333;">Hello, ${
          emailCheck?.name || "User"
        }</h6>
        <p style="font-size: 14px; color: #555;">Your email verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #d32f2f; background: #f8d7da; display: inline-block; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">
          ${emailVerifyCode}
        </div>
        <p style="font-size: 14px; color: #555;">Please use this code to verify your email.</p>
      </div>
                        
                      `,
      };
      emailWithNodemailerGmail(emailData);

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Please verify your email"));
    }

    if (emailCheck) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`User with email: ${req.body.email} already exists`));
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure(`Password and confirm password do not match`));
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const emailVerifyCode = generateRandomCode(4); //4 digits

    const newUser = await User.create({
      username: req.body.username || req.body.email,
      email: req.body.email,
      role: req.body.role || "user",
      password: hashedPassword,
      emailVerifyCode,
    });

    const emailData = {
      email: req.body.email,
      subject: "Account Activation Email",
      html: `
                    <h6>Hello, ${newUser?.email || "User"}</h6>
                    <p>Your email verification code is <h6>${emailVerifyCode}</h6> to verify your email</p>
                    
                  `,
    };

    emailWithNodemailerGmail(emailData);

    const expiresIn = process.env.JWT_EXPIRES_IN
      ? parseInt(process.env.JWT_EXPIRES_IN, 10)
      : 3600; // default to 1 hour if not set

    // const token = jwt.sign(
    //   newUser.toObject(),
    //   process.env.JWT_SECRET ?? "default_secret",
    //   {
    //     expiresIn,
    //   }
    // );

    // payload, secret, JWT expiration
    const token = jwt.sign(
      {
        _id: newUser._id,
        role: newUser.roles,
      },
      process.env.JWT_SECRET ?? "default_secret",
      {
        expiresIn,
      }
    );
    res.setHeader("Authorization", token);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: expiresIn * 1000,
    });
    if (newUser) {
      return res
        .status(HTTP_STATUS.OK)
        .send(success("Account created successfully ", { newUser, token }));
    }
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send(failure("Account couldnt be created"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email and password"));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure("Invalid email or password"));
    }

    if (!user.password) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure("password is not set"));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
        .send(failure("Invalid email or password"));
    }

    const expiresIn = process.env.JWT_EXPIRES_IN
      ? parseInt(process.env.JWT_EXPIRES_IN, 10)
      : 3600; // default to 1 hour if not set

    // const token = jwt.sign(
    //   user.toObject(),
    //   process.env.JWT_SECRET ?? "default_secret",
    //   {
    //     expiresIn,
    //   }
    // );

    // payload, secret, JWT expiration
    const token = jwt.sign(
      {
        _id: user._id,
        roles: user.roles,
      },
      process.env.JWT_SECRET ?? "default_secret",
      {
        expiresIn,
      }
    );

    res.setHeader("Authorization", token);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: expiresIn * 1000,
    });

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Login successful", { user, token }));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }

    const emailVerifyCode = generateRandomCode(4);

    user.emailVerifyCode = emailVerifyCode;
    user.emailVerified = false;
    await user.save();

    const emailData = {
      email,
      subject: "Password Reset Email",
      html: `
        <h1>Hello, ${user.email || "User"}</h1>
        <p>Your Email verification Code is <h3>${emailVerifyCode}</h3> to reset your password</p>
      `,
    };
    await emailWithNodemailerGmail(emailData);
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Verification code sent successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, emailVerifyCode } = req.body;
    if (!email || !emailVerifyCode) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email and verification code"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("User does not exist"));
    }

    if (user.emailVerifyCode !== parseInt(emailVerifyCode)) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Invalid verification code"));
    }

    user.emailVerified = true;
    user.emailVerifyCode = null;
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Email verified successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(`INTERNAL SERVER ERROR`);
  }
};

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please provide email, password and confirm password"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("new password and confirm password do not match"));
    }

    if (!user.emailVerified) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Please verify your email first"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.emailVerifyCode = null;

    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Password reset successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(
          failure(
            "Please provide email, old password, new password and confirm password"
          )
        );
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("New password and confirm password do not match"));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("User with this email does not exist"));
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(failure("Old password is incorrect"));
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res
      .status(HTTP_STATUS.OK)
      .send(success("Password changed successfully"));
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Internal server error"));
  }
};

export {
  signup,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
};
