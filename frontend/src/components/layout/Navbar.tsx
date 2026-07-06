import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../common/Logo";
import Button from "../common/Button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll logic for sticky glass bar change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme management (persisted in body class)
  const toggleTheme = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Dashboard Preview", href: "#preview" },
    { name: "FAQs", href: "#faqs" },
  ];

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (location.pathname !== "/") {
      navigate("/");
      // Short delay to let page mount
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
        scrolled
          ? "py-4 glass-light dark:glass-dark shadow-md shadow-slate-200/10 dark:shadow-black/10"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo Link */}
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <Logo size="sm" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollToSection(e, link.href)}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-300 relative group"
            >
              {link.name}
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/login")}
          >
            Sign In
          </Button>

          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate("/register")}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button & Theme Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-pointer"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Framer Motion Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg overflow-hidden shadow-lg"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollToSection(e, link.href)}
                  className="text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-1 border-b border-slate-100 dark:border-slate-900"
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col gap-3.5 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/login");
                  }}
                  className="w-full"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight size={18} />}
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/register");
                  }}
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}