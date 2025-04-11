const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  phone: String,
  subject: String,
  qualification: String,
  experience: Number,
  gender: String,
  dob: String,
  address: String,
  joiningDate: String,
  countryCode: String,
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
    required: true,
  },
  profilePicture: String,
  status: String,
  createdAt: String,
});

const classSchema = new mongoose.Schema({
  id: String,
  name: String,
  section: String,
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "school",
  },
  classTeacher: String,
  classTeacherId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  strength: Number,
  createdAt: String,
});

module.exports = { teacherSchema, classSchema };
