const school = require("../../models/school");

exports.updateSchoolRequestStatus = async (req, res) => {
    try {
      const { requestId } = req.params;  // Get school request ID from URL params
      const { status } = req.body;  // Get status from request body
  
      // Validate status input
      if (!["A", "R", "P"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Use 'A' for approved or 'R' for rejected or 'P' for pending." });
      }
  
      // Find the school request
      const schoolRequest = await school.findById(requestId);
      if (!schoolRequest) {
        return res.status(404).json({ message: "School request not found." });
      }
  
      schoolRequest.status = status;
      await schoolRequest.save();
  
      // Response message
      const message = status === "A" ? "School request approved." : status === "P"  ? "School request pending.": "School request rejected.";
  
      return res.status(200).json({ message, schoolRequest });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error updating school request status.", error });
    }
  };