const express = require("express");
const {
  requestStudentAccess,
  getStudent,
  sendStudentsOTP,
  verifyStudentOTP,
  getLoginStudentDetails,
} = require("../controllers/students/studentsController");
const {
  default: authenticateTokenForStudent,
} = require("../middleware/auhtenticationMiddleware");

const router = express.Router();

router.post("/register-student", requestStudentAccess);
router.get("/students", getStudent);
router.post("/send-student-otp", sendStudentsOTP);
router.post("/verify-student-otp", verifyStudentOTP);
router.post(
  "/get-login-student-details",
  authenticateTokenForStudent,
  getLoginStudentDetails
);

module.exports = router;
