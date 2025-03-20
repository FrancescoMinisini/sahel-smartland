
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X, Map, BarChart2, FileText, Home, ChevronRight } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: BarChart2 },
    { name: 'Map', path: '/map', icon: Map },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="relative w-10 h-10 overflow-hidden rounded-full bg-sahel-green">
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
              G20
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight">SahelSmart</span>
            <span className="text-xs text-muted-foreground">Land Restoration</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center space-x-1 font-medium text-sm transition-colors hover:text-primary",
                location.pathname === link.path 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <link.icon size={16} />
              <span>{link.name}</span>
              {location.pathname === link.path && (
                <div className="absolute bottom-0 h-0.5 w-full bg-primary mt-6 animate-fade-in" />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-foreground p-2 rounded-md"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg shadow-md animate-slide-in-right md:hidden">
          <nav className="container mx-auto py-4 px-6 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md transition-colors",
                  location.pathname === link.path 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <link.icon size={18} />
                  <span>{link.name}</span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
