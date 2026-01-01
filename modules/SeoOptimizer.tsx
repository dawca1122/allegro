import React, { useState } from 'react';
import { LineChart, Sparkles, Check, X, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { SeoSuggestion } from '../types';

const MOCK_SUGGESTIONS: SeoSuggestion[] = [
  {
    id: 'seo-1',
    img: 'placeholder',
    currentTitle: 'Patelnia Tefal 28cm czarna do kuchni',
    suggestedTitle: 'Patelnia Tefal 28cm Indukcja Nieprzywierająca Non-Stick',
    newKeywords: ['Indukcja', 'Nieprzywierająca', 'Non-Stick'],
    reason: 'Brak kluczowych parametrów technicznych (Indukcja)',
    confidenceScore: 98,
    status: 'pending'
  },
  {
    id: 'seo-2',
    img: 'placeholder',
    currentTitle: 'Zestaw Kosmetyków Damskich SPA',
    suggestedTitle: 'Zestaw Kosmetyków Damskich SPA Na Prezent Świąteczny',
    newKeywords: ['Na', 'Prezent', 'Świąteczny'],
    reason: 'Sezon: Słowo "Prezent" trenduje +150% w tej kategorii',
    confidenceScore: 92,
    status: 'pending'
  },
  {
    id: 'seo-3',
    img: 'placeholder',
    currentTitle: 'Dla dzieci klocki LEGO Technic Auto Wyścigowe',
    suggestedTitle: 'Klocki LEGO Technic Auto Wyścigowe Zestaw Dla Dzieci',
    newKeywords: ['Klocki', 'Zestaw'], // Logic note: effectively a reorder + capitalization fix
    reason: 'Optymalizacja kolejności słów (Rzeczownik na początku)',
    confidenceScore: 85,
    status: 'pending'
  }
];

export const SeoOptimizer = () => {
  const [suggestions, setSuggestions] = useState<SeoSuggestion[]>(MOCK_SUGGESTIONS);

  const handleAction = (id: string, action: 'accepted' | 'rejected') => {
    setSuggestions(prev => prev.map(item => 
      item.id === id ? { ...item, status: action } : item
    ));
  };

  const handleBulkAccept = () => {
    setSuggestions(prev => prev.map(item => 
      item.confidenceScore > 90 && item.status === 'pending' 
        ? { ...item, status: 'accepted' } 
        : item
    ));
  };

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LineChart className="text-purple-400" />
            SEO Autopilot
          </h2>
          <p className="text-slate-400">Cykliczna optymalizacja trwających ofert.</p>
        </div>
        
        <div className="flex gap-4 items-center">
           <div className="text-right">
             <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Ostatni Audyt</div>
             <div className="text-emerald-400 font-mono">Dzisiaj, 04:00</div>
           </div>
           <button 
             onClick={handleBulkAccept}
             className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
           >
             <Sparkles size={18} />
             Akceptuj pewne ({suggestions.filter(s => s.status === 'pending' && s.confidenceScore > 90).length})
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
           <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
             <Activity size={24} />
           </div>
           <div>
             <div className="text-2xl font-bold text-white">{pendingCount}</div>
             <div className="text-xs text-slate-400">Ofert do poprawy</div>
           </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
           <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
             <TrendingUp size={24} />
           </div>
           <div>
             <div className="text-2xl font-bold text-white">+12%</div>
             <div className="text-xs text-slate-400">Prognozowany wzrost kliknięć</div>
           </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
         <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
            <h3 className="font-bold text-white">Sugestie Optymalizacji</h3>
            <span className="text-xs text-slate-500">Sortuj wg: Pewności (Malejąco)</span>
         </div>

         <div className="divide-y divide-slate-800">
            {suggestions.filter(s => s.status === 'pending').length === 0 && (
               <div className="p-10 text-center text-slate-500">
                  <Check size={48} className="mx-auto mb-4 text-emerald-500/50" />
                  <p>Wszystkie oferty są zoptymalizowane!</p>
               </div>
            )}

            {suggestions.filter(s => s.status === 'pending').map((item) => (
              <div key={item.id} className="p-6 hover:bg-slate-800/30 transition-colors group">
                <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
                  
                  {/* Current State */}
                  <div className="flex-1 min-w-[300px]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-slate-800 rounded border border-slate-700 flex-shrink-0"></div>
                      <span className="text-xs text-slate-500 uppercase font-semibold">Aktualny Tytuł</span>
                    </div>
                    <p className="text-slate-400 line-through decoration-slate-600 decoration-1 text-sm md:text-base">
                      {item.currentTitle}
                    </p>
                  </div>

                  <ArrowRight className="text-slate-600 hidden xl:block" />

                  {/* Suggested State */}
                  <div className="flex-1 min-w-[300px]">
                     <div className="flex items-center gap-3 mb-2">
                       <span className="text-xs text-emerald-400 uppercase font-semibold flex items-center gap-1">
                         <Sparkles size={12} />
                         Sugerowany Tytuł
                       </span>
                       <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                         item.confidenceScore > 90 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                       }`}>
                         Pewność: {item.confidenceScore}%
                       </span>
                     </div>
                     <p className="text-white text-base font-medium">
                       {item.suggestedTitle.split(' ').map((word, idx) => {
                         // Simple check if word is in newKeywords (case insensitive cleanup for demo)
                         const cleanWord = word.replace(/[^\w\s\u00C0-\u017F]/g, ''); 
                         const isNew = item.newKeywords.some(kw => cleanWord.toLowerCase().includes(kw.toLowerCase()));
                         
                         return (
                           <span key={idx} className={isNew ? "text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded mx-0.5" : "text-slate-200 mx-0.5"}>
                             {word}
                           </span>
                         );
                       })}
                     </p>
                     <p className="mt-2 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 p-2 rounded inline-block">
                       💡 {item.reason}
                     </p>
                  </div>

                  {/* Actions */}
                  <div className="flex xl:flex-col gap-2 w-full xl:w-auto mt-4 xl:mt-0">
                    <button 
                      onClick={() => handleAction(item.id, 'accepted')}
                      className="flex-1 xl:w-32 flex items-center justify-center gap-2 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
                    >
                      <Check size={16} /> Akceptuj
                    </button>
                    <button 
                      onClick={() => handleAction(item.id, 'rejected')}
                      className="flex-1 xl:w-32 flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 px-4 py-2 rounded-lg border border-slate-700 transition-colors text-sm font-medium"
                    >
                      <X size={16} /> Odrzuć
                    </button>
                  </div>

                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};