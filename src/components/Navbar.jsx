import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl text-gray-700"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <Link to="/" className="text-2xl font-bold text-indigo-600">
          TRENDORA
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li className="relative">
            <Link to="/cart" className="flex items-center">
              <FaShoppingCart className="mr-1" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
          </li>

          {!currentUser ? (
            <>
              <li>
                <Link to="/login">
                  <button className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded">Login</button>
                </Link>
              </li>
              <li>
                <Link to="/signup">
                  <button className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">Sign Up</button>
                </Link>
              </li>
            </>
          ) : (
            <li className="relative group">
              <img
                src={currentUser.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                alt="avatar"
                className="w-8 h-8 rounded-full cursor-pointer border-2 border-indigo-500"
              />
              <ul className="absolute hidden group-hover:block top-5 right-0 bg-white border shadow-md rounded w-40 z-50">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <Link to="/favorites">Favorites</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <Link to="/profile">Profile</Link>
                </li>
                {currentUser?.role === 'Admin' && (
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <Link to="/admin/dashboard">Dashboard</Link>
                  </li>
                )}
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
                  onClick={handleLogout}
                >
                  Logout
                </li>
              </ul>
            </li>
          )}
        </ul>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden`}
      >
        <div className="px-4 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold text-indigo-600">TRENDORA</h2>
          <button onClick={() => setMenuOpen(false)} className="text-xl text-gray-700">
            <FaTimes />
          </button>
        </div>
        <ul className="flex flex-col px-4 py-4 space-y-4 text-gray-700 font-medium">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link></li>
          <li className="flex items-center justify-between">
            <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center">
              <FaShoppingCart className="mr-2" /> Cart
            </Link>
            {cart.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </li>

          {!currentUser ? (
            <>
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded w-full">Login</button>
                </Link>
              </li>
              <li>
                <Link to="/signup" onClick={() => setMenuOpen(false)}>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded w-full">Sign Up</button>
                </Link>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center space-x-3">
                <img
                  src={currentUser.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-indigo-500"
                />
                <span>{currentUser.name || 'User'}</span>
              </li>
              <li>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 bg-indigo-100 hover:bg-indigo-200 rounded">Profile</button>
                </Link>
              </li>
              <li>
                <Link to="/favorites" onClick={() => setMenuOpen(false)}>
                  <button className="w-full px-4 py-2 bg-red-400 hover:bg-red-600 rounded">Favorites</button>
                </Link>
              </li>
              {currentUser?.role === 'Admin' && (
                <li>
                  <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>
                    <button className="w-full px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded text-indigo-800 font-semibold">
                      Admin Dashboard
                    </button>
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="w-full px-4 py-2 bg-red-100 hover:bg-red-200 rounded text-red-600">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}

export default Navbar;
