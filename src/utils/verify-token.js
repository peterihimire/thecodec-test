const { verify } = require("jsonwebtoken");
const httpStatusCodes = require("./http-status-codes");
const BaseError = require("../utils/base-error");
const db = require("../models");
const User = db.User;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    verify(token, process.env.JWT_KEY, (err, user) => {
      if (err)
        return res
          .status(httpStatusCodes.FORBIDDEN)
          .json("Expired or invalid token!");
      req.user = user;
      next();
    });
  } else {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json("You are not authenticated!");
  }
};

// ADMIN AND AUTHENTICATED USER
const verifyTokenAndModerator = (req, res, next) => {
  verifyToken(req, res, async () => {
    const foundUser = await User.findByPk(req.user.id);
    const userRoles = await foundUser.getRoles();
    for (let i = 0; i < userRoles.length; i++) {
      if (userRoles[i].name === "moderator") {
        next();
        return;
      }
    }

    // res.status(403).send({
    //   message: "Require Moderator Role!",
    // });

    return next(
      new BaseError("Requires Moderator Role!", httpStatusCodes.UNAUTHORIZED)
    );
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndModerator,
};
