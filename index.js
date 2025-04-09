require("dotenv").config();
const express = require("express");
require("./src/db/db");
const bodyParser = require("body-parser");
const schoolRoutes = require("./src/routes/schoolRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

app.use("/api/schools", schoolRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
