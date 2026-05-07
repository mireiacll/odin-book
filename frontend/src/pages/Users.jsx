import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => { api.get('/users').then(res => setUsers(res.data)); }, []);

  const handleFollow = async (userId) => {
    try {
      await api.post(`/follows/${userId}`);
      setUsers(users.map(u => u.id === userId
        ? { ...u, followers: [{ status: 'accepted' }] } : u));
    } catch {}
  };

  const handleUnfollow = async (userId) => {
    await api.delete(`/follows/${userId}`);
    setUsers(users.map(u => u.id === userId ? { ...u, followers: [] } : u));
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h2 className="text-white text-xl font-bold mb-4">People you may know</h2>
      {users.map(u => {
        const following = u.followers?.length > 0;
        return (
          <div key={u.id} className="flex items-center gap-3 border border-gray-800 rounded-xl p-4 mb-3 bg-black">
            <Link to={`/profile/${u.username}`}>
              <img src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
                className="w-10 h-10 rounded-full" alt="" />
            </Link>
            <div className="flex-1">
              <Link to={`/profile/${u.username}`} className="text-white font-semibold hover:underline">
                {u.displayName}
              </Link>
              <p className="text-gray-500 text-sm">@{u.username}</p>
            </div>
            <button
              onClick={() => following ? handleUnfollow(u.id) : handleFollow(u.id)}
              className={`px-4 py-1 rounded-full text-sm font-semibold border ${
                following ? 'border-gray-600 text-white hover:border-red-500 hover:text-red-500'
                          : 'bg-white text-black hover:bg-gray-200'}`}>
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        );
      })}
    </div>
  );
}