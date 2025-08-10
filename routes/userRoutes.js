const express = require("express");
const router = express.Router();
const { register, login, getUsers, getUserById, updateUserById, deleteUserById } = require("../controllers/userController");

router.get("/auth", getUsers);
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/:userId", getUserById);
router.put("/auth/:userId", updateUserById);
router.delete("/auth/:userId", deleteUserById);

module.exports = router;
