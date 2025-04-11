import mongoose from "mongoose";

export default function validateID(schoolId) {
  if (!mongoose.Types.ObjectId.isValid(schoolId)) {
    return true;
  }
  return false;
}
