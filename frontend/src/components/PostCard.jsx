import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const liked = likes.some(l => l.userId === user?.id);

  const toggleLike = async () => {
    const res = await api.post(`/posts/${post.id}/like`);
    if (res.data.liked) setLikes([...likes, { userId: user.id }]);
    else setLikes(likes.filter(l => l.userId !== user.id));
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await api.post(`/posts/${post.id}/comments`, { content: commentText });
    setComments([...comments, res.data]);
    setCommentText('');
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/posts/${post.id}`);
    onDelete && onDelete(post.id);
  };

  return (
    <div className="border border-gray-800 rounded-xl p-4 mb-3 bg-black text-white hover:bg-gray-950 transition">
      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/profile/${post.author.username}`}>
          <img src={post.author.avatarUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + post.author.username}
            className="w-10 h-10 rounded-full" alt="" />
        </Link>
        <div>
          <Link to={`/profile/${post.author.username}`} className="font-semibold hover:underline">
            {post.author.displayName}
          </Link>
          <p className="text-gray-500 text-sm">@{post.author.username}</p>
        </div>
        {user?.id === post.author.id && (
          <button onClick={handleDelete} className="ml-auto text-gray-500 hover:text-red-500 text-sm">✕</button>
        )}
      </div>

      {/* Content */}
      <p className="mb-3 leading-relaxed">{post.content}</p>
      {post.imageUrl && <img src={post.imageUrl} className="rounded-xl mb-3 max-h-80 w-full object-cover" alt="" />}

      {/* Actions */}
      <div className="flex gap-6 text-gray-500 text-sm">
        <button onClick={() => setShowComments(!showComments)} className="hover:text-blue-400">
          💬 {comments.length}
        </button>
        <button onClick={toggleLike} className={`hover:text-pink-400 ${liked ? 'text-pink-500' : ''}`}>
          {liked ? '❤️' : '🤍'} {likes.length}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-3 border-t border-gray-800 pt-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2 mb-2 text-sm">
              <span className="font-semibold text-gray-300">@{c.author.username}</span>
              <span className="text-gray-400">{c.content}</span>
            </div>
          ))}
          <form onSubmit={submitComment} className="flex gap-2 mt-2">
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-3 py-1 text-sm text-white placeholder-gray-500 focus:outline-none" />
            <button type="submit" className="text-blue-400 text-sm font-semibold hover:text-blue-300">Post</button>
          </form>
        </div>
      )}
    </div>
  );
}