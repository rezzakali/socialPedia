import { Router } from 'express';
import {
  addRemoveFriend,
  getUser,
  getUserFriends,
} from '../controllers/userController.js';
import verifyToken from '../middlewares/authMiddleware.js';

// router instance
const router = Router();

// ################ GET USER ##############
router.get('/:id', verifyToken, getUser);

// #################### GET USER FRIEND ################
router.get('/:id/friends', verifyToken, getUserFriends);

// ################### UPDATE || ADD FRIEND ##############
router.patch('/:id/:friendId', verifyToken, addRemoveFriend);

export default router;
