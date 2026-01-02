import React, { useEffect, useState } from 'react';
import { KPICard } from '../components/KPICard';
import { DollarSign, Package, Clock, Trophy, TrendingUp, AlertTriangle, Key } from 'lucide-react';

export const Dashboard = () => {
  // Stan komponentu
  const [orders, setOrders] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allegroConnected, setAllegroConnected] = useState<boolean | null>(null);

  // Funkcja obsługująca przekierowanie do autoryzacji Allegro
  const handleAllegroLogin = () => {
    window.location.href = '/api/auth';
  };

  // Pobierz zamówienia z backendu
  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      // Refresh allegro connection status
      try {
        const s = await fetch('/api/status');
        if (s.ok) {
          const sj = await s.json();
          if (mounted) setAllegroConnected(Boolean(sj?.allegro));
        } else {
          if (mounted) setAllegroConnected(false);
        }
      } catch (e) {
        if (mounted) setAllegroConnected(false);
      }
      try {
        const res = await fetch('/api/orders/dashboard');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setOrders(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Błąd pobierania zamówień');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchOrders();
    return () => { mounted = false; };
  }, []);

  // Helper: format updatedAt to relative "x min temu"
  const formatTimeAgo = (iso?: string | null) => {
    if (!iso) return '—';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '—';
    const now = Date.now();
    const diffSec = Math.floor((now - then) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)} s temu`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min temu`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} h temu`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD} d temu`;
  };

  if (orders === null) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-4xl text-red-600 font-bold">ERROR: BRAK POŁĄCZENIA Z API</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Centrum Dowodzenia</h2>
          <p className="text-slate-400">Przegląd wyników na żywo</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end md:items-center space-y-2 md:space-y-0 md:space-x-4">
          {/* PRZYCISK LOGOWANIA ALLEGRO */}
          <button
            type="button"
            onClick={handleAllegroLogin}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95 group"
          >
            <Key size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Połącz z Allegro</span>
          </button>

          {error ? (
            <div className="flex items-center space-x-2 text-sm text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Błąd połączenia</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>{allegroConnected ? 'Konto Allegro: POŁĄCZONE' : 'System działa: Online'}</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {
            (() => {
              // KPI: sum summary.totalToPay.amount for all orders
              const todayRevenue = orders.reduce((acc, o) => {
                const amtRaw = o?.summary?.totalToPay?.amount ?? 0;
                const amt = typeof amtRaw === 'string' ? parseFloat(amtRaw) : Number(amtRaw) || 0;
                return acc + amt;
              }, 0);

              // KPI: count where fulfillment.status === 'NEW'
              const toShipCount = orders.reduce((acc, o) => {
                return acc + (o?.fulfillment?.status === 'NEW' ? 1 : 0);
              }, 0);

              const formattedRevenue = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(todayRevenue);

              return (
                <>
                  <KPICard
                    title="Dziś na rękę"
                    value={isLoading ? '...' : formattedRevenue}
                    icon={DollarSign}
                    trend={""}
                    status={todayRevenue > 0 ? 'success' : 'neutral'}
                  />
                  <KPICard
                    title="Do wysłania"
                    value={isLoading ? '...' : `${toShipCount}`}
                    icon={Package}
                    status={toShipCount > 0 ? 'warning' : 'success'}
                  />
                </>
              );
            })()
          }
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
            {isLoading ? (
              // Proste szkielety ładowania
              [1, 2, 3].map((i) => (
                <div key={`skeleton-${i}`} className="animate-pulse flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/40">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
                    <div>
                      <div className="h-3 w-48 bg-slate-700 rounded mb-1"></div>
                      <div className="h-2 w-32 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-3 w-12 bg-slate-700 rounded" />
                </div>
              ))
            ) : error ? (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200">Błąd: {error}</div>
            ) : orders.length === 0 ? (
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm text-slate-400">Brak zamówień do wyświetlenia.</div>
            ) : (
              orders.slice(0, 5).map((order, idx) => {
                const rawId = order?.id ?? order?.orderId ?? order?.checkoutFormId ?? `unknown-${idx}`;
                const orderName = `#ORDER-${String(rawId).slice(0, 8)}`;
                const buyerLogin = order?.buyer?.login ?? 'Nieznany kupujący';
                const productName = order?.lineItems?.[0]?.offer?.name ?? '—';
                const description = `${buyerLogin} kupił: ${productName}`;
                const timeLabel = formatTimeAgo(order?.updatedAt ?? null);
                return (
                  <div key={`order-${rawId}-${idx}`} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm text-white">{orderName}</p>
                        <p className="text-xs text-slate-500">{description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{timeLabel}</span>
                  </div>
                );
              })
            )}
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