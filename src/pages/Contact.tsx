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
        <h1 className="text-4xl md:text-5xl font-bold text-midnight mb-4">Get In Touch</h1>
        <p className="text-lg text-coolgrey max-w-2xl mx-auto">
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
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl shadow-black/5">
            <h2 className="text-2xl font-bold text-midnight mb-6">Contact Details</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-electric/10 rounded-lg shrink-0">
                  <MapPin className="w-6 h-6 text-electric" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-midnight mb-1">Location</h3>
                  <p className="text-coolgrey">Lalsot, Dausa, (Raj.)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-electric/10 rounded-lg shrink-0">
                  <Phone className="w-6 h-6 text-electric" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-midnight mb-1">Phone</h3>
                  <p className="text-coolgrey">+91 8946850123</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-electric/10 rounded-lg shrink-0">
                  <Mail className="w-6 h-6 text-electric" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-midnight mb-1">Email</h3>
                  <p className="text-coolgrey">krishankhandelwal637@gmail.com</p>
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
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl shadow-black/5 h-full flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-midnight mb-6">Send us a Message</h2>
            
            {currentUser ? (
              success ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-electric/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-electric" />
                  </div>
                  <h3 className="text-2xl font-bold text-midnight">Message Sent!</h3>
                  <p className="text-coolgrey">Thank you for reaching out. We will get back to you shortly at {currentUser.email}.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-6 py-2 border border-electric text-electric rounded-xl hover:bg-electric hover:text-white transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-coolgrey">Sending as:</p>
                    <p className="text-midnight font-bold">{currentUser.name} <span className="text-gray-500 font-normal">({currentUser.email})</span></p>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-coolgrey mb-2">Your Message</label>
                    <textarea 
                      id="message" 
                      rows={6}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-midnight focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/50 transition-colors resize-none"
                      placeholder="How can we help you today?"
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-colors shadow-md shadow-electric/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                  </button>
                </form>
              )
            ) : (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-2xl bg-gray-50">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-coolgrey" />
                </div>
                <h3 className="text-xl font-bold text-midnight mb-2">Please sign in to send us a message</h3>
                <p className="text-coolgrey mb-6 max-w-sm mx-auto">This helps us keep track of your requests and get back to you faster.</p>
                <Link 
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-electric text-white font-bold rounded-xl hover:bg-electric/90 transition-colors shadow-md shadow-electric/20"
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
