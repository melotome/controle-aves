
import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { AppSheetConfig, EggRecord } from '../types';
import { Database, Link, ShieldCheck, AlertCircle, Save, CheckCircle2, CloudUpload, RefreshCw, History } from 'lucide-react';

export const IntegrationSettings: React.FC = () => {
  const [config, setConfig] = useState<AppSheetConfig>({
    appId: '',
    accessKey: '',
    tableName: 'Records',
    isEnabled: false
  });
  const [records, setRecords] = useState<EggRecord[]>([]);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{s: number, f: number} | null>(null);

  useEffect(() => {
    setConfig(DataService.getAppSheetConfig());
    setRecords(DataService.getRecords());
  }, []);

  const pendingCount = records.filter(r => !r.synced).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DataService.setAppSheetConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleManualSync = async () => {
    if (!config.appId || !config.accessKey) {
      alert("Configure o App ID e a Access Key primeiro.");
      return;
    }
    setSyncing(true);
    try {
      const result = await DataService.syncAllRecords();
      setSyncResult({ s: result.success, f: result.failed });
      setRecords(DataService.getRecords());
      setTimeout(() => setSyncResult(null), 5000);
    } catch (err: any) {
      alert("Erro na sincronização: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Sync Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Total Local</p>
            <p className="text-xl font-black text-slate-800">{records.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <CloudUpload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Pendentes</p>
            <p className="text-xl font-black text-slate-800">{pendingCount}</p>
          </div>
        </div>
        <button 
          onClick={handleManualSync}
          disabled={syncing || pendingCount === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-100 disabled:text-slate-400 text-white p-6 rounded-3xl shadow-lg transition-all flex items-center justify-center gap-3 font-bold group"
        >
          {syncing ? (
            <RefreshCw className="w-6 h-6 animate-spin" />
          ) : (
            <CloudUpload className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
          {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </button>
      </div>

      {syncResult && (
        <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">
            Sincronização concluída: <b>{syncResult.s}</b> enviados com sucesso. {syncResult.f > 0 && <span className="text-red-600">{syncResult.f} falhas.</span>}
          </p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-900 text-white flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Configuração de API</h2>
            <p className="text-slate-400 text-sm">Credenciais para conexão com AppSheet</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Link className={`w-6 h-6 ${config.isEnabled ? 'text-green-600' : 'text-slate-400'}`} />
              <div>
                <p className="font-bold text-slate-800">Sincronização Ativa</p>
                <p className="text-xs text-slate-500">Enviar automaticamente ao salvar</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={config.isEnabled}
                onChange={e => setConfig({...config, isEnabled: e.target.checked})}
              />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">App ID</label>
              <input
                type="text"
                placeholder="ID do aplicativo no AppSheet"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono text-sm"
                value={config.appId}
                onChange={e => setConfig({...config, appId: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Application Access Key</label>
              <input
                type="password"
                placeholder="Chave de acesso da API"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all font-mono text-sm"
                value={config.accessKey}
                onChange={e => setConfig({...config, accessKey: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nome da Tabela</label>
              <input
                type="text"
                placeholder="Ex: Records"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                value={config.tableName}
                onChange={e => setConfig({...config, tableName: e.target.value})}
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold uppercase tracking-wider">Verificação de Planilha:</p>
              <p>Os nomes das colunas na sua planilha devem ser exatamente: <code className="bg-amber-100 px-1 rounded">ID, Date, BirdCount, TotalEggs, BrokenEggs, FeedAM, FeedPM, Responsible, Notes, PostureRate, LossRate, TotalFeed</code>.</p>
            </div>
          </div>

          <button
            type="submit"
            className={`
              w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98]
              ${saved ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-800'}
            `}
          >
            {saved ? (
              <><CheckCircle2 className="w-6 h-6" /> Configurações Salvas!</>
            ) : (
              <><Save className="w-6 h-6" /> Salvar Configuração</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
