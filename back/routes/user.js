const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user");
const redirect = require("../middleware/redirect")

router.post("/signup", redirect, userCtrl.signup);
router.post("/login", redirect, userCtrl.login);

module.exports = router;