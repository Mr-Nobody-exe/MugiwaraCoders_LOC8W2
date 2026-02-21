const router = require("express").Router();
const ctrl   = require("../controllers/evalController");
const { protect, allow } = require("../middleware/auth");

router.get("/leaderboard",       protect, ctrl.leaderboard);
router.get("/submissions",       protect, allow("admin", "judge"), ctrl.getSubmissions);
router.post("/score/:teamId",    protect, allow("judge"),          ctrl.score);
router.post("/shortlist",        protect, allow("admin"),          ctrl.shortlist);

module.exports = router;
