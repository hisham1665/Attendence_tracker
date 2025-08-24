import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Dashboard from './Dashboard'
import RoomDetail from './RoomDetail'
import SessionAttendance from './SessionAttendance'
import Settings from './Settings'

const DashboardApp = () => {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)

  const handleRoomSelect = (room) => {
    setSelectedRoom(room)
    setCurrentView('room-detail')
  }

  const handleSessionSelect = (session) => {
    setSelectedSession(session)
    // If session comes with room data (e.g., from Settings), set the room as well
    if (session.room) {
      setSelectedRoom(session.room)
    }
    setCurrentView('session-attendance')
  }

  const handleBackToDashboard = () => {
    setSelectedRoom(null)
    setSelectedSession(null)
    setCurrentView('dashboard')
  }

  const handleBackToRoom = () => {
    setSelectedSession(null)
    setCurrentView('room-detail')
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

export default DashboardApp
