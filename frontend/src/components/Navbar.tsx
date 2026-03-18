// import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Rocket } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 dark:bg-slate-900/70 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hover:scale-105 transition-transform">
          <Rocket className="text-purple-600" />
          Primetrade Task
        </Link>
        <div>
          {user ? (
            <div className="flex items-center gap-6">
              <span className="font-medium hidden sm:inline-block">Welcome, <span className="text-purple-600 dark:text-purple-400">{user.name}</span></span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-100 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl transition-all font-semibold shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-5 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors">Login</Link>
              <Link to="/register" className="px-5 py-2 font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:shadow-lg hover:opacity-90 transition-all">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
