const express = require("express");
const router = express.Router();
const { updateSchoolRequestStatus } = require("../controllers/admin/adminController");

router.put("/school-request/:requestId/status", updateSchoolRequestStatus);

module.exports = router;