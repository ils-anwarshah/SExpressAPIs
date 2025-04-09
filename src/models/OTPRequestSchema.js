// models/OTPRequest.js
const mongoose = require("mongoose");

const otpRequestSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
  },
  countryCode: { type: String, default: "+91" },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes TTL
  },
});

module.exports = mongoose.model("OTPRequest", otpRequestSchema);
