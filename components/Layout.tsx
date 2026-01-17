
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MENU_ITEMS, APP_NAME } from '../constants';
// Added PlusCircle to the lucide-react imports to fix the "Cannot find name" error
import { Menu, X, LogOut, ChevronRight, PlusCircle } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout, currentPage, setCurrentPage, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredMenu = MENU_ITEMS.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Brand */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">{APP_NAME}</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenu.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                  ${currentPage === item.id 
                    ? 'bg-green-50 text-green-700 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`${currentPage === item.id ? 'text-green-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
                {currentPage === item.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 uppercase font-medium">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h1 className="text-lg font-bold text-slate-800 lg:text-xl">
            {MENU_ITEMS.find(m => m.id === currentPage)?.label || 'Bem-vindo'}
          </h1>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400 font-medium">Hoje</p>
              <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
