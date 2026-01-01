import React, { useState } from 'react';
import { ScanSearch, Wand2, Copy, ArrowRight, BarChart3 } from 'lucide-react';

export const SeoTool = () => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | { oldTitle: string, newTitle: string, keywords: string[] }>(null);

  const handleAudit = () => {
    if (!url) return;
    setAnalyzing(true);
    // Simulate AI Delay
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        oldTitle: "Słuchawki bluetooth czarne do biegania",
        newTitle: "Słuchawki Bezprzewodowe Sportowe BLUETOOTH 5.3 Wodoodporne IPX7 + Powerbank",
        keywords: ["Bieganie", "Siłownia", "Mocny Bas", "Długi czas pracy", "Mikrofon HD"]
      });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-slate-800 border border-slate-700 mb-2">
           <ScanSearch className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-white">Klonowanie Ofert SEO</h2>
        <p className="text-slate-400">Wklej link do oferty konkurencji, a AI wygeneruje lepszy tytuł i słowa kluczowe.</p>
      </div>

      <div className="bg-slate-900 p-2 rounded-xl border border-slate-700 shadow-2xl flex gap-2">
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://allegro.pl/oferta/przykladowa-oferta-konkurencji-12345"
          className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder:text-slate-600"
        />
        <button 
          onClick={handleAudit}
          disabled={analyzing || !url}
          className="bg-primary hover:bg-sky-400 text-white px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {analyzing ? (
            <>Analiza...</>
          ) : (
            <>
              <Wand2 size={18} />
              Audytuj i Klonuj
            </>
          )}
        </button>
      </div>

      {analyzing && (
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="bg-primary h-full rounded-full animate-progress w-2/3"></div>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
          {/* Comparison Card */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               <BarChart3 className="text-emerald-500" />
               Wynik Optymalizacji
             </h3>
             
             <div className="space-y-6">
               <div className="group">
                  <div className="flex justify-between text-xs uppercase text-slate-500 font-semibold mb-2">
                    <span>Oryginalny Tytuł (Konkurencja)</span>
                    <span className="text-rose-400">Słaby (45/100)</span>
                  </div>
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg text-slate-400 line-through decoration-rose-500/50">
                    {result.oldTitle}
                  </div>
               </div>

               <div className="flex justify-center">
                  <ArrowRight className="text-slate-600 rotate-90 md:rotate-0" />
               </div>

               <div className="group">
                  <div className="flex justify-between text-xs uppercase text-slate-500 font-semibold mb-2">
                    <span>Sugerowany Tytuł (AI Optimized)</span>
                    <span className="text-emerald-400">Idealny (98/100)</span>
                  </div>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-300 font-medium shadow-[0_0_15px_rgba(16,185,129,0.1)] flex justify-between items-center">
                    {result.newTitle}
                    <button className="p-2 hover:bg-emerald-500/10 rounded-md transition-colors" title="Kopiuj">
                      <Copy size={16} />
                    </button>
                  </div>
               </div>
             </div>
          </div>

          {/* Keywords */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Wykryte Słowa Kluczowe</h3>
             <div className="flex flex-wrap gap-2">
               {result.keywords.map((kw, idx) => (
                 <span key={idx} className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm hover:border-primary/50 transition-colors cursor-default">
                   {kw}
                 </span>
               ))}
               <button className="px-3 py-1.5 rounded-full border border-dashed border-slate-600 text-slate-500 text-sm hover:text-white hover:border-slate-400 transition-colors">
                 + Dodaj własne
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};