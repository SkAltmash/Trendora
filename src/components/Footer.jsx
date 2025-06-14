import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/animatedGradient.css';

const Footer = () => {
  return (
    <footer className="footer-animated text-white py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        
        {/* Left: Logo/Brand */}
        <div className="text-xl font-bold tracking-wide">
          Trendora
        </div>

        {/* Right: Social Icons */}
        <div className="flex space-x-4 text-xl">
          <a href="https://github.com/SkAltmash" target="_blank" rel="noreferrer" className="hover:text-black transition">
            <i className="fab fa-github"></i>
          </a>
          <a href="https://linkedin.com/in/altamash-sheikh-1ba6a72aa" target="_blank" rel="noreferrer" className="hover:text-black transition">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="https://www.instagram.com/sk_altamash18/" target="_blank" rel="noreferrer" className="hover:text-black transition">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>

      <div className="text-center text-xs mt-6 opacity-80">
        © {new Date().getFullYear()} Trendora. Built with ❤️ by Altamash Sheikh.
      </div>
    </footer>
  );
};

export default Footer;
