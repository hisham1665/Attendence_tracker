import React, { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import RoomDetail from './pages/RoomDetail'
import SessionAttendance from './pages/SessionAttendance'
import { useAuth } from './contexts/AuthContext'


function AppContent() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)

  if (!user) {
    return <LoginPage />
  }

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    setCurrentView('room-detail')
  }

  const handleSessionSelect = (session) => {
    setSelectedSession(session)
    setCurrentView('session-attendance')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedRoom(null)
    setSelectedSession(null)
  }

  const handleBackToRoom = () => {
    setCurrentView('room-detail')
    setSelectedSession(null)
  }

  switch (currentView) {
    case 'room-detail':
      return (
        <RoomDetail 
          room={selectedRoom}
          onBack={handleBackToDashboard}
          onSessionSelect={handleSessionSelect}
        />
      )
    
    case 'session-attendance':
      return (
        <SessionAttendance 
          session={selectedSession}
          room={selectedRoom}
          onBack={handleBackToRoom}
        />
      )
    
    default:
      return (
        <Dashboard 
          onRoomSelect={handleRoomSelect}
        />
      )
  }
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
