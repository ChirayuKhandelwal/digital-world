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
  const { register, loginWithGoogle } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/');
    } else {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-xl shadow-black/5"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-electric/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-electric" />
          </div>
          <h2 className="text-3xl font-bold text-midnight">Create Account</h2>
          <p className="mt-2 text-sm text-coolgrey">
            Join DIGITAL WORLD to unlock exclusive deals
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Full Name</label>
              <input
                type="text"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-midnight focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric sm:text-sm transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Email Address</label>
              <input
                type="email"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-midnight focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric sm:text-sm transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-midnight focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric sm:text-sm transition-all"
                value={formData.mobile}
                onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-midnight focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric sm:text-sm transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-electric hover:bg-electric/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric transition-all shadow-md shadow-electric/20"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-coolgrey">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={async () => {
                const success = await loginWithGoogle();
                if (success) navigate('/');
                else setError('Google sign-in failed. Please try again.');
              }}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-200 rounded-xl text-sm font-medium text-midnight bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-coolgrey">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-electric hover:text-electric/80 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
