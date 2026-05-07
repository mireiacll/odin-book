import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-sm px-8">
        <h1 className="text-white text-4xl font-bold mb-8 text-center">𝕏</h1>
        <h2 className="text-white text-2xl font-bold mb-6">Sign in to OdinBook</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input value={form.username} onChange={e => setForm({...form, username: e.target.value})}
            placeholder="Username" required
            className="bg-transparent border border-gray-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-blue-500" />
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            placeholder="Password" required
            className="bg-transparent border border-gray-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-blue-500" />
          <button type="submit" className="bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200">
            Sign in
          </button>
        </form>
        <p className="text-gray-500 mt-6 text-sm text-center">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}