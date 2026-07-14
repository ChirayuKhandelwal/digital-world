import { MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur-md pt-16 pb-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Shop Menu Section */}
          <div>
            <h3 className="text-white font-semibold mb-6">Shop Menu</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/#catalog" state={{ category: 'Refrigerators' }} className="hover:text-neon-cyan transition-colors">Refrigerators</Link></li>
              <li><Link to="/#catalog" state={{ category: 'Air Conditioners' }} className="hover:text-neon-cyan transition-colors">Air Conditioners</Link></li>
              <li><Link to="/#catalog" state={{ category: 'LED TVs' }} className="hover:text-neon-cyan transition-colors">LED TVs</Link></li>
              <li><Link to="/#catalog" state={{ category: 'Washing Machines' }} className="hover:text-neon-cyan transition-colors">Washing Machines</Link></li>
              <li><Link to="/#catalog" state={{ category: 'Air Coolers' }} className="hover:text-neon-cyan transition-colors">Air Coolers</Link></li>
              <li><Link to="/#catalog" state={{ category: 'Ceiling Fans' }} className="hover:text-neon-cyan transition-colors">Fans</Link></li>
              <li><Link to="/#catalog" state={{ category: 'Kitchen Appliances' }} className="hover:text-neon-cyan transition-colors">Kitchen Appliances</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-white font-semibold mb-6">Support</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/contact" className="hover:text-neon-cyan transition-colors">Contact Us</Link></li>
              <li><Link to="/contact" className="hover:text-neon-cyan transition-colors">Product Enquiry</Link></li>
              <li><Link to="/contact" className="hover:text-neon-cyan transition-colors">Wholesale Orders</Link></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Warranty Support</a></li>
              <li><a href="#" className="hover:text-neon-cyan transition-colors">Brand Installation Support</a></li>
            </ul>
          </div>

          {/* Contact Information Section */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact Information</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-neon-cyan shrink-0" />
                <span>Lalsot, Dausa, (Raj.)</span>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-neon-cyan shrink-0" />
                <span>+91 8946850123</span>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-neon-cyan shrink-0" />
                <span>krishankhandelwal637@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Copyright & Links */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-slate-500 text-sm">© 2026 Digital World. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:space-x-6 sm:gap-0 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
            <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
