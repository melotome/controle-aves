
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DataService } from '../services/dataService';
import { UserPlus, Trash2, Shield, User as UserIcon, Lock } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: UserRole.USER
  });

  useEffect(() => {
    setUsers(DataService.getUsers());
  }, []);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData
    };
    DataService.saveUser(newUser);
    setUsers(DataService.getUsers());
    setShowAdd(false);
    setFormData({ username: '', password: '', name: '', role: UserRole.USER });
  };

  const handleDelete = (id: string) => {
    if (DataService.deleteUser(id)) {
      setUsers(DataService.getUsers());
    } else {
      alert("Não é possível remover o administrador padrão.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Controle de Acesso</h2>
          <p className="text-sm text-slate-500">Gerencie quem pode acessar e lançar dados no sistema</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          {showAdd ? 'Cancelar' : 'Novo Usuário'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nome Completo</label>
              <input
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Usuário (Login)</label>
              <input
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Senha</label>
              <input
                type="password"
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nível de Acesso</label>
              <select
                className="w-full p-3 rounded-xl border border-slate-200 outline-none"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
              >
                <option value={UserRole.USER}>Padrão (Lançamentos)</option>
                <option value={UserRole.ADMIN}>Administrador (Total)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-md transition-all">
                Salvar Novo Usuário
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${u.role === UserRole.ADMIN ? 'bg-slate-900' : 'bg-green-500'}`}>
                {u.role === UserRole.ADMIN ? <Shield className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-bold text-slate-800">{u.name}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">@{u.username} • {u.role}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(u.id)}
              disabled={u.username === 'admin'}
              className={`p-2 rounded-lg transition-colors ${u.username === 'admin' ? 'text-slate-200' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
