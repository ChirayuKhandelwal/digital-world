import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login, loginWithGoogle, resetPassword, sendOTP, verifyOTP } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOtpMode) {
      if (!otpSent) {
        const success = await sendOTP(email);
        if (success) {
          setOtpSent(true);
          setMessage('OTP sent! Please check your email.');
          setError('');
        } else {
          setError('Failed to send OTP. Please try again or wait a few minutes if rate-limited.');
        }
      } else {
        const success = await verifyOTP(email, otpCode);
        if (success) {
          navigate('/');
        } else {
          setError('Invalid or expired OTP.');
        }
      }
    } else {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
        setPassword('');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-xl shadow-black/5"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-electric/10 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-electric" />
          </div>
          <h2 className="text-3xl font-bold text-midnight">Welcome Back</h2>
          <p className="mt-2 text-sm text-coolgrey">
            Sign in to your DIGITAL WORLD account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-coolgrey mb-1">Email</label>
              <input
                type="email"
                required
                className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-midnight focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric sm:text-sm transition-all"
                placeholder="admin@digitalworld.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
              />
            </div>

            {!isOtpMode ? (
              <div>
                <label className="block text-sm font-medium text-coolgrey mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-midnight focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric sm:text-sm transition-all"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsOtpMode(true); setError(''); setMessage(''); }}
                    className="text-sm font-medium text-coolgrey hover:text-midnight transition-colors"
                  >
                    Login with OTP instead
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        setError('Please enter your email first to reset password');
                        setMessage('');
                        return;
                      }
                      setError('');
                      setMessage('');
                      const success = await resetPassword(email);
                      if (success) {
                        setMessage('Password reset email sent. Please check your inbox.');
                      } else {
                        setError('Failed to send reset email. Please verify your email address.');
                      }
                    }}
                    className="text-sm font-medium text-electric hover:text-electric/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            ) : otpSent ? (
              <div>
                <label className="block text-sm font-medium text-coolgrey mb-1">6-Digit Code</label>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-xl block w-full px-4 py-3 border border-gray-200 bg-gray-50 text-midnight focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric sm:text-sm transition-all tracking-[0.5em] text-center font-bold text-xl"
                  placeholder="------"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                />
                <div className="flex justify-start mt-2">
                  <button
                    type="button"
                    onClick={() => { setIsOtpMode(false); setOtpSent(false); setError(''); setMessage(''); }}
                    className="text-sm font-medium text-coolgrey hover:text-midnight transition-colors"
                  >
                    Back to password login
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-start mt-2">
                <button
                  type="button"
                  onClick={() => { setIsOtpMode(false); setError(''); setMessage(''); }}
                  className="text-sm font-medium text-coolgrey hover:text-midnight transition-colors"
                >
                  Back to password login
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          {message && (
            <div className="text-green-600 text-sm text-center bg-green-50 py-2 rounded-lg border border-green-100">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-electric hover:bg-electric/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric transition-all shadow-md shadow-electric/20"
            >
              {isOtpMode ? (otpSent ? 'Verify Code' : 'Send OTP') : 'Sign In'}
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
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-coolgrey">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-electric hover:text-electric/80 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
