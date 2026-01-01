import React from 'react';
import { Zap, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { mockRepricing } from '../services/mockApi';

export const Repricer = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-yellow-400 fill-yellow-400" />
            Drapieżny Repricing
          </h2>
          <p className="text-slate-400">Automatyzacja cen w oparciu o stany magazynowe konkurencji.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockRepricing.map((item) => {
          const isSurge = item.strategy === 'surge';
          
          return (
            <div key={item.id} className={`bg-slate-900 border rounded-xl overflow-hidden relative ${isSurge ? 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-slate-800'}`}>
              {/* Strategy Badge */}
              <div className="absolute top-4 right-4">
                 {isSurge ? (
                   <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                     <TrendingUp size={14} /> Price Surge Mode
                   </div>
                 ) : (
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                     <TrendingDown size={14} /> Undercut Mode
                   </div>
                 )}
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <span className="text-xs text-slate-500">ID: {item.id}</span>
                </div>

                <div className="md:col-span-1 text-center border-x border-slate-800">
                  <p className="text-xs text-slate-500 uppercase mb-1">Moja Cena</p>
                  <p className={`text-2xl font-bold font-mono ${isSurge ? 'text-purple-400' : 'text-emerald-400'}`}>
                    {item.myPrice.toFixed(2)} zł
                  </p>
                  {isSurge && <p className="text-[10px] text-purple-300/70">+15% vs standard</p>}
                </div>

                <div className="md:col-span-1 text-center">
                   <p className="text-xs text-slate-500 uppercase mb-1">Konkurencja</p>
                   <p className="text-xl font-bold text-slate-300 font-mono">{item.competitorPrice.toFixed(2)} zł</p>
                   <div className="flex justify-center items-center gap-1 mt-1">
                      <span className="text-xs text-slate-500">Stan:</span>
                      {item.competitorStock === 0 ? (
                        <span className="text-xs font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">BRAK (0 szt.)</span>
                      ) : (
                        <span className="text-xs font-medium text-slate-300">{item.competitorStock} szt.</span>
                      )}
                   </div>
                </div>

                <div className="md:col-span-1 flex flex-col items-end gap-2">
                   <div className="text-xs text-slate-500 flex items-center gap-1">
                     <AlertCircle size={12} /> Ostatnia zmiana: {item.lastUpdate}
                   </div>
                   <button className="text-sm font-medium text-slate-300 hover:text-white underline">
                     Historia Cen
                   </button>
                </div>
              </div>

              {isSurge && (
                <div className="bg-purple-500/10 px-6 py-2 border-t border-purple-500/20 flex items-center gap-2">
                   <Zap size={14} className="text-purple-400" />
                   <span className="text-xs text-purple-200">
                     Wykryto brak towaru u konkurencji! Cena została automatycznie podniesiona, aby zwiększyć marżę.
                   </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};