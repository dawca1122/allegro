import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Send, RotateCcw, AlertTriangle } from 'lucide-react';
import { mockDisputes } from '../services/mockApi';

export const Disputes = () => {
  const [disputes, setDisputes] = useState(mockDisputes);

  const handleAction = (id: string, action: string) => {
    // Simulation of API call
    alert(`Wykonano akcję: ${action} dla dyskusji ${id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-rose-500" />
            Auto-Negocjator
          </h2>
          <p className="text-slate-400">Centrum zarządzania sporami z Allegro</p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-slate-300">Tryb Automatyczny:</span>
          <div className="w-10 h-5 bg-emerald-500/20 rounded-full border border-emerald-500/50 relative cursor-pointer">
            <div className="absolute right-1 top-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {disputes.map((dispute) => (
          <div key={dispute.id} className={`bg-slate-900 border ${dispute.status === 'escalated' ? 'border-rose-500/50' : 'border-slate-800'} rounded-xl p-6 transition-all hover:border-slate-600`}>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              
              {/* Left: Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                    dispute.status === 'escalated' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {dispute.status === 'escalated' ? 'Dyskusja Eskalowana' : 'Otwarta Dyskusja'}
                  </span>
                  <span className="text-xs text-slate-500">ID: {dispute.id} • Zamówienie #{dispute.orderId}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{dispute.buyer}</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Powód: <span className="text-white font-medium">
                    {dispute.reason === 'damaged' ? 'Uszkodzony towar' : 'Nie otrzymałem paczki'}
                  </span>
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Pozostało czasu na odpowiedź: <span className="text-white font-mono">{dispute.daysRemaining} dni</span>
                </div>
              </div>

              {/* Middle: Logic Preview */}
              <div className="flex-1 bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Analiza AI</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle size={14} /> Kupujący jest "Smart"
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle size={14} className="text-slate-600" /> Historia: 2 poprzednie zwroty
                  </li>
                  {dispute.reason === 'not_received' && (
                     <li className="flex items-center gap-2 text-rose-400">
                       <AlertTriangle size={14} /> Tracking: Paczka utknęła w oddziale
                     </li>
                  )}
                </ul>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                <button 
                  onClick={() => handleAction(dispute.id, 'Paczka w drodze')}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm"
                >
                  <Send size={16} />
                  Auto-Odp: W drodze
                </button>
                <button 
                  onClick={() => handleAction(dispute.id, 'Zwrot środków')}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-colors text-sm"
                >
                  <RotateCcw size={16} />
                  Auto-Zwrot: Uszkodzenie
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};