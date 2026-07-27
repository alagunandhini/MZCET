const express = require("express");
const router = express.Router();
const { getDepartments, getYears, getStudents } = require("../controller/adminController");

// NOTE: these routes are not yet protected by any admin-only auth check.
// Right now anyone who knows the URL can hit them. Before this goes live,
// add an auth middleware here (e.g. a `role: "admin"` check, or separate
// admin credentials).

router.get("/departments", getDepartments);
router.get("/years", getYears);
router.get("/students", getStudents);

module.exports = router;