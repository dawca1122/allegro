import React from 'react';
import { KPICard } from '../components/KPICard';
import { DollarSign, Package, Clock, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Centrum Dowodzenia</h2>
          <p className="text-slate-400">Przegląd wyników na żywo</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>System działa: Online</span>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Dziś na rękę" 
          value="1 240,50 zł" 
          icon={DollarSign} 
          trend="+12%" 
          status="success" 
        />
        <KPICard 
          title="Do wysłania" 
          value="14 paczek" 
          icon={Package} 
          status="warning" 
          subtext="3 pilne (po 13:00)"
        />
        <KPICard 
          title="Czas odpowiedzi" 
          value="8 min" 
          icon={Clock} 
          status="success" 
        />
        <KPICard 
          title="Jakość Sprzedaży" 
          value="995 / 1000" 
          icon={Trophy} 
          trend="Super Sprzedawca" 
          status="success" 
        />
      </div>

      {/* Activity Feed & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-emerald-400" />
            Ostatnia Aktywność
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-white">Nowe zamówienie: <span className="font-mono text-slate-400">#ORDER-24{i}</span></p>
                    <p className="text-xs text-slate-500">Jan Kowalski kupił: Zestaw Narzędzi PRO</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">2 min temu</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle size={20} className="mr-2 text-orange-400" />
            Wymaga Uwagi
          </h3>
          <div className="space-y-3">
             <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
               <p className="text-sm text-orange-200 font-medium">Niski stan magazynowy</p>
               <p className="text-xs text-orange-300/70 mt-1">Produkt SKU-123 (zostały 2 szt.)</p>
             </div>
             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
               <p className="text-sm text-red-200 font-medium">Dyskusja otwarta</p>
               <p className="text-xs text-red-300/70 mt-1">Zamówienie #9921 - Brak paczki</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};