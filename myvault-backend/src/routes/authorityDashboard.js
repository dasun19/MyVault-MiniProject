const express = require("express");
const router = express.Router();
const { requireAuthority } = require("../middleware/authMiddleware");

// Authority dashboard route

router.get("/dashboard", requireAuthority, (req, res) => {
    try {
        res.json({
            success : true,
            message: "Authority Dashboard Data",
            data : {
                adminId: req.authority._id,
                username: req.authority.username,
                role: req.authority.role

            }
        });
    } catch(error){
        console.error("Authority error: ", error);
        res.status(500).json({ message: "server error" });
    }
});

module.exports = router;