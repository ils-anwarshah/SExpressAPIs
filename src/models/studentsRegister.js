const mongoose = require("mongoose");

const studentRequestSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    age: { type: Number, required: true },
    mobileNumber: { type: String, required: true },
    countryCode: { type: String, required: true, default: "+91" },
    grade: { type: String, required: true },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
      required: true,
    },
    status: { type: String, enum: ["P", "A", "R"], default: "P" },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "student_requests" }
);

const studentSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    age: { type: Number, required: true },
    grade: { type: String, required: true },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "school",
      required: true,
    },
    status: { type: String, enum: ["A"], default: "A" },
    jwtToken: { type: String },
    mobileNumber: { type: String, required: true, unique: true },
    countryCode: { type: String, required: true, default: "+91" },
    enrolledAt: { type: Date, default: Date.now },
  },
  { collection: "students" }
);

const Student = mongoose.model("Student", studentSchema);

const StudentRequest = mongoose.model("StudentRequest", studentRequestSchema);

module.exports = { Student, StudentRequest }; // Export the models
