import React, {useState} from 'react';
const CommentSection = ({ comments }) => {
    const [showAll, setShowAll] = useState(false);
    const visibleComments = showAll ? comments : comments.slice(0, 2);
  
    return (
      <div>
        {visibleComments.map((comment) => (
          <p key={comment.id}>{comment.text}</p>
        ))}
        <button onClick={() => setShowAll(!showAll)}>
          {showAll ? "Réduire" : "Voir tout"}
        </button>
      </div>
    );
  };