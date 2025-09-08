import express from 'express';
import verifyToken from "../middlewares/authMiddleware.js";
import { logout } from "../controllers/logoutController.js";
import { register, login } from '../controllers/authController.js';


const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post("/logout", verifyToken, logout);

export default router;





