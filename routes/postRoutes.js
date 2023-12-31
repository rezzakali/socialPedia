import { Router } from 'express';
import {
  addComment,
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
router.get('/:userId', verifyToken, getUserPosts);

// ########### CREATE POST ############
router.post('/create-post', verifyToken, createPost);

//  ############# LIKE A POST ################
router.patch('/:postId/like', verifyToken, likePost);

// ############ ADD COMMENT #################
router.patch('/:postId/add-comment', verifyToken, addComment);

export default router;
