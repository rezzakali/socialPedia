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
        likes: [],
        comments: [],
      });

      // finally save the newPost to database
      await newPost.save();

      // Find all posts from the post collection and sort them by the most recent first
      const posts = await Post.find({}).sort({ createdAt: -1 });

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
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
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

    // find user by userId
    const user = await User.findById({ _id: userId });

    // extract email and profileImage from user
    const { email, profileImage, firstname, lastname } = user || {};
    const fullName = firstname + ' ' + lastname;

    // find post by postId
    const post = await Post.findById({ _id: postId });

    // find if the user already like the post
    const isLiked = post.likes.find((like) => like.email === email);

    // if he liked then remove it from likes array
    // else push the user's userId,email and profileImage to likes array
    if (isLiked) {
      post.likes = post.likes.filter((like) => like.email !== email);
    } else {
      // Initialize likes field if it's not already
      if (!post.likes) {
        post.likes = [];
      }
      post.likes.push({ userId, email, profileImage, name: fullName });
    }

    // Update the post (liked post) and save it
    await post.save();

    // Return the response with the updated post
    return res.status(200).json({
      success: true,
      updatedPost: post,
    });
  } catch (error) {
    // return error response
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ############## ADD COMMENT ################
export const addComment = async (req, res) => {
  try {
    // postId
    const { postId } = req.params;
    // destructure userId and comment from request-body
    const { userId, comment } = req.body;

    // find user by userId
    const user = await User.findById({ _id: userId });

    // extract email and profileImage from user
    const { firstname, profileImage } = user || {};

    // find post by postId
    const post = await Post.findById({ _id: postId });

    post.comments.push({
      postId,
      whoComment: firstname,
      comment,
      profileImage,
    });

    // save the updated post to db
    await post.save();

    // Return the response with the updated post
    return res.status(200).json({
      success: true,
      updatedPost: post,
    });
  } catch (error) {
    console.log(error);
    // return error response
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
