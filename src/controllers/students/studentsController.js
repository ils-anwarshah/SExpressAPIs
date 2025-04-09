const { default: mongoose } = require("mongoose");
const school = require("../../models/school");
const OTPRequest = require("../../models/OTPRequestSchema");
const { Student, StudentRequest } = require("../../models/studentsRegister");
const generateOTP = require("../../utils/generateOTP");
const jwt = require("jsonwebtoken");

exports.requestStudentAccess = async (req, res) => {
  try {
    const { studentName, age, grade, schoolId, mobileNumber, countryCode } =
      req.body;

    // Field-level validations
    if (!studentName) {
      return res
        .status(400)
        .json({ message: "Student name is required", code: "MISSING_NAME" });
    }
    if (!age) {
      return res
        .status(400)
        .json({ message: "Age is required", code: "MISSING_AGE" });
    }
    if (!grade) {
      return res
        .status(400)
        .json({ message: "Grade is required", code: "MISSING_GRADE" });
    }
    if (!schoolId) {
      return res
        .status(400)
        .json({ message: "School ID is required", code: "MISSING_SCHOOL_ID" });
    }
    if (!mobileNumber) {
      return res
        .status(400)
        .json({ message: "Mobile number is required", code: "MISSING_MOBILE" });
    }

    // ✅ Check if the provided schoolId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        message: "Invalid school ID format",
        code: "INVALID_SCHOOL_ID",
      });
    }

    const schoolExists = await school.findById(schoolId);
    if (!schoolExists) {
      return res.status(400).json({
        message: "Provided school ID does not exist.",
        code: "SCHOOL_NOT_EXISTS",
      });
    }

    const approvedStudent = await StudentRequest.findOne({
      countryCode,
      mobileNumber,
      schoolId: { $ne: schoolId },
      status: "A",
    });
    if (approvedStudent) {
      return res.status(400).json({
        message: "Already registered in a different school.",
        code: "ALREADY_APPROVED",
      });
    }

    // Check if mobile number is already pending or rejected in another school
    const existingStudent = await StudentRequest.findOne({
      countryCode,
      mobileNumber,
      schoolId: { $ne: schoolId },
    });
    if (existingStudent) {
      return res.status(400).json({
        message:
          "This mobile number is already registered with a different school.",
        code: "DUP_MOB",
      });
    }

    // Create and save new request
    const newRequest = new StudentRequest({
      studentName,
      age,
      grade,
      schoolId,
      mobileNumber,
      countryCode,
      status: "P",
    });
    await newRequest.save();

    res.status(201).json({
      message: "Student registration request submitted",
      request: newRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering student", error });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const { status, schoolId } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (schoolId) filter.schoolId = schoolId;

    const studentRequests = await StudentRequest.find(filter).populate(
      "schoolId",
      "name address"
    );

    res.status(200).json(studentRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching student requests", error });
  }
};

exports.sendStudentsOTP = async (req, res) => {
  try {
    const { mobileNumber, countryCode } = req.body;

    // Validate both mobileNumber and countryCode
    if (
      !mobileNumber ||
      typeof mobileNumber !== "string" ||
      !/^\d{7,15}$/.test(mobileNumber)
    ) {
      return res.status(400).json({
        message: "Valid mobile number is required",
        code: "INVALID_MOBILE",
      });
    }

    if (
      !countryCode ||
      typeof countryCode !== "string" ||
      !/^\+\d{1,4}$/.test(countryCode)
    ) {
      return res.status(400).json({
        message: "Valid country code is required (e.g. +91)",
        code: "INVALID_COUNTRY_CODE",
      });
    }

    // Check in approved students
    const student = await Student.findOne({ mobileNumber, countryCode });

    if (!student) {
      // Check in student request collection
      const studentRequest = await StudentRequest.findOne({
        mobileNumber,
        countryCode,
      });

      if (!studentRequest) {
        return res.status(404).json({
          message: "Mobile number not registered with any school.",
          code: "NOT_REGISTERED",
        });
      }

      if (studentRequest.status === "P") {
        return res.status(403).json({
          message: "Your request is pending school approval. Please wait.",
          code: "WAIT_FOR_APPROVAL",
        });
      }

      return res.status(403).json({
        message: "Invalid Mobile Number",
        code: "INVALID_MOB",
      });
    }

    const otp = generateOTP();
    console.log(`Sending OTP ${otp} to ${countryCode}${mobileNumber}`);

    // Save/update OTP record
    await OTPRequest.findOneAndUpdate(
      { mobileNumber, countryCode },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.verifyStudentOTP = async (req, res) => {
  try {
    const { mobileNumber, otp, countryCode } = req.body;

    // Validate input
    if (!mobileNumber || !otp || !countryCode) {
      return res.status(400).json({
        message: "Mobile number, country code, and OTP are required",
        code: "MISSING_FIELDS",
      });
    }

    // Check OTP record
    const record = await OTPRequest.findOne({ mobileNumber, countryCode });

    if (!record) {
      return res
        .status(400)
        .json({ message: "OTP expired or invalid", code: "OTP_NOT_FOUND" });
    }

    const now = new Date();
    const expiry = new Date(record.createdAt);
    expiry.setMinutes(expiry.getMinutes() + 5);

    if (now > expiry) {
      await OTPRequest.deleteOne({ mobileNumber, countryCode });
      return res
        .status(400)
        .json({ message: "OTP has expired", code: "OTP_EXPIRED" });
    }

    // Check if OTP matches
    if (record.otp !== otp) {
      return res
        .status(400)
        .json({ message: "Invalid OTP", code: "INVALID_OTP" });
    }

    // OTP verified, delete it
    await OTPRequest.deleteOne({ mobileNumber, countryCode });

    // Fetch student details
    const student = await Student.findOne({ mobileNumber, countryCode });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        code: "STUDENT_NOT_FOUND",
      });
    }
    const payload = {
      studentId: student._id,
      schoolId: student.schoolId,
      studentName: student.studentName,
      mobileNumber: student.mobileNumber,
      countryCode: student.countryCode,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_FOR_STUDENT, {
      expiresIn: "30d",
    });
    student.jwtToken = token;
    await student.save();

    return res.status(200).json({
      message: "OTP verified successfully",
      token: token,
      student: {
        _id: student._id,
        mobileNumber: student.mobileNumber,
        countryCode: student.countryCode,
      },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.getLoginStudentDetails = async (req, res) => {
  try {
    const { mobileNumber, countryCode } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        message: "Mobile number is required",
        code: "MISSING_MOBILE",
      });
    }

    const student = await Student.findOne({
      mobileNumber,
      countryCode,
    }).populate("schoolId", "-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        code: "STUDENT_NOT_FOUND",
      });
    }

    res.status(200).json({
      message: "Student details fetched successfully",
      student: {
        studentName: student.studentName,
        age: student.age,
        grade: student.grade,
        mobileNumber: student.mobileNumber,
        countryCode: student.countryCode,
        school: student.schoolId, // full school document
      },
    });
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
