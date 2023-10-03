import { Router } from 'express';
import {
  createPost,
  getPosts,
  getUserPosts,
  likePost,
} from '../controllers/postController.js';
import verifyToken from '../middlewares/authMiddleware.js';

// router instance
const router = Router();

// ############## GET POSTS ##############
router.get('/', verifyToken, getPosts);

// ############## GET POST ################
router.get('/:userId/posts', verifyToken, getUserPosts);

// ########### CREATE POST ############
router.post('/create', verifyToken, createPost);

//  ############# LIKE A POST ################
router.patch('/:id/like', verifyToken, likePost);

export default router;
