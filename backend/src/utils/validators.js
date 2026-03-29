const { body, param } = require("express-validator");

const emailField = () =>
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email is too long");

const passwordSignup = () =>
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain a special character");

const signupValidators = [
  emailField(),
  passwordSignup(),
  body("firstName")
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("First name is too long"),
  body("lastName")
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage("Last name is too long"),
];

const loginValidators = [
  emailField(),
  body("password").trim().notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidators = [emailField()];

const resetPasswordValidators = [
  body("token").trim().notEmpty().withMessage("Token is required"),
  passwordSignup(),
];

const assessmentEmailValidators = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
];

const markActionValidators = [
  body("actionId").trim().notEmpty().isUUID().withMessage("Invalid action id"),
];

const checkoutValidators = [
  body("plan")
    .trim()
    .isIn(["monthly", "annual"])
    .withMessage("Plan must be monthly or annual"),
];

const profileUpdateValidators = [
  body("firstName")
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 100 }),
  body("lastName")
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .isLength({ max: 100 }),
  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 32 })
    .withMessage("Phone is too long"),
  body("dob")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Invalid date of birth"),
];

const newPasswordField = () =>
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain a special character");

const changePasswordValidators = [
  body("currentPassword").trim().notEmpty().withMessage("Current password is required"),
  newPasswordField(),
];

module.exports = {
  signupValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  assessmentEmailValidators,
  markActionValidators,
  checkoutValidators,
  profileUpdateValidators,
  changePasswordValidators,
  paramAssessmentId: () =>
    param("id").trim().isUUID().withMessage("Invalid assessment id"),
  paramRemediationAssessmentId: () =>
    param("assessmentId").trim().isUUID().withMessage("Invalid assessment id"),
  paramVerifyToken: () => param("token").trim().notEmpty().withMessage("Token is required"),
  paramResetToken: () => param("token").trim().notEmpty().withMessage("Token is required"),
};
