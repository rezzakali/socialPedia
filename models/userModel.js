import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      minLength: 3,
    },
    lastname: {
      type: String,
      required: true,
      minLength: 3,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (value) => {
          const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          return emailRegex.test(value);
        },
        message: 'Enter a valid email address!',
      },
    },
    password: {
      type: String,
      required: [true, 'Enter your password!'],
      minLength: [6, 'Password must be 6 characters!'],
    },
    profileImage: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    occupassion: {
      type: String,
      default: 'Student',
    },
    friends: Array(),
    profileViews: {
      type: Number,
      default: Math.floor(Math.random() * 10000),
    },
    impression: {
      type: Number,
      default: Math.floor(Math.random() * 10000),
    },
  },
  { timestamps: true }
);

const User = model('User', userSchema);

export default User;
