import { useState, useEffect } from 'react';
import api from '../api';
import PostCard from '../components/PostCard';

export default function Explore() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/posts').then(res => setPosts(res.data));
  }, []);

  const handleDelete = (id) => setPosts(posts.filter(p => p.id !== id));

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h2 className="text-white text-xl font-bold mb-4">Explore</h2>
      {posts.map(p => <PostCard key={p.id} post={p} onDelete={handleDelete} />)}
    </div>
  );
}