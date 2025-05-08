import React from "react";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";
import { formatTimestamp } from "../utils/dateFrame";
import "../styles/Post.css";

const Post = ({ post }) => {
  return (
    <div className="post-container">
      <img 
        src={post.image} 
        alt={post.caption} 
        className="post-image" 
      />

      <div className="post-content">
        <p className="post-caption">{post.caption}</p>
        
        <div className="post-interactions">
          <LikeButton initialLikes={post.likes} />
          <CommentSection comments={post.comments} />
        </div>

        <p className="post-timestamp">
          🕒 {formatTimestamp(post.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default Post;