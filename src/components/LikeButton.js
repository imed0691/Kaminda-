import { useState } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";

const LikeButton = ({ initialLikes }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  return (
    <button onClick={handleLike}>
      {isLiked ? <FaHeart color="red" /> : <FaRegHeart />} {likes}
    </button>
  );
};

export default LikeButton;