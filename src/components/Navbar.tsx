
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ThemeToggle } from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/80 dark:bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-sahel-green dark:text-sahel-greenLight">Sahel</span>
            <span className="text-xl font-bold text-sahel-earth dark:text-sahel-sand">Restore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === "/" 
                  ? "text-sahel-green dark:text-sahel-greenLight font-semibold" 
                  : "text-gray-600 dark:text-gray-300 hover:text-sahel-earth dark:hover:text-sahel-sand"
              )}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === "/dashboard" 
                  ? "text-sahel-green dark:text-sahel-greenLight font-semibold" 
                  : "text-gray-600 dark:text-gray-300 hover:text-sahel-earth dark:hover:text-sahel-sand"
              )}
            >
              Dashboard
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="p-1"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-background shadow-lg">
          <div className="px-4 py-5 space-y-4">
            <Link 
              to="/" 
              className={cn(
                "block text-sm font-medium",
                location.pathname === "/" 
                  ? "text-sahel-green dark:text-sahel-greenLight font-semibold" 
                  : "text-gray-600 dark:text-gray-300"
              )}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={cn(
                "block text-sm font-medium",
                location.pathname === "/dashboard" 
                  ? "text-sahel-green dark:text-sahel-greenLight font-semibold" 
                  : "text-gray-600 dark:text-gray-300"
              )}
            >
              Dashboard
            </Link>
            <div className="pt-2">
              <Button variant="default" size="sm" className="w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
