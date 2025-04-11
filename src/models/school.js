const mongoose = require("mongoose");
const { teacherSchema, classSchema } = require("./teachersSchema");

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  countryCode: { type: String, required: true, default: "+91" },
  email: { type: String, required: true, unique: true },
  website: { type: String },
  token: { type: String },
  principal: { type: String, required: true },
  establishedYear: { type: Number, required: true },
  board: { type: String, required: true },
  password: { type: String, required: true },
  studentCapacity: { type: Number, required: true },
  status: { type: String, required: true },
  requestAt: { type: Date, default: Date.now },
  teachers: {
    type: [teacherSchema],
    default: [],
  },
  classes: {
    type: [classSchema],
    default: [],
  },
});

module.exports = mongoose.model("school", schoolSchema);
