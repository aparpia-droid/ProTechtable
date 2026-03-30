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
    .matches(/^[+\d\s()\-]{7,32}$/)
    .withMessage("Phone must contain only digits, spaces, +, -, (, ) and be 7-32 characters"),
  body("dob")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date of birth must be YYYY-MM-DD")
    .custom((value) => {
      const date = new Date(`${value}T12:00:00Z`);
      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
      const year = date.getUTCFullYear();
      if (year < 1900 || year > new Date().getUTCFullYear()) {
        throw new Error("Date out of range");
      }
      return true;
    }),
];

const resendVerificationValidators = [emailField()];

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

const deleteAccountValidators = [
  body("password").trim().notEmpty().withMessage("Password is required to delete account"),
];

const familyEmailValidators = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email is too long"),
];

const familyVerifyValidators = [
  body("code")
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter the 6-digit code"),
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
  deleteAccountValidators,
  familyEmailValidators,
  familyVerifyValidators,
  paramAssessmentId: () =>
    param("id").trim().isUUID().withMessage("Invalid assessment id"),
  paramRemediationAssessmentId: () =>
    param("assessmentId").trim().isUUID().withMessage("Invalid assessment id"),
  paramVerifyToken: () => param("token").trim().notEmpty().withMessage("Token is required"),
  paramResetToken: () => param("token").trim().notEmpty().withMessage("Token is required"),
  resendVerificationValidators,
};
