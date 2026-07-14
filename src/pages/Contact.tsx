import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export function Contact() {
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
                  <p className="text-slate-400">123 Innovation Drive<br/>Tech District, CA 90210</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded-lg shrink-0">
                  <Phone className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Phone Number</h3>
                  <p className="text-slate-400">+1 (555) 123-4567<br/>Mon-Fri 9am-6pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded-lg shrink-0">
                  <Mail className="w-6 h-6 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Email Address</h3>
                  <p className="text-slate-400">support@digitalworld.com<br/>sales@digitalworld.com</p>
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
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Your Message</label>
                <textarea 
                  id="message" 
                  rows={5}
                  required
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors resize-none"
                  placeholder="How can we help you today?"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neon-cyan text-slate-950 font-bold rounded-xl hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
