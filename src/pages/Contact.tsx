import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export function Contact() {
  const { currentUser } = useAppContext();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !db) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "messages"), {
        uid: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        message,
        timestamp: new Date().toISOString()
      });
      setSuccess(true);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get In Touch</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          We're here to help. Reach out to us for support, inquiries, or feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-6">Contact Details</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded-lg shrink-0">
                  <MapPin className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Our Location</h3>
                  <p className="text-slate-400">New Colony, Lalsot<br/>Dausa, (Raj.)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded-lg shrink-0">
                  <Phone className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Phone Numbers</h3>
                  <p className="text-slate-400">+91 8946850123<br/>+91 7014342766<br/>+91 6350628179</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded-lg shrink-0">
                  <Mail className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Email Support</h3>
                  <p className="text-slate-400">krishankhandelwal637@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded-lg shrink-0">
                  <Clock className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Business Hours</h3>
                  <p className="text-slate-400">Monday - Friday: 9:00 AM - 8:00 PM<br/>Weekend: 10:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-md h-full flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            
            {currentUser ? (
              success ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                  <p className="text-slate-400">Thank you for reaching out. We will get back to you shortly at {currentUser.email}.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-6 py-2 border border-neon-cyan text-neon-cyan rounded-xl hover:bg-neon-cyan hover:text-slate-950 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/10">
                    <p className="text-sm text-slate-400">Sending as:</p>
                    <p className="text-white font-medium">{currentUser.name} <span className="text-slate-500">({currentUser.email})</span></p>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Your Message</label>
                    <textarea 
                      id="message" 
                      rows={6}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors resize-none"
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neon-cyan text-slate-950 font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)] disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                  </button>
                </form>
              )
            ) : (
              <div className="text-center py-12 border border-dashed border-white/20 rounded-2xl bg-slate-900/30">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Please sign in to send us a message</h3>
                <p className="text-slate-400 mb-6 max-w-sm mx-auto">This helps us keep track of your requests and get back to you faster.</p>
                <Link 
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-cyan text-slate-950 font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,243,255,0.4)]"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In to Continue
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
