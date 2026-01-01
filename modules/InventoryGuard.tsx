import React, { useState } from 'react';
import { Crosshair, BoxSelect, AlertOctagon, Save } from 'lucide-react';
import { mockInventory } from '../services/mockApi';

export const InventoryGuard = () => {
  const [inventory, setInventory] = useState(mockInventory);
  const [globalBuffer, setGlobalBuffer] = useState(2);

  const calculateAllegroStock = (real: number, buffer: number) => {
    return Math.max(0, real - buffer);
  };

  const updateBuffer = (id: string, newBuffer: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, virtualBuffer: newBuffer } : item
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crosshair className="text-emerald-500" />
            Strażnik Magazynu
          </h2>
          <p className="text-slate-400">Zapobieganie sprzedaży towaru, którego nie ma (Overselling).</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 p-3 rounded-xl">
           <span className="text-sm font-medium text-slate-300">Globalny Bufor Bezpieczeństwa:</span>
           <div className="flex items-center">
             <button onClick={() => setGlobalBuffer(Math.max(0, globalBuffer - 1))} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-l hover:bg-slate-700">-</button>
             <input type="text" readOnly value={globalBuffer} className="w-12 h-8 bg-slate-950 text-center border-y border-slate-800 text-white font-mono" />
             <button onClick={() => setGlobalBuffer(globalBuffer + 1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-r hover:bg-slate-700">+</button>
           </div>
           <button className="text-xs text-emerald-400 hover:text-emerald-300 underline ml-2">Zastosuj do wszystkich</button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-sm uppercase font-semibold border-b border-slate-800">
              <th className="px-6 py-4">Produkt</th>
              <th className="px-6 py-4 text-center">Stan Magazynowy (Real)</th>
              <th className="px-6 py-4 text-center">Wirtualny Bufor</th>
              <th className="px-6 py-4 text-center">Stan na Allegro</th>
              <th className="px-6 py-4 text-right">Status Oferty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {inventory.map((item) => {
              const allegroStock = calculateAllegroStock(item.realStock, item.virtualBuffer);
              const isDanger = item.realStock <= item.virtualBuffer;

              return (
                <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-block px-3 py-1 bg-slate-800 rounded-lg text-white font-mono border border-slate-700">
                      {item.realStock} szt.
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <div className="flex items-center gap-2">
                       <input 
                        type="number" 
                        value={item.virtualBuffer}
                        onChange={(e) => updateBuffer(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-center text-white focus:border-emerald-500 focus:outline-none"
                       />
                       <span className="text-xs text-slate-500">szt.</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xl font-bold ${isDanger ? 'text-rose-500' : 'text-emerald-400'}`}>
                      {allegroStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isDanger ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium uppercase">
                        <AlertOctagon size={12} /> Zakończona (Auto)
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium uppercase">
                        <BoxSelect size={12} /> Aktywna
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end">
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-all">
          <Save size={18} />
          Zapisz Konfigurację
        </button>
      </div>
    </div>
  );
};