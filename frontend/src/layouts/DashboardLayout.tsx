import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutGrid } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <LayoutGrid className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-slate-900">Purple Merit</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm font-medium text-slate-700">
                  <UserIcon className="h-5 w-5 mr-1 text-slate-400" />
                  {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
