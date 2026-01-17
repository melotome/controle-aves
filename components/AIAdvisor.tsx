
import React, { useState, useEffect } from 'react';
import { EggRecord } from '../types';
import { GeminiService } from '../services/geminiService';
import { Sparkles, Loader2, BrainCircuit, RefreshCw, Quote } from 'lucide-react';

interface AIAdvisorProps {
  records: EggRecord[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ records }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    const result = await GeminiService.analyzeData(records);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    if (records.length > 0 && !analysis) {
      runAnalysis();
    }
  }, [records]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Conselheiro IA</h2>
              <p className="text-green-100 text-sm">Insights inteligentes baseados nos dados da escola</p>
            </div>
          </div>
          
          <button
            onClick={runAnalysis}
            disabled={loading || records.length === 0}
            className="flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            {analysis ? 'Recalcular Análise' : 'Gerar Insights Agora'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center text-slate-500 shadow-sm">
          <div className="relative w-20 h-20 mb-4">
            <Loader2 className="w-full h-full text-green-600 animate-spin" />
            <Sparkles className="absolute top-0 right-0 w-6 h-6 text-amber-500 animate-pulse" />
          </div>
          <p className="font-semibold text-lg">Gemini está analisando seu plantel...</p>
          <p className="text-sm">Isso pode levar alguns segundos.</p>
        </div>
      ) : analysis ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Relatório de Inteligência
            </div>
            <span className="text-xs text-slate-400 font-medium">Análise em tempo real</span>
          </div>
          <div className="p-8">
            <div className="relative">
              <Quote className="absolute -top-4 -left-4 w-12 h-12 text-slate-100 -z-0" />
              <div className="relative z-10 prose prose-slate max-w-none">
                {analysis.split('\n').map((line, i) => (
                  <p key={i} className={`mb-4 text-slate-700 leading-relaxed ${line.startsWith('#') || line.includes(':') ? 'font-bold text-slate-900' : ''}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start">
              <div className="text-amber-600 mt-0.5">⚠️</div>
              <p className="text-xs text-amber-800 font-medium">
                Nota: Esta análise é baseada em dados estatísticos e algoritmos de IA. Sempre consulte o seu instrutor técnico ou veterinário para decisões críticas de manejo.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center text-slate-400 shadow-sm">
          <BrainCircuit className="w-16 h-16 opacity-10 mb-4" />
          <p className="font-medium">Nenhuma análise gerada para os registros atuais</p>
        </div>
      )}
    </div>
  );
};
