import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, User, Clock } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Check-in' },
    { path: '/ot-registration', icon: Clock, label: 'OT' },
    { path: '/employee-profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-md px-4 pb-4">
        <nav className="relative backdrop-blur-xl bg-white/70 border border-white/20 rounded-[2rem] shadow-2xl overflow-hidden">
          {/* Liquid glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 pointer-events-none" />
          
          {/* Navigation items */}
          <div className="relative flex justify-around items-center px-6 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110' 
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
