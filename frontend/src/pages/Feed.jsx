import { useState, useEffect } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const { user } = useAuth();

  useEffect(() => { fetchFeed(); }, []);

  const fetchFeed = async () => {
    const res = await api.get('/posts/feed');
    setPosts(res.data);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const res = await api.post('/posts', { content });
    setPosts([res.data, ...posts]);
    setContent('');
  };

  const handleDelete = (id) => setPosts(posts.filter(p => p.id !== id));

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Compose */}
      <div className="border border-gray-800 rounded-xl p-4 mb-4 bg-black">
        <div className="flex gap-3">
          <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`}
            className="w-10 h-10 rounded-full" alt="" />
          <form onSubmit={handlePost} className="flex-1">
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="What is happening?!"
              rows={3}
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg" />
            <div className="flex justify-end mt-2">
              <button type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-full text-sm disabled:opacity-50"
                disabled={!content.trim()}>
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts */}
      {posts.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
      {posts.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No posts yet. Follow some people or post something!</p>
      )}
    </div>
  );
}