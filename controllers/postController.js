import { body, validationResult } from 'express-validator';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import cloudinary from '../utility/cloudinaryConfig.js';
import upload from '../utility/uploader.js';

// ################## CREATE POST #################
export const createPost = [
  upload,
  body('userId').notEmpty().withMessage('userId is required!'),
  body('description').notEmpty().withMessage('Description is required!'),

  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // cloudinary file setup
      let cloudinaryResponse;

      if (req.file) {
        // Upload the image to Cloudinary
        cloudinaryResponse = await cloudinary.uploader.upload(
          `data:image/png;base64,${req.file.buffer.toString('base64')}`
        );
      }

      // destructuring userId,description from req.body
      const { userId, description } = req.body;

      // find user by userId
      const user = await User.findById({ _id: userId });

      // destructuring properties from user
      const { firstname, lastname, location, profileImage } = user || {};

      // create new post
      const newPost = new Post({
        userId,
        firstname,
        lastname,
        location,
        description,
        postImageUrl: cloudinaryResponse ? cloudinaryResponse.secure_url : null,
        userImageUrl: profileImage,
        likes: {},
        comments: [],
      });

      // finally save the newPost to database
      await newPost.save();

      // find all posts from post collection
      const posts = await Post.find({});

      // finally return response with the posts
      return res.status(201).json({ status: true, posts });
    } catch (error) {
      // return error response
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
  },
];

// ################## GET POSTS #################
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({});
    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ################## GET USER POSTS #################
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId });
    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ################## LIKE A POST #################
export const likePost = async (req, res) => {
  try {
    // postId
    const { postId } = req.params;

    // userId
    const { userId } = req.body;

    // find post by postId
    const post = await Post.findById({ _id: postId });

    // check if user liked the post
    const isLiked = post.likes.get(userId);

    // if user liked the post, then delete it from the post.likes
    // else set teh userId (who like it)
    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    // And finally update the post (liked post) and return the new post
    const updatedPost = await Post.findByIdAndUpdate(
      { _id: postId },
      { likes: post.likes },
      { new: true }
    );

    // return the response with the updatedPost
    return res.status(200).json({
      success: true,
      updatedPost,
    });
  } catch (error) {
    // return error response
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
