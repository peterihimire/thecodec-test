const { verify, TokenExpiredError } = require("jsonwebtoken");
const httpStatusCodes = require("./http-status-codes");
const BaseError = require("../utils/base-error");
const db = require("../models");
const User = db.User;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json("Unauthorized access token was expired!");
  }
  return res.status(httpStatusCodes.UNAUTHORIZED).json("Unauthorized!");
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) return catchError(err, res);
      // return res
      //   .status(httpStatusCodes.FORBIDDEN)
      //   .json("Expired or invalid token!");
      req.user = user;
      next();
    });
  } else {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json("You are not authenticated!");
  }
};

// MODERATOR ONLY
const verifyTokenModerator = (req, res, next) => {
  verifyToken(req, res, async () => {
    const foundUser = await User.findByPk(req.user.id);
    const userRoles = await foundUser.getRoles();
    for (let i = 0; i < userRoles.length; i++) {
      if (userRoles[i].name === "moderator") {
        next();
        return;
      }
    }
    return next(
      new BaseError("Requires Moderator Role!", httpStatusCodes.UNAUTHORIZED)
    );
  });
};

// ADMIN ONLY
const verifyTokenAdmin = (req, res, next) => {
  verifyToken(req, res, async () => {
    const foundUser = await User.findByPk(req.user.id);
    const userRoles = await foundUser.getRoles();
    for (let i = 0; i < userRoles.length; i++) {
      if (userRoles[i].name === "admin") {
        next();
        return;
      }
    }
    return next(
      new BaseError("Requires Admin Role!", httpStatusCodes.UNAUTHORIZED)
    );
  });
};

// ADMIN AND MODERATOR ONLY
const verifyTokenAdminAndModerator = (req, res, next) => {
  verifyToken(req, res, async () => {
    const foundUser = await User.findByPk(req.user.id);
    const userRoles = await foundUser.getRoles();
    for (let i = 0; i < userRoles.length; i++) {
      if (userRoles[i].name === "admin") {
        next();
        return;
      }

      if (userRoles[i].name === "moderator") {
        next();
        return;
      }
    }
    return next(
      new BaseError(
        "Requires Admin Or Moderator Role!",
        httpStatusCodes.UNAUTHORIZED
      )
    );
  });
};

// ADMIN AND USER ONLY
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, async () => {
    const foundUser = await User.findByPk(req.user.id);
    const userRoles = await foundUser.getRoles();
    for (let i = 0; i < userRoles.length; i++) {
      if (userRoles[i].name === "admin") {
        next();
        return;
      }

      if (req.user.id === req.params.userId && userRoles[i].name === "user") {
        next();
        return;
      }
    }
    return next(
      new BaseError(
        "Requires Admin Or User Authorization !",
        httpStatusCodes.UNAUTHORIZED
      )
    );
  });
};

module.exports = {
  verifyToken,
  verifyTokenModerator,
  verifyTokenAdmin,
  verifyTokenAdminAndModerator,
  verifyTokenAndAuthorization,
};
