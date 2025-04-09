const express = require("express");
const {
  registerSchool,
  getSchoolList,
  loginWithSchool,
  getPendingStudents,
  updateStudentRequestStatus,
  getApprovedStudents,
  removeStudentFromSchool,
} = require("../controllers/schoolController");

const router = express.Router();

router.post("/register", registerSchool);
router.get("/getSchoolList", getSchoolList);
router.post("/login", loginWithSchool);
router.get("/getPendingStudents", getPendingStudents);
router.put("/updateStudentRequestStatus", updateStudentRequestStatus);
router.get("/getApprovedStudents", getApprovedStudents);
router.delete("/removeStudentFromSchool/:id", removeStudentFromSchool);

module.exports = router;
