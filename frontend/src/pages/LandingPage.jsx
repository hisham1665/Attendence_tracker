import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight,
  Users,
  Clock,
  BarChart3,
  FileText,
  Download,
  CheckCircle,
  Zap,
  Shield,
  Smartphone,
  Globe,
  Star,
  Trophy,
  Target,
  Sparkles,
  Play,
  ChevronDown,
  Github,
  Mail,
  Twitter,
  Menu,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [animationStep, setAnimationStep] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const steps = [0, 1, 2, 3, 4]
    steps.forEach((step, index) => {
      setTimeout(() => setAnimationStep(step), index * 200)
    })
  }, [])

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Smart Room Management",
      description: "Create unlimited rooms with dynamic field configurations. Adapt to any organizational structure.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Real-time Attendance",
      description: "Mark attendance instantly with live updates. No more waiting or sync issues.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      title: "Bulk Import & Export",
      description: "Import from CSV/Excel files and export professional reports with one click.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "Advanced Analytics",
      description: "Get detailed insights with attendance statistics, trends, and visual reports.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-pink-600" />,
      title: "Mobile Responsive",
      description: "Perfect experience on all devices. Take attendance anywhere, anytime.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <Shield className="h-8 w-8 text-indigo-600" />,
      title: "Secure & Private",
      description: "Bank-level security with encrypted data and user-specific access controls.",
      color: "from-indigo-500 to-indigo-600"
    }
  ]

  const stats = [
    { number: "99.9%", label: "Uptime", icon: <Zap className="h-6 w-6" /> },
    { number: "10K+", label: "Active Users", icon: <Users className="h-6 w-6" /> },
    { number: "<2s", label: "Load Time", icon: <Clock className="h-6 w-6" /> },
    { number: "24/7", label: "Support", icon: <Shield className="h-6 w-6" /> }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "School Administrator",
      content: "This app transformed our attendance tracking. We save 3 hours every day!",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "HR Manager",
      content: "The bulk operations are a game-changer. No more manual spreadsheet work.",
      rating: 5
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "University Professor",
      content: "Students love how quick and easy it is. Attendance rates improved by 15%!",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
      {/* Navigation Bar */}
      <nav className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AttendanceTracker
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Features
              </a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Testimonials
              </a>
              <a href="#stats" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Stats
              </a>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 transition-all transform hover:scale-105"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 py-4 animate-in slide-in-from-top duration-200">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#features" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#testimonials" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Testimonials
                </a>
                <a 
                  href="#stats" 
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Stats
                </a>
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-full"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden"
        id="hero"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-green-500 to-blue-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            {/* Logo and Brand */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="flex justify-center items-center mb-8">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  HH Attendance
                </span>
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 dark:text-slate-300 mt-4">
                Tracker
              </h2>
            </div>

            {/* Subtitle */}
            <div className={`transform transition-all duration-1000 delay-200 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <p className="mt-8 text-xl sm:text-2xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed">
                Transform your attendance management with 
                <span className="text-blue-600 font-semibold"> lightning-fast</span> tracking,
                <span className="text-purple-600 font-semibold"> smart analytics</span>, and
                <span className="text-green-600 font-semibold"> seamless automation</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className={`transform transition-all duration-1000 delay-400 ${animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mt-12`}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <Sparkles className="h-5 w-5 mr-2 group-hover:animate-spin" />
                  Start Free Today
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                ✨ No credit card required • ⚡ Setup in 2 minutes • 🔒 100% secure
              </p>
            </div>

            {/* Floating badges */}
            <div className={`transform transition-all duration-1000 delay-600 ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} mt-12`}>
              <div className="flex justify-center flex-wrap gap-4">
                <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-semibold hover:scale-110 transition-transform cursor-pointer">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Free Forever
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-semibold hover:scale-110 transition-transform cursor-pointer">
                  <Globe className="h-4 w-4 mr-2" />
                  Works Everywhere
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-sm font-semibold hover:scale-110 transition-transform cursor-pointer">
                  <Zap className="h-4 w-4 mr-2" />
                  Lightning Fast
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-slate-400" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" id="stats">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`text-center transform transition-all duration-700 delay-${index * 100} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">{stat.number}</div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Why Choose HH Attendance Tracker?
            </h3>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Built with modern technology and designed for maximum efficiency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-xl hover:scale-105 transition-all duration-500 cursor-pointer transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} p-4 mb-4 group-hover:rotate-6 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Loved by Thousands
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See what our users are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <Trophy className="h-16 w-16 mx-auto mb-6 animate-bounce" />
              <h3 className="text-4xl font-bold mb-4">
                Ready to Transform Your Attendance?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of satisfied users and revolutionize your attendance management today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Target className="h-5 w-5 mr-2" />
                  Get Started Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">HH Attendance Tracker</span>
              </div>
              <p className="text-slate-400 mb-4">
                The most advanced attendance management system for modern organizations.
              </p>
              <div className="flex space-x-4">
                <Github className="h-6 w-6 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-slate-400 hover:text-white cursor-pointer transition-colors" />
                <Mail className="h-6 w-6 text-slate-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">Features</li>
                <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-white cursor-pointer transition-colors">Security</li>
                <li className="hover:text-white cursor-pointer transition-colors">Updates</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-white cursor-pointer transition-colors">Status</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 HH Attendance Tracker. All rights reserved. Made by Hisham</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
