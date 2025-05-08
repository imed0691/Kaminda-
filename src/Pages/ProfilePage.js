import React from "react";
import { useParams } from "react-router-dom";
import { users } from "../data/users";
import { posts } from "../data/posts";

const ProfilePage = () => {
  const { userId } = useParams();
  const user = users.find((u) => u.id === Number(userId));
  const userPosts = posts.filter((p) => p.userId === Number(userId));

  return (
    <div>
      <h1>{user.username}</h1>
      <p>Posts: {userPosts.length} | Likes: {user.totalLikes}</p>
      <div className="post-grid">
        {userPosts.map((post) => (
          <img key={post.id} src={post.image} alt={post.caption} />
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;