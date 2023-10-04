import { Schema, model } from 'mongoose';

const postSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    location: String,
    description: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: {
      type: Array,
      default: [],
    },
    postImageUrl: {
      type: String,
      required: true,
    },
    userImageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Post = model('Post', postSchema);

export default Post;
