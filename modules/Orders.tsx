import React, { useState, useEffect } from 'react';
import { Search, Filter, Printer, Download, Truck, RefreshCw, FileText } from 'lucide-react';
import { Order } from '../types';
import { mockOrders } from '../services/mockApi';

// Słownik statusów do tłumaczenia
const STATUS_PL: Record<string, string> = {
  new: 'Nowe',
  processing: 'W realizacji',
  shipped: 'Wysłane',
  delivered: 'Dostarczone',
  cancelled: 'Anulowane'
};

const CARRIER_PL: Record<string, string> = {
  inpost: 'InPost Paczkomat',
  dpd: 'Kurier DPD',
  allegro_one: 'Allegro One Box'
};

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Symulacja ładowania
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'shipped': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const handlePrint = (type: 'LABEL' | 'INVOICE', orderId: string) => {
    const docName = type === 'LABEL' ? 'Etykietę' : 'Fakturę';
    // Simulation of triggering the PrintStation
    alert(`🖨️ Wysłano ${docName} dla zamówienia #${orderId} do Stacji Druku.`);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Manager Zamówień</h2>
          <p className="text-slate-400">Zarządzaj wysyłkami i zwrotami</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors">
            <RefreshCw size={18} className="mr-2" />
            Synchronizuj
          </button>
          <button className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20">
            <Printer size={18} className="mr-2" />
            Generuj Etykiety
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Szukaj po loginie, numerze zamówienia..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button className="flex items-center px-4 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 hover:text-white">
          <Filter size={18} className="mr-2" />
          Filtry
        </button>
      </div>

      {/* Data Table */}
      <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">ID / Data</th>
                <th className="px-6 py-4">Produkt</th>
                <th className="px-6 py-4">Kupujący</th>
                <th className="px-6 py-4">Kwota</th>
                <th className="px-6 py-4">Przewoźnik</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500">Ładowanie zamówień...</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-white font-mono">#{order.id}</div>
                    <div className="text-xs text-slate-500">{order.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{order.products[0]?.name}</div>
                    {order.products.length > 1 && (
                      <span className="text-xs text-emerald-400">+ {order.products.length - 1} inne</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {order.buyer}
                  </td>
                  <td className="px-6 py-4 text-white font-bold">
                    {order.total.toFixed(2)} zł
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-300 text-sm">
                      <Truck size={14} className="mr-2 text-slate-500" />
                      {CARRIER_PL[order.carrier]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {STATUS_PL[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handlePrint('LABEL', order.id)}
                         className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" 
                         title="Drukuj Etykietę"
                       >
                         <Printer size={18} />
                       </button>
                       <button 
                         onClick={() => handlePrint('INVOICE', order.id)}
                         className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" 
                         title="Drukuj Fakturę"
                       >
                         <FileText size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};