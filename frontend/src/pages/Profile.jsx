import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/users/${username}`).then(res => setProfile(res.data));
  }, [username]);

  if (!profile) return <p className="text-white text-center mt-10">Loading...</p>;

  const isOwn = user?.username === username;

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="border border-gray-800 rounded-xl p-6 mb-4 bg-black text-white">
        <div className="flex items-center gap-4">
          <img src={profile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
            className="w-20 h-20 rounded-full" alt="" />
          <div>
            <h2 className="text-xl font-bold">{profile.displayName}</h2>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.bio && <p className="text-gray-300 text-sm mt-1">{profile.bio}</p>}
            <div className="flex gap-4 mt-2 text-sm text-gray-400">
              <span><strong className="text-white">{profile._count?.following}</strong> Following</span>
              <span><strong className="text-white">{profile._count?.followers}</strong> Followers</span>
              <span><strong className="text-white">{profile._count?.posts}</strong> Posts</span>
            </div>
          </div>
        </div>
        {isOwn && <p className="text-gray-500 text-sm mt-4">This is your profile.</p>}
      </div>

      {/* Posts */}
      {profile.posts?.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}