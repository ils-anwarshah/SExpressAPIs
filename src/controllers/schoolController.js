const School = require("../models/school");
const bcrypt = require("bcryptjs");
const { StudentRequest, Student } = require("../models/studentsRegister");
const moment = require("moment");

exports.registerSchool = async (req, res) => {
  try {
    const {
      name,
      address,
      contact,
      email,
      countryCode,
      website,
      principal,
      establishedYear,
      board,
      password,
      studentCapacity,
    } = req.body;

    // Field-level validations with error codes
    if (!name) {
      return res
        .status(400)
        .json({ message: "School name is required", code: "MISSING_NAME" });
    }
    if (!address) {
      return res
        .status(400)
        .json({ message: "Address is required", code: "MISSING_ADDRESS" });
    }
    if (!contact) {
      return res
        .status(400)
        .json({ message: "Contact is required", code: "MISSING_CONTACT" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required", code: "MISSING_EMAIL" });
    }
    if (!principal) {
      return res.status(400).json({
        message: "Principal name is required",
        code: "MISSING_PRINCIPAL",
      });
    }
    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required", code: "MISSING_PASSWORD" });
    }
    if (!establishedYear) {
      return res.status(400).json({
        message: "Established year is required",
        code: "MISSING_ESTABLISHED_YEAR",
      });
    }
    if (!board) {
      return res
        .status(400)
        .json({ message: "Board is required", code: "MISSING_BOARD" });
    }
    if (!studentCapacity) {
      return res.status(400).json({
        message: "Student capacity is required",
        code: "MISSING_STUDENT_CAPACITY",
      });
    }

    const existingSchool = await School.findOne({ email });
    if (existingSchool) {
      return res.status(400).json({
        message: "A school with this email already exists",
        code: "DUP_EMAIL",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newSchool = new School({
      name,
      address,
      contact,
      countryCode,
      email,
      website,
      principal,
      establishedYear,
      board,
      password: hashedPassword,
      studentCapacity,
      status: "P", // Pending approval
    });

    await newSchool.save();

    res.status(201).json({
      message: "School registered successfully",
      school: newSchool,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getSchoolList = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) {
      filter.status = status;
    }
    const schools = await School.find(filter);
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schools", error });
  }
};

exports.loginWithSchool = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find school by email
    const school = await School.findOne({ email });

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, school.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check status
    if (school.status === "P") {
      return res
        .status(200)
        .json({ message: "Your request is pending approval" });
    }

    if (school.status === "A") {
      return res.status(200).json(school);
    }

    res.status(403).json({ message: "Your request was rejected" });
  } catch (error) {
    console.error("Error fetching school:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPendingStudents = async (req, res) => {
  try {
    const { schoolID } = req.query;
    if (!schoolID) {
      return res.status(400).json({ error: "schoolID is required" });
    }

    // Fetch students with matching schoolID and status P
    const students = await StudentRequest.find({
      schoolId: schoolID,
      status: "P",
    });

    if (students.length === 0) {
      return res.status(200).json({ message: "No pending students found" });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateStudentRequestStatus = async (req, res) => {
  try {
    const { studentID, status } = req.body;

    // Validate status
    if (!["A", "R"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'A' or 'R'." });
    }

    // Find the student request
    const studentRequest = await StudentRequest.findById(studentID);
    if (!studentRequest) {
      return res.status(404).json({ message: "Student request not found." });
    }

    // Update the request status and set updatedAt timestamp
    studentRequest.status = status;
    studentRequest.updatedAt = moment().toISOString();
    await studentRequest.save();

    // If status is "A" (Approved), create a new entry in Student collection
    if (status === "A") {
      const newStudent = new Student({
        studentName: studentRequest.studentName,
        age: studentRequest.age,
        grade: studentRequest.grade,
        schoolId: studentRequest.schoolId,
        countryCode: studentRequest.countryCode,
        status: "A",
        mobileNumber: studentRequest.mobileNumber,
        approvedAt: moment().toISOString(),
      });

      await newStudent.save();

      return res.status(200).json({
        message: "Student request approved and moved to students collection.",
        student: newStudent,
        updatedRequest: studentRequest,
      });
    }
    if (status === "R") {
      await StudentRequest.findByIdAndDelete(studentID);

      return res.status(200).json({
        message: "Student request has been rejected and removed.",
      });
    }
    // If status is "R" (Rejected), return confirmation (entry is not deleted)
    return res.status(200).json({
      message: "Student request status updated.",
      updatedRequest: studentRequest,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating student request status.", error });
  }
};

exports.getApprovedStudents = async (req, res) => {
  try {
    const { status, schoolId } = req.query;

    let filter = {};

    if (status) filter.status = "A";
    if (schoolId) filter.schoolId = schoolId;

    const studentRequests = await Student.find(filter).populate(
      "schoolId",
      "name address"
    );

    res.status(200).json(studentRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching student requests", error });
  }
};
exports.removeStudentFromSchool = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully", student });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
