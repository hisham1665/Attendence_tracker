import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Home,
  ArrowLeft,
  Search,
  RefreshCw,
  AlertTriangle,
  Zap,
  Star,
  Heart,
  Sparkles,
  Coffee,
  Moon,
  Sun,
  Cloud,
  Users
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()
  const [animationState, setAnimationState] = useState(0)
  const [floatingIcons, setFloatingIcons] = useState([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Generate floating icons
  useEffect(() => {
    const icons = [
      { Icon: Star, delay: 0, speed: 3000 },
      { Icon: Heart, delay: 500, speed: 3500 },
      { Icon: Sparkles, delay: 1000, speed: 2500 },
      { Icon: Coffee, delay: 1500, speed: 4000 },
      { Icon: Moon, delay: 2000, speed: 3200 },
      { Icon: Sun, delay: 2500, speed: 2800 },
      { Icon: Cloud, delay: 3000, speed: 3600 },
      { Icon: Zap, delay: 3500, speed: 2200 }
    ]
    setFloatingIcons(icons)

    // Animation sequence
    const sequence = [0, 1, 2, 3, 4]
    sequence.forEach((step, index) => {
      setTimeout(() => setAnimationState(step), index * 300)
    })
  }, [])

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const suggestions = [
    { text: "Go back to Dashboard", action: () => navigate('/dashboard'), icon: <Home className="h-4 w-4" /> },
    { text: "Try Searching", action: () => navigate('/dashboard'), icon: <Search className="h-4 w-4" /> },
    { text: "Refresh Page", action: () => window.location.reload(), icon: <RefreshCw className="h-4 w-4" /> },
    { text: "Go to Login", action: () => navigate('/login'), icon: <Users className="h-4 w-4" /> }
  ]

  const randomMessages = [
    "Oops! This page went on vacation 🏖️",
    "404: Page not found, but your smile is! 😊",
    "Lost in cyberspace? Let's get you back! 🚀",
    "This page is playing hide and seek! 🙈",
    "Houston, we have a 404 problem! 🛸"
  ]

  const [currentMessage, setCurrentMessage] = useState(randomMessages[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(randomMessages[Math.floor(Math.random() * randomMessages.length)])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-500 to-red-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating icons */}
      {floatingIcons.map((item, index) => (
        <div
          key={index}
          className="absolute opacity-20 dark:opacity-10"
          style={{
            left: `${10 + (index * 12)}%`,
            top: `${20 + (index * 8)}%`,
            animation: `float ${item.speed}ms ease-in-out infinite`,
            animationDelay: `${item.delay}ms`
          }}
        >
          <item.Icon className="h-8 w-8 text-purple-500" />
        </div>
      ))}

      {/* Interactive cursor effect */}
      <div
        className="fixed pointer-events-none z-50 opacity-50"
        style={{
          left: mousePosition.x - 10,
          top: mousePosition.y - 10,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full filter blur-sm animate-pulse"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main 404 Display */}
          <div className={`transform transition-all duration-1000 ${animationState >= 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'}`}>
            <div className="relative mb-8">
              {/* Glowing 404 */}
              <h1 className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-black leading-none">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                  404
                </span>
              </h1>
              
              {/* Floating alert icon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="p-4 md:p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl animate-bounce">
                  <AlertTriangle className="h-8 w-8 md:h-12 lg:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Animated message */}
          <div className={`transform transition-all duration-1000 delay-300 ${animationState >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-2 min-h-[2rem] transition-all duration-500 px-4">
              {currentMessage}
            </p>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-500 mb-12 px-4">
              The page you're looking for seems to have wandered off into the digital wilderness.
            </p>
          </div>

          {/* Action buttons */}
          <div className={`transform transition-all duration-1000 delay-600 ${animationState >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 px-4">
              <Button 
                onClick={() => navigate('/')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group w-full sm:w-auto"
              >
                <Home className="h-4 w-4 md:h-5 md:w-5 mr-2 group-hover:animate-bounce" />
                Go Home
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 ml-2 group-hover:animate-spin" />
              </Button>
              
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
                className="border-2 border-purple-300 hover:border-purple-400 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 group w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Go Back
              </Button>
            </div>
          </div>

          {/* Helpful suggestions */}
          <div className={`transform transition-all duration-1000 delay-900 ${animationState >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              What would you like to do?
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {suggestions.map((suggestion, index) => (
                <Card 
                  key={index}
                  className="group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 hover:border-purple-300"
                  onClick={suggestion.action}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300">
                      <div className="text-white">
                        {suggestion.icon}
                      </div>
                    </div>
                    <p className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-600 transition-colors">
                      {suggestion.text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Fun fact */}
          <div className={`transform transition-all duration-1000 delay-1200 ${animationState >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mt-16`}>
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                  Fun Fact! 💡
                </h4>
                <p className="text-slate-600 dark:text-slate-400">
                  The first 404 error was created at CERN in 1992. The room where the first web server was located was actually Room 404!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

export default NotFound
