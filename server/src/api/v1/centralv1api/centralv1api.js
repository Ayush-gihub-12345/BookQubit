console.log("CentralV1API loaded");

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("CentralV1API");
});

module.exports = router;