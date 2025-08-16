import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Settings,
  LogOut,
  Sun,
  Moon
} from 'lucide-react'

const Navbar = ({ title = "Dashboard", subtitle = "Manage your event rooms and track attendance" }) => {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between  lg:space-y-0 max-w-7xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="border-2 hover:scale-105 transition-transform duration-200"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 text-yellow-500" />
          ) : (
            <Moon className="h-4 w-4 text-purple-600" />
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="border-2"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="border-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default Navbar
