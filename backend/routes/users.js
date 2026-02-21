const router = require("express").Router();
const ctrl   = require("../controllers/userController");
const { protect, allow } = require("../middleware/auth");

router.get("/",                protect, allow("admin"),        ctrl.getAll);
router.get("/mentors",         protect,                        ctrl.getMentors);
router.get("/dashboard-stats", protect, allow("admin"),        ctrl.dashboardStats);
router.patch("/:id/verify",    protect, allow("admin"),        ctrl.verify);
router.post("/assign-mentor",  protect, allow("admin"),        ctrl.assignMentor);

module.exports = router;
