import { useState } from 'react';
import { PackageOpen, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth } from '../lib/firebase';

export function DeliveryVerify() {
  const [orderId, setOrderId] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !otp) return;

    setStatus('loading');
    setMessage('');

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/verify-delivery-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ orderId, otp })
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Delivery verified! Order marked as Delivered.');
        setOrderId('');
        setOtp('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed. Please check the OTP.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-electric/10 text-electric rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-midnight">Delivery Portal</h1>
          <p className="text-coolgrey mt-2">Verify customer OTP to complete delivery</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-midnight mb-2">Order ID</label>
            <div className="relative">
              <PackageOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Enter Order ID"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-midnight mb-2">Customer OTP</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-midnight focus:border-electric focus:ring-2 focus:ring-electric/50 focus:outline-none transition-all font-medium tracking-widest text-lg"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-start gap-3 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !orderId || !otp}
            className="w-full bg-electric text-white font-bold py-4 rounded-xl hover:bg-electric/90 transition-all shadow-lg shadow-electric/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
            ) : (
              'Verify Delivery'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
