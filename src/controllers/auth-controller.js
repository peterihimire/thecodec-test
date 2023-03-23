const BaseError = require("../utils/base-error");
const httpStatusCodes = require("../utils/http-status-codes");
const db = require("../models");
const User = db.User;
const Role = db.Role;
const RefreshToken = db.RefreshToken;
const Op = db.Sequelize.Op;
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const { validationResult, matchedData } = require("express-validator");
const crypto = require("crypto");
const config = require('../config/auth.config')
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const jwtKey = process.env.JWT_KEY;
const smsKey = process.env.SMS_KEY;
const client = require("twilio")(accountSid, authToken);

// @route POST api/auth/register
// @desc To create an account
// @access Public
const register = async (req, res, next) => {
  const { name, email, roles } = req.body;
  const originalPassword = req.body.password;
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      // var errMsg = errors.array();
      var errMsg = errors.mapped();
      var inputData = matchedData(req);

      return res.status(httpStatusCodes.UNPROCESSABLE_ENTITY).json({
        data: errMsg,
        inputData: inputData,
      });
    }

    const foundUser = await User.findOne({
      attributes: ["businessEmail"],
      where: { businessEmail: email },
    });

    if (foundUser) {
      return next(
        new BaseError(
          "Account already exist, login instead!",
          httpStatusCodes.CONFLICT
        )
      );
    } else {
      const hashedPassword = await bcrypt.hash(originalPassword, 10);

      const createdUser = await User.create({
        businessName: name,
        businessEmail: email,
        password: hashedPassword,
      });
      const { password, ...others } = createdUser.dataValues;
      // const userRole = createdUser
      if (roles) {
        const userRole = await Role.findAll({
          where: {
            name: {
              [Op.or]: roles,
            },
          },
        });
        // console.log(`This is the role of ${name} ... ${userRole}`);
        // console.log(userRole);
        const userWithRoles = await createdUser.setRoles(userRole);
        // console.log(userWithRoles);
      } else {
        const userWithRoles = await createdUser.setRoles([1]);
        // console.log(userWithRoles);
      }

      res.status(httpStatusCodes.CREATED).json({
        status: "Successful",
        msg: `Account creation was successful!`,
        data: others,
        // data: createdUser,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }

    next(error);
  }
};

// @route POST api/auth/login
// @desc Login into account
// @access Public
const login = async (req, res, next) => {
  const { email } = req.body;
  const originalPassword = req.body.password;

  try {
    const existingUser = await User.findOne({
      where: { businessEmail: email },
    });

    if (!existingUser) {
      return next(
        new BaseError(
          "Account does not exist , please signup for an account!",
          httpStatusCodes.NOT_FOUND
        )
      );
    }

    const hashedPassword = await bcrypt.compare(
      originalPassword,
      existingUser.password
    );

    if (!hashedPassword) {
      return next(
        new BaseError(
          "Wrong password or username!",
          httpStatusCodes.UNAUTHORIZED
        )
      );
    }

    const token = sign(
      {
        email: existingUser.email,
        id: existingUser.id,
      },
      process.env.JWT_KEY,
      { expiresIn: config.jwt_expiration }
    );

    let refreshToken = await RefreshToken.createToken(existingUser);

    const { password, ...others } = existingUser.dataValues;
    const authorities = [];
    const userRoles = await existingUser.getRoles();
    console.log(userRoles);

    for (let i = 0; i < userRoles.length; i++) {
      authorities.push("ROLE_" + userRoles[i].name.toUpperCase());
    }

    res
      .cookie("accessToken", token, {
        httpOnly: true,
      })
      .status(httpStatusCodes.OK)
      .json({
        status: "Success",
        msg: "You are logged in",
        data: {
          ...others,
          roles: authorities,
          accessToken: token,
          refreshToken: refreshToken,
        },
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

// @route POST api/auth/send-otp
// @desc To send SMS OTP to user
// @access Public
const sendotp = async (req, res, next) => {
  const { phone } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000);
  const ttl = 5 * 60 * 1000;
  const expire = Date.now() + ttl;
  const data = `${phone}.${otp}.${expire}`;
  const hash = crypto.createHmac("sha256", smsKey).update(data).digest("hex");
  const fullhash = `${hash}.${expire}`;
  console.log(otp);
  try {
    const message = await client.messages.create({
      body: `Your One Time Password for recallo lite is ${otp}`,
      from: +15074194727,
      to: phone,
    });
    // console.log(message.sid);
    // const success = await message;

    res.status(httpStatusCodes.OK).json({
      status: "Success",
      msg: "OTP Sent.",
      data: { phone, hash: fullhash, otp },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST api/auth/verify-otp
// @desc To verify SMS OTP recieved
// @access Public
const verifyotp = async (req, res, next) => {
  const { phone, otp } = req.body;
  const originalHash = req.body.hash;

  const [hash, expire] = originalHash.split(".");
  const now = Date.now();

  try {
    if (now > parseInt(expire)) {
      return next(
        new BaseError(
          "Timeout , Please try again!",
          httpStatusCodes.UNAUTHORIZED
        )
      );
    }

    const data = `${phone}.${otp}.${expire}`;
    const verifyhash = crypto
      .createHmac("sha256", smsKey)
      .update(data)
      .digest("hex");
    //  const fullhash = `${hash}.${expire}`;

    if (verifyhash !== hash) {
      return next(
        new BaseError(
          "Invalid or incorrect OTP !",
          httpStatusCodes.UNAUTHORIZED
        )
      );
    }

    res.status(httpStatusCodes.OK).json({
      status: "Success",
      msg: "OTP Verified.",
      // data: { phone, hash: fullhash, otp },
    });
  } catch (err) {
    next(err);
  }
};

const refreshtoken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken == null) {
    return res
      .status(httpStatusCodes.FORBIDDEN)
      .json({ status: "Fail", msg: "Refresh Token is required!" });
  }

  try {
    const existingToken = await RefreshToken.findOne({
      where: { token: refreshToken },
    });

    console.log("This is refresh token to be Okay...", existingToken);

    if (!existingToken) {
      res.status(httpStatusCodes.FORBIDDEN).json({
        status: "Fail",
        msg: "Refresh token is not in database!",
      });
      return;
    }

    if (RefreshToken.verifyExpiration(existingToken)) {
      await RefreshToken.destroy({ where: { id: existingToken.id } });

      res.status(httpStatusCodes.FORBIDDEN).json({
        status: "Fail",
        msg: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    const user = await existingToken.getUser();
    let newAccessToken = sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: config.jwt_expiration,
    });

    return res.status(httpStatusCodes.OK).json({
      status: "Success",
      msg: "New Access Token and Refresh Token.",
      data: {
        accessToken: newAccessToken,
        refreshToken: existingToken.token,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  sendotp,
  verifyotp,
  refreshtoken,
};
