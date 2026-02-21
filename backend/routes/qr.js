const router = require("express").Router();
const ctrl   = require("../controllers/qrController");
const { protect, allow } = require("../middleware/auth");

router.get("/my",          protect, allow("participant"), ctrl.getMyQR);
router.post("/scan-entry", protect, allow("admin"),       ctrl.scanEntry);
router.post("/scan-meal",  protect, allow("admin"),       ctrl.scanMeal);
router.get("/meal-stats",  protect, allow("admin"),       ctrl.getMealStats);
router.get("/entry-log",   protect, allow("admin"),       ctrl.getEntryLog);

module.exports = router;
