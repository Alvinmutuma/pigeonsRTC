import React from 'react';
import { Link } from 'react-router-dom';
import './CommentListItem.css';

const CommentListItem = ({ 
  comment, 
  onUpvoteComment, 
  onDeleteComment, 
  postAuthorId,
  isUpvoting, 
  isDeleting 
}) => {
  const { author, content, createdAt } = comment;

  if (!comment) {
    return null;
  }

  const canDelete = comment.author?.id === postAuthorId;

  return (
    <div className="comment-list-item">
      <div className="comment-author">
        {author ? (
          <Link to={`/user/${author.username}`}>{author.username}</Link>
        ) : (
          <span>Anonymous</span>
        )}
      </div>
      <div className="comment-content">
        <p>{content}</p>
      </div>
      <div className="comment-date">
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
      <div className="comment-actions">
        <button 
          onClick={() => onUpvoteComment(comment.id)} 
          className="btn-comment-action btn-upvote-comment"
          disabled={!comment.author || isUpvoting} 
        >
          {isUpvoting ? 'Voting...' : `Upvote (${comment.upvotes || 0})`}
        </button>
        {canDelete && (
          <button 
            onClick={() => onDeleteComment(comment.id)} 
            className="btn-comment-action btn-delete-comment"
            disabled={isDeleting} 
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentListItem;
