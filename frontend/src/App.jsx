import { useState } from 'react'
import LandingPage from './LandingPage'
import OwnershipRecordsPage from './pages/OwnershipRecordsPage'
import './App.css'

function App() {
  const [view, setView] = useState('landing')

  return view === 'landing' ? (
    <LandingPage onNavigateOwnership={() => setView('ownership')} />
  ) : (
    <OwnershipRecordsPage onBack={() => setView('landing')} />
  )
}

export default App

