const router = require("express").Router();
const ctrl   = require("../controllers/teamController");
const { protect, allow } = require("../middleware/auth");

router.get("/",           protect, ctrl.getAll);
router.get("/:id",        protect, ctrl.getById);
router.post("/",          protect, allow("participant"), ctrl.create);
router.post("/join",      protect, allow("participant"), ctrl.join);
router.post("/:id/leave", protect, allow("participant"), ctrl.leave);
router.post("/:id/submit",protect, allow("participant"), ctrl.submit);
router.patch("/:id",      protect, allow("admin"),       ctrl.update);

module.exports = router;
