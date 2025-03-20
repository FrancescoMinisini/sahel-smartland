
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border/40">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="relative w-8 h-8 overflow-hidden rounded-full bg-sahel-green">
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  G20
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base tracking-tight">SahelSmart</span>
                <span className="text-xs text-muted-foreground">Land Restoration</span>
              </div>
            </Link>
            
            <p className="text-sm text-muted-foreground mb-4">
              Leveraging earth observation data for sustainable land management in the Sahel region.
            </p>
            
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-sahel-green transition-colors" 
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-sahel-green transition-colors" 
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-sahel-green transition-colors" 
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a 
                href="mailto:info@sahelsmart.org" 
                className="text-muted-foreground hover:text-sahel-green transition-colors" 
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors">
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link to="/reports" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors">
                  Reports
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors flex items-center">
                  Documentation
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors flex items-center">
                  API Access
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors flex items-center">
                  Dataset Downloads
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors flex items-center">
                  Research Papers
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold mb-4">Partners</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.unccd.int/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors flex items-center">
                  UNCCD
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors flex items-center">
                  G20 Global Land Initiative
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="https://www.un.org/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors flex items-center">
                  United Nations
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-sahel-green transition-colors flex items-center">
                  Earth Observatory
                  <ExternalLink size={12} className="ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SahelSmart Land Restoration. All rights reserved.
            </p>
            
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-sahel-green transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-sahel-green transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-xs text-muted-foreground hover:text-sahel-green transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
