const BaseError = require("../utils/base-error");
const httpStatusCodes = require("../utils/http-status-codes");
const db = require("../models");
const User = db.User;
const Role = db.Role;
const Op = db.Sequelize.Op;
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
require("dotenv").config();

// @route POST api/auth/register
// @desc To create an account
// @access Public
const register = async (req, res, next) => {
  const { name, email, roles } = req.body;
  const originalPassword = req.body.password;
  // const { roles } = req.body;

  try {
    if (!name || !email || !originalPassword) {
      return next(
        new BaseError(
          "Input missing required field(s).",
          httpStatusCodes.UNPROCESSABLE_ENTITY
        )
      );
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
        console.log(userRole);
        const userWithRoles = await createdUser.setRoles(userRole);
        console.log(userWithRoles);
      } else {
        const userWithRoles = await createdUser.setRoles([1]);
        console.log(userWithRoles);
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
      { expiresIn: "1h" }
    );

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
        status: "Successful",
        msg: "You are logged in",
        data: { ...others, roles: authorities, token },
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = httpStatusCodes.INTERNAL_SERVER;
    }
    next(error);
  }
};

module.exports = { register, login };
