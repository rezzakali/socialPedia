import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import cloudinary from '../utility/cloudinaryConfig.js';
import upload from '../utility/uploader.js';

export const registerController = [
  // Use multer middleware to handle file uploads first
  upload,

  // Validation checks using express-validator after multer
  body('firstname').notEmpty().withMessage('First name is required!'),
  body('lastname').notEmpty().withMessage('Last name is required!'),
  body('email').isEmail().withMessage('Invalid email address!'),
  body('location').notEmpty().withMessage('Location is required!'),
  body('username')
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage('Username is required!'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long!'),

  async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure properties from request body
    const {
      email,
      password,
      firstname,
      lastname,
      username,
      location,
      occupassion,
    } = req.body;

    try {
      // check if user already exists in the database
      const user = await User.findOne({ email });

      if (user) {
        return res.status(403).json({
          success: false,
          message: 'User already exists with this email!',
        });
      }

      //   hashed password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // cloudinary file setup
      let cloudinaryResponse;

      if (req.file) {
        // Upload the image to Cloudinary
        cloudinaryResponse = await cloudinary.uploader.upload(
          `data:image/png;base64,${req.file.buffer.toString('base64')}`
        );
      }

      const newUser = new User({
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
        location,
        occupassion,
        profileImage: cloudinaryResponse ? cloudinaryResponse.secure_url : null,
      });

      // Generate a token for the newly created user
      const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN, // 30 days
      });

      await newUser.save();

      // Set the token as a cookie in the response
      const options = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: false, // Set to true if using HTTPS
      };

      res.cookie('token', token, options);

      // send response
      res.status(201).json({
        success: true,
        message: 'User registered successfully!',
        token,
      });
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
];

export const loginController = [
  body('email').isEmail().withMessage('Invalid email address!'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long!'),
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // destructure email and password from request body
      const { email, password } = req.body;

      // check user with the email
      const user = await User.findOne({ email });

      // if no user
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Invalid credentials!',
        });
      }

      // compare the password
      const isValidPassword = await bcrypt.compare(password, user.password);

      // if the password is invalid
      if (!isValidPassword) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid credentials!' });
      }

      // generate a jwt token
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN, // 30 days
      });

      // Set the token as a cookie in the response
      const options = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: false, // Set to true if using HTTPS
      };

      res.cookie('token', token, options);

      // sending the final response to the client
      return res.status(200).json({
        success: true,
        message: 'Logged in success',
        token,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
];
