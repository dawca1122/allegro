import React from 'react'
import Dashboard from './components/Dashboard'
import './styles.css'

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Allegro Master</h1>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  )
}
