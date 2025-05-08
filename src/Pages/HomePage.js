import { useState } from "react";
import Post from "../components/Post";
import { posts } from "../data/posts";
import "../styles/HomePage.css";

const HomePage = () => {
  // Trier les posts par date (du plus récent)
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Gérer le chargement dynamique
  const [visiblePosts, setVisiblePosts] = useState(3);
  const loadMorePosts = () => setVisiblePosts(prev => prev + 3);

  return (
    <div className="homepage">
      <div className="post-feed">
        {sortedPosts.slice(0, visiblePosts).map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>

      {visiblePosts < sortedPosts.length && (
        <button className="load-more-btn" onClick={loadMorePosts}>
          Charger plus de posts
        </button>
      )}
    </div>
  );
};

export default HomePage;