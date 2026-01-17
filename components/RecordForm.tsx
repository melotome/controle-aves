
import React, { useState } from 'react';
import { User } from '../types';
import { DataService } from '../services/dataService';
import { Save, ClipboardCheck, Info, Loader2 } from 'lucide-react';

interface RecordFormProps {
  user: User;
  onSuccess: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({ user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    birdCount: 0,
    totalEggs: 0,
    brokenEggs: 0,
    feedAm: 0,
    feedPm: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Agora aguardamos a execução (que inclui a tentativa de sync com AppSheet)
      await DataService.addRecord({
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        responsible: user.name
      });
      
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Erro ao processar registro. O dado foi salvo localmente.");
      onSuccess(); // Prossegue pois o dado é salvo localmente antes do erro de rede
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-green-600 text-white flex items-center gap-3">
          <ClipboardCheck className="w-6 h-6" />
          <h2 className="text-xl font-bold">Novo Lançamento Diário</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Data do Lançamento</label>
              <input
                type="date"
                required
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Número de Aves</label>
              <input
                type="number"
                required
                min="1"
                placeholder="0"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formData.birdCount || ''}
                onChange={e => setFormData({...formData, birdCount: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Total de Ovos Coletados</label>
              <input
                type="number"
                required
                placeholder="0"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formData.totalEggs || ''}
                onChange={e => setFormData({...formData, totalEggs: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Ovos Quebrados/Sujos (Perdas)</label>
              <input
                type="number"
                required
                placeholder="0"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                value={formData.brokenEggs || ''}
                onChange={e => setFormData({...formData, brokenEggs: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Ração Manhã (kg)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formData.feedAm || ''}
                onChange={e => setFormData({...formData, feedAm: parseFloat(e.target.value) || 0})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Ração Tarde (kg)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={formData.feedPm || ''}
                onChange={e => setFormData({...formData, feedPm: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Observações Extras</label>
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all min-h-[100px]"
              placeholder="Anote ocorrências especiais aqui..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sincronizando...</>
              ) : (
                <><Save className="w-5 h-5" /> Salvar Lançamento</>
              )}
            </button>
            <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 sm:w-1/3 border border-slate-100">
              <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Os dados são salvos localmente primeiro e depois enviados para a nuvem do AppSheet.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
