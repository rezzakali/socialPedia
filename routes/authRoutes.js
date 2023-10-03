import { Router } from 'express';
import {
  loginController,
  registerController,
} from '../controllers/authController.js';

// router instance
const router = Router();

// sing up
router.post('/signup', registerController);

// sign in
router.post('/signin', loginController);

export default router;
