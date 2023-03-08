const { check } = require("express-validator");

const RegValidator = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Name required")
    .matches(/^[a-zA-Z ]*$/)
    .withMessage("Only Characters with white space are allowed"),
  check("email")
    .notEmpty()
    .withMessage("Email address required")
    .normalizeEmail()
    .isEmail()
    .withMessage("Must be a valid email."),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 5 })
    .withMessage("password must be minimum 5 length")
    .matches(/(?=.*?[A-Z])/)
    .withMessage("At least one Uppercase")
    .matches(/(?=.*?[a-z])/)
    .withMessage("At least one Lowercase")
    .matches(/(?=.*?[0-9])/)
    .withMessage("At least one Number")
    .matches(/(?=.*?[#?!@$%^&*-])/)
    .withMessage("At least one special character")
    .not()
    .matches(/^$|\s+/)
    .withMessage("White space not allowed"),
  check("confirmpassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password Confirmation does not match password");
    }
    return true;
  }),
];

module.exports = { RegValidator };
