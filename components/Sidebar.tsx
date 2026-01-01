import React from 'react';
import { LayoutDashboard, MessageSquare, Package, Calculator, Settings, LogOut, ShieldAlert, Crosshair, Zap, ScanSearch, ScanLine, Printer, LineChart } from 'lucide-react';

export const Sidebar = ({ activeModule, setActiveModule }: { activeModule: string, setActiveModule: (m: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Pulpit', icon: LayoutDashboard },
    { id: 'smart-lister', label: 'AI Szybkie Wystawianie', icon: ScanLine, highlight: 'text-primary' },
    { id: 'orders', label: 'Zamówienia', icon: Package },
    { id: 'print-station', label: 'Stacja Druku', icon: Printer },
    { id: 'messages', label: 'Wiadomości', icon: MessageSquare },
    { id: 'seo-autopilot', label: 'SEO Autopilot', icon: LineChart, highlight: 'text-purple-400' },
    { id: 'disputes', label: 'Auto-Negocjator', icon: ShieldAlert, highlight: 'text-rose-400' },
    { id: 'inventory', label: 'Strażnik Magazynu', icon: Crosshair },
    { id: 'repricer', label: 'Drapieżny Repricing', icon: Zap, highlight: 'text-yellow-400' },
    { id: 'seo', label: 'Klonowanie SEO', icon: ScanSearch },
    { id: 'profit', label: 'Kalkulator Zysku', icon: Calculator },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-wider">ALLEGRO<span className="text-emerald-500">MASTER</span></h1>
        <p className="text-xs text-slate-500 mt-1">Enterprise Tool v1.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              activeModule === item.id 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={item.highlight && activeModule !== item.id ? item.highlight : ''} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors">
          <LogOut size={20} />
          <span>Wyloguj</span>
        </button>
      </div>
    </div>
  );
};