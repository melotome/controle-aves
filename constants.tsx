
import React from 'react';
import { LayoutDashboard, PlusCircle, History, BrainCircuit, Users, LogOut, Settings2 } from 'lucide-react';

export const APP_NAME = "AgroGeral Escolar";

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['admin', 'user'] },
  { id: 'records', label: 'Lançamentos', icon: <PlusCircle className="w-5 h-5" />, roles: ['admin', 'user'] },
  { id: 'history', label: 'Histórico', icon: <History className="w-5 h-5" />, roles: ['admin', 'user'] },
  { id: 'ai-advisor', label: 'IA Advisor', icon: <BrainCircuit className="w-5 h-5" />, roles: ['admin', 'user'] },
  { id: 'users', label: 'Usuários', icon: <Users className="w-5 h-5" />, roles: ['admin'] },
  { id: 'integration', label: 'Integração', icon: <Settings2 className="w-5 h-5" />, roles: ['admin'] },
];

export const COLORS = {
  primary: '#16a34a', // green-600
  secondary: '#475569', // slate-600
  background: '#f8fafc', // slate-50
  danger: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
};
