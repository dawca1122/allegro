import React, { useEffect, useState } from 'react'

type Order = {
  id: string
  title: string
  price: number
  suggested_price?: number
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'ok'|'demo'|'loading'>('loading')
  // Read auth code from URL (helps re-fetch after OAuth redirect back)
  const authCode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('code') : null

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const r = await fetch('/api/orders/dashboard');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setOrders(null);
        setMessage('Błąd połączenia');
      }
    };

    // Try to fetch immediately (mount or when auth code changes)
    fetchDashboard();

    // Also refresh when the window regains focus or becomes visible (useful after returning from OAuth)
    const onFocus = () => fetchDashboard();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchDashboard();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [authCode])

  const refreshData = async () => {
    setMessage(null)
    setApiStatus('loading')
    try {
      const [sRes, dRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/orders/dashboard')
      ])
      const s = await sRes.json()
      if (s && s.ok && s.allegro && s.ai) setApiStatus('ok')
      else setApiStatus('demo')

      if (!dRes.ok) {
        setMessage('Błąd połączenia')
        setOrders(null)
        return
      }
      const data = await dRes.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setMessage('Błąd połączenia')
      setApiStatus('demo')
    }
  }

  const handleAllegroLogin = () => {
    // Redirect to the API route that starts Allegro OAuth
    window.location.href = '/api/auth';
  };

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((s) => {
        if (s && s.ok && s.allegro && s.ai) setApiStatus('ok')
        else setApiStatus('demo')
      })
      .catch(() => setApiStatus('demo'))
  }, [])

  const runRepricing = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/execute_repricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orders || [] }),
      })
      const data = await res.json()
      setMessage('Repricing executed')
      console.log(data)
    } catch (e) {
      console.error(e)
      setMessage('Repricing failed')
    } finally {
      setLoading(false)
    }
  }

  const runNegotiate = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orders || [] }),
      })
      const data = await res.json()
      setMessage('Negotiation results received')
      console.log(data)
    } catch (e) {
      console.error(e)
      setMessage('Negotiation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <div style={{position: 'absolute', top: 12, right: 16, fontSize: 12, color: '#9CA3AF'}}>
        {apiStatus === 'loading' ? 'Status API: ...' : apiStatus === 'ok' ? 'Status API: OK' : 'Status API: Demo'}
      </div>
      <div className="dashboard-controls">
        <button onClick={runRepricing} disabled={loading} className="btn primary">Run Repricing</button>
        <button onClick={runNegotiate} disabled={loading} className="btn secondary">Run Negotiate</button>
        <button onClick={handleAllegroLogin} className="btn accent">Połącz z Allegro</button>
        <button onClick={refreshData} className="btn muted">Odnów połączenie</button>
      </div>
      {message && <div className="message">{message}</div>}

      {orders === null ? (
        <div className="flex items-center justify-center h-[40vh]">
          <p className="text-4xl text-red-600 font-bold">ERROR: BRAK POŁĄCZENIA Z API</p>
        </div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Price</th>
              <th>Suggested</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.title}</td>
                <td>{o.price}</td>
                <td>{o.suggested_price ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )} 
    </div>
  )
}
