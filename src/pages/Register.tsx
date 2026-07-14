import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { register } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = register(formData);
    if (success) {
      navigate('/');
    } else {
      setError('An account with this email already exists.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-slate-900/50 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-neon-cyan/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-neon-cyan" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Join DIGITAL WORLD to unlock exclusive deals
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan sm:text-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan sm:text-sm"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan sm:text-sm"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan sm:text-sm"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-950 bg-neon-cyan hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-cyan transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)]"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-neon-cyan hover:text-cyan-400 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
