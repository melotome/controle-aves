
import React, { useState, useMemo } from 'react';
import { EggRecord } from '../types';
import { PDFService } from '../services/pdfService';
import { Search, Filter, Trash2, FileText, Calendar, CloudCheck, CloudOff } from 'lucide-react';

interface HistoryTableProps {
  records: EggRecord[];
  onDelete: (id: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ records, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch = r.responsible.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStart = startDate ? new Date(r.date) >= new Date(startDate) : true;
      const matchEnd = endDate ? new Date(r.date) <= new Date(endDate) : true;
      return matchSearch && matchStart && matchEnd;
    });
  }, [records, searchTerm, startDate, endDate]);

  const quickFilter = (days: number | 'all') => {
    if (days === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const handleExport = () => {
    const range = {
      start: startDate || (records.length > 0 ? records[records.length-1].date : '-'),
      end: endDate || (records.length > 0 ? records[0].date : '-')
    };
    PDFService.generateReport(filteredRecords, range);
  };

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por responsável ou notas..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                className="p-2.5 rounded-xl border border-slate-200 outline-none text-sm"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
              <span className="text-slate-400">até</span>
              <input
                type="date"
                className="p-2.5 rounded-xl border border-slate-200 outline-none text-sm"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors shadow-sm ml-auto"
            >
              <FileText className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => quickFilter(7)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors">Últimos 7 dias</button>
          <button onClick={() => quickFilter(30)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors">Últimos 30 dias</button>
          <button onClick={() => quickFilter('all')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors">Tudo</button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ovos/Perdas</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Taxa Postura</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ração (kg)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sincronização</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-700">{new Date(record.date).toLocaleDateString('pt-BR')}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">{record.responsible}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{record.totalEggs} ovos</span>
                        <span className="text-xs text-red-500 font-medium">-{record.brokenEggs} perdas</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`
                        inline-flex px-2.5 py-1 rounded-full text-xs font-bold
                        ${record.postureRate > 85 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                      `}>
                        {record.postureRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-600">{record.totalFeed.toFixed(2)}kg</span>
                    </td>
                    <td className="px-6 py-4">
                      {record.synced ? (
                        <div className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                          <CloudCheck className="w-4 h-4" /> Cloud
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          <CloudOff className="w-4 h-4" /> Local
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => { if(confirm('Excluir este registro?')) onDelete(record.id) }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Filter className="w-12 h-12 opacity-10 mb-2" />
                      <p>Nenhum registro encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
