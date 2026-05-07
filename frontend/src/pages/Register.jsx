import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-sm px-8">
        <h1 className="text-white text-4xl font-bold mb-8 text-center">𝕏</h1>
        <h2 className="text-white text-2xl font-bold mb-6">Create your account</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[['username','Username'],['email','Email'],['displayName','Display Name']].map(([key,label]) => (
            <input key={key} placeholder={label} value={form[key]}
              onChange={e => setForm({...form, [key]: e.target.value})} required={key !== 'displayName'}
              className="bg-transparent border border-gray-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-blue-500" />
          ))}
          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required
            className="bg-transparent border border-gray-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-blue-500" />
          <button type="submit" className="bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200">
            Sign up
          </button>
        </form>
        <p className="text-gray-500 mt-6 text-sm text-center">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}