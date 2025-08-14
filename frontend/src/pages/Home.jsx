import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  CalendarDays, 
  Users, 
  Clock, 
  BarChart3, 
  Plus, 
  Search,
  Moon,
  Sun,
  Zap,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  Star
} from 'lucide-react'

function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  
  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Initialize theme on component mount
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])
  
  // Vibrant stats with gradient backgrounds
  const stats = [
    { 
      title: 'Total Rooms', 
      value: '12', 
      icon: Users, 
      gradient: 'from-purple-500 to-pink-500',
      change: '+2 this week',
      changeType: 'positive'
    },
    { 
      title: 'Active Sessions', 
      value: '3', 
      icon: Zap, 
      gradient: 'from-green-500 to-emerald-500',
      change: 'Live now',
      changeType: 'neutral'
    },
    { 
      title: 'Total Members', 
      value: '156', 
      icon: Target, 
      gradient: 'from-blue-500 to-cyan-500',
      change: '+12 today',
      changeType: 'positive'
    },
    { 
      title: 'Attendance Rate', 
      value: '94%', 
      icon: TrendingUp, 
      gradient: 'from-orange-500 to-red-500',
      change: '+5% vs last week',
      changeType: 'positive'
    }
  ]

  const recentSessions = [
    { 
      id: 1, 
      room: 'Computer Science 101', 
      date: '2025-08-14', 
      time: '10:00 AM', 
      status: 'Active', 
      attendees: 25,
      completion: 85,
      color: 'from-green-400 to-green-600'
    },
    { 
      id: 2, 
      room: 'Mathematics 201', 
      date: '2025-08-14', 
      time: '2:00 PM', 
      status: 'Completed', 
      attendees: 30,
      completion: 96,
      color: 'from-blue-400 to-blue-600'
    },
    { 
      id: 3, 
      room: 'Physics 301', 
      date: '2025-08-13', 
      time: '11:00 AM', 
      status: 'Completed', 
      attendees: 18,
      completion: 78,
      color: 'from-purple-400 to-purple-600'
    }
  ]

  const quickActions = [
    { 
      title: 'Create Room', 
      description: 'Set up a new vibrant space', 
      icon: Sparkles, 
      action: 'create-room',
      gradient: 'from-pink-500 to-rose-500',
      hoverGradient: 'from-pink-600 to-rose-600'
    },
    { 
      title: 'Start Session', 
      description: 'Begin the magic ✨', 
      icon: Zap, 
      action: 'start-session',
      gradient: 'from-yellow-500 to-orange-500',
      hoverGradient: 'from-yellow-600 to-orange-600'
    },
    { 
      title: 'View Reports', 
      description: 'Discover insights 📊', 
      icon: BarChart3, 
      action: 'view-reports',
      gradient: 'from-blue-500 to-indigo-500',
      hoverGradient: 'from-blue-600 to-indigo-600'
    },
    { 
      title: 'Manage Members', 
      description: 'Build your community 👥', 
      icon: Users, 
      action: 'manage-members',
      gradient: 'from-green-500 to-teal-500',
      hoverGradient: 'from-green-600 to-teal-600'
    }
  ]

  const achievements = [
    { title: '🎯 Perfect Week', description: '100% attendance this week!' },
    { title: '🚀 Growth Master', description: '10+ new members added' },
    { title: '⭐ Super Tracker', description: '50+ sessions completed' }
  ]

  const handleQuickAction = (action) => {
    console.log(`Executing action: ${action}`)
    // Add some visual feedback
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsmBDGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnkpBSl+zPLaizsIGGS57OScTgwKUKXh8rhnHgg2jdXzzn0vBSF0xe/eizEHEVeq5O+zYBoGPJPY88p9KwUme8rx3I4+CRZiturqpVITC0ml4PK8aB4GM4nU8tGAMQYfcsLu45ZFDBFYrOPysF0YB0CY3PLEcSEELIHO8diJOQcZaLvt559NEAxPqOPwtmMcBjiP2O/NeSsFJHfH8N2QQAoUXrTp66hVFApGnt/yvmsmBDCG0fPTgzQGHW/A7eSaRw0PVqzl77BeGQc9ltvyxnkpBSh+zPDaizsIGGS56+OcTgwKUKXh8rhnHgg2jdT0z3wvBSJ0xe/eizEHEVeq5O+zYRsGPJLZ88p9KgUme8rx3I4+CRVht+vqpVMSC0mk4PK8aB4GM4nU8tGAMQYfccPu45ZFDBFYrOPysF0YB0CY3PLEcSEELYDO8tiIOQcZZ7zs559ODAw=')
    audio.play().catch(() => {}) // Ignore errors in case audio doesn't play
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section with Theme Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Attendance Tracker
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Where tracking meets <span className="font-semibold text-purple-600 dark:text-purple-400">excitement! ✨</span>
            </p>
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
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search the magic... ✨"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 border-2 focus:border-purple-400 transition-colors duration-200"
              />
            </div>
            
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Achievements Banner */}
        <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Latest Achievements</span>
              </div>
              <div className="flex space-x-4 text-sm">
                {achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vibrant Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-90`}></div>
              <CardContent className="relative p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-white/80 text-sm font-medium">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">
                      {stat.value}
                    </p>
                    <p className="text-white/70 text-xs">
                      {stat.change}
                    </p>
                  </div>
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions with Vibrant Gradients */}
        <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Quick Actions 🚀
            </CardTitle>
            <CardDescription className="text-lg">
              Jump into action with these power moves!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`group relative overflow-hidden rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-br ${action.gradient} hover:${action.hoverGradient}`}
                  onClick={() => handleQuickAction(action.action)}
                >
                  <div className="relative z-10 flex flex-col items-center space-y-3 text-center">
                    <action.icon className="h-8 w-8 group-hover:scale-110 transition-transform duration-200" />
                    <div>
                      <div className="font-bold text-lg">{action.title}</div>
                      <div className="text-white/80 text-sm">
                        {action.description}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions with Progress Bars */}
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Recent Sessions 📊
            </CardTitle>
            <CardDescription className="text-lg">
              Your latest achievements and active sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="group p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${session.color} shadow-lg`}>
                        <CalendarDays className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                          {session.room}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          {session.date} at {session.time} • {session.attendees} attendees
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${session.color} transition-all duration-500`}
                              style={{ width: `${session.completion}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {session.completion}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={session.status === 'Active' ? 'default' : 'secondary'}
                        className={session.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}
                      >
                        {session.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="group-hover:border-purple-400 transition-colors duration-200">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Welcome Card with Animated Background */}
        <Card className="relative overflow-hidden border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-gradient-x"></div>
          <CardContent className="relative p-8 text-white">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">
                  Welcome to the Future of Attendance! 🎉
                </h2>
                <p className="text-white/90 text-lg max-w-3xl mx-auto">
                  Experience the most engaging way to track attendance. Every session is a journey, 
                  every check-in is a victory! 🌟
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-white/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                  🚀 Get Started
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                  📺 Watch Tutorial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home