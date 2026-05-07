import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-black text-white px-6 py-3 flex items-center justify-between border-b border-gray-800">
      <Link to="/feed" className="text-xl font-bold">𝕏 OdinBook</Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/feed" className="hover:text-gray-300">Home</Link>
          <Link to="/explore" className="hover:text-gray-300">Explore</Link>
          <Link to="/users" className="hover:text-gray-300">Users</Link>
          <Link to={`/profile/${user.username}`} className="hover:text-gray-300">Profile</Link>
          <button onClick={handleLogout} className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold hover:bg-gray-200">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}