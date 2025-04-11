const express = require("express");

const {
  registerSchool,
  getSchoolList,
  loginWithSchool,
  getPendingStudents,
  updateStudentRequestStatus,
  getApprovedStudents,
  removeStudentFromSchool,
  getSchoolDetailsById,
  addTeachersInSchool,
  getTeachersInSchool,
  addClassToSchool,
  getSchoolClasses,
} = require("../controllers/schoolController");
const {
  default: authenticateToken,
} = require("../middleware/auhtenticationMiddleware");
const {
  default: authenticateTokenForSchool,
} = require("../middleware/autheticateMiddlewareForSchool");

const router = express.Router();

router.post("/register", registerSchool);
router.get("/getSchoolList", getSchoolList);
router.post("/login", loginWithSchool);
router.get("/getPendingStudents", getPendingStudents);
router.put("/updateStudentRequestStatus", updateStudentRequestStatus);
router.get("/getApprovedStudents", getApprovedStudents);
router.delete("/removeStudentFromSchool/:id", removeStudentFromSchool);
router.post(
  "/get-school-details-by-id",
  authenticateTokenForSchool,
  getSchoolDetailsById
);
router.post(
  "/add-school-teachers",
  authenticateTokenForSchool,
  addTeachersInSchool
);
router.get(
  "/get-school-teachers/:schoolId",
  authenticateTokenForSchool,
  getTeachersInSchool
);
router.post("/add-school-class", authenticateTokenForSchool, addClassToSchool);
router.get(
  "/get-school-clasess/:schoolId",
  authenticateTokenForSchool,
  getSchoolClasses
);

module.exports = router;
