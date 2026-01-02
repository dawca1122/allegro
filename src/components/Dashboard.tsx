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

  useEffect(() => {
    fetch('/api/orders/dashboard')
      .then((r) => r.json())
      .then((data) => setOrders(data))
      .catch((err) => {
        console.error(err)
        setMessage('Failed to load dashboard')
      })
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
      <div className="dashboard-controls">
        <button onClick={runRepricing} disabled={loading} className="btn primary">Run Repricing</button>
        <button onClick={runNegotiate} disabled={loading} className="btn secondary">Run Negotiate</button>
      </div>
      {message && <div className="message">{message}</div>}

      {orders ? (
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
      ) : (
        <div>Loading orders...</div>
      )}
    </div>
  )
}
