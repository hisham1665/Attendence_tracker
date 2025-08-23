import React, { useState } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import RoomDetail from './pages/RoomDetail'
import SessionAttendance from './pages/SessionAttendance'
import Settings from './pages/Settings'
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
    // Keep the current selectedRoom when navigating to session
    // Don't overwrite it with session.room as it might be incomplete
    setCurrentView('session-attendance')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedRoom(null)
    setSelectedSession(null)
  }

  const handleBackToRoom = () => {
    // Only navigate to room detail if we have a selected room
    if (selectedRoom) {
      setCurrentView('room-detail')
      setSelectedSession(null)
    } else {
      // If no room selected, go back to dashboard
      handleBackToDashboard()
    }
  }

  const handleSettingsClick = () => {
    setCurrentView('settings')
  }

  const handleBackFromSettings = () => {
    setCurrentView('dashboard')
  }

  switch (currentView) {
    case 'room-detail':
      return (
        <RoomDetail 
          room={selectedRoom}
          onBack={handleBackToDashboard}
          onSessionSelect={handleSessionSelect}
          onSettingsClick={handleSettingsClick}
        />
      )
    
    case 'session-attendance':
      return (
        <SessionAttendance 
          session={selectedSession}
          room={selectedRoom}
          onBack={handleBackToRoom}
          onSettingsClick={handleSettingsClick}
        />
      )
    
    case 'settings':
      return (
        <Settings 
          onBack={handleBackFromSettings}
          onRoomSelect={handleRoomSelect}
          onSessionSelect={handleSessionSelect}
        />
      )
    
    default:
      return (
        <Dashboard 
          onRoomSelect={handleRoomSelect}
          onSettingsClick={handleSettingsClick}
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
