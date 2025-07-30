import express from "express";
import {getHomePage, getUsers, login, registerUser} from "../controller/user_controllers.js";

const router = express.Router();

router.get("/", getHomePage);
router.get("/users",
    // authenticateToken,       // uncomment to authenticate user request, only removed for testing
    getUsers
)
router.post("/register", registerUser);
router.post("/login", login);

export default router;