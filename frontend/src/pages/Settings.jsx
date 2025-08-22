import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  User, 
  Lock, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Activity,
  Calendar,
  Users,
  Building,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import Navbar from '../components/Navbar'

const Settings = ({ onBack }) => {
  const [user, setUser] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    organization: ''
  })
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'system',
    notifications: {
      email: true,
      browser: true
    },
    language: 'en'
  })

  // Fetch user data and stats
  useEffect(() => {
    fetchUserData()
    fetchUserStats()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setProfileForm({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || '',
          organization: userData.organization || ''
        })
        setPreferences(userData.preferences || preferences)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      showMessage('Failed to load user data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        showMessage('Profile updated successfully', 'success')
      } else {
        const error = await response.json()
        showMessage(error.message || 'Failed to update profile', 'error')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showMessage('Network error. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('New passwords do not match', 'error')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      showMessage('New password must be at least 6 characters long', 'error')
      return
    }
    
    setSaving(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        showMessage('Password changed successfully', 'success')
      } else {
        const error = await response.json()
        showMessage(error.message || 'Failed to change password', 'error')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      showMessage('Network error. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar subtitle="Settings" />
        <div className="container mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar subtitle="Settings" />
      
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>

        {/* Success/Error Message */}
        {message && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {messageType === 'success' ? 
              <CheckCircle className="h-5 w-5" /> : 
              <AlertCircle className="h-5 w-5" />
            }
            {message}
          </div>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="department"
                          type="text"
                          placeholder="Enter your department"
                          value={profileForm.department}
                          onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="organization">Organization</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="organization"
                          type="text"
                          placeholder="Enter your organization"
                          value={profileForm.organization}
                          onChange={(e) => setProfileForm({...profileForm, organization: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="flex items-center gap-2">
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="Enter new password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="flex items-center gap-2">
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      {saving ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  App Preferences
                </CardTitle>
                <CardDescription>
                  Customize your app experience and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Theme</Label>
                      <p className="text-sm text-gray-500">Choose your preferred theme</p>
                    </div>
                    <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Notifications</Label>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive updates via email</p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences, 
                          notifications: {...preferences.notifications, email: checked}
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Browser Notifications</Label>
                        <p className="text-sm text-gray-500">Receive browser push notifications</p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.browser}
                        onCheckedChange={(checked) => setPreferences({
                          ...preferences, 
                          notifications: {...preferences.notifications, browser: checked}
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            {userStats && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rooms</p>
                          <p className="text-2xl font-bold text-blue-600">{userStats.stats.totalRooms}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                          <p className="text-2xl font-bold text-green-600">{userStats.stats.totalSessions}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
                          <p className="text-2xl font-bold text-purple-600">{userStats.stats.totalMembers}</p>
                        </div>
                        <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Recent Rooms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userStats.recentActivity.rooms.length > 0 ? (
                          userStats.recentActivity.rooms.map((room, index) => (
                            <div key={room._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">{room.name}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(room.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">{index + 1}</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No rooms created yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userStats.recentActivity.sessions.length > 0 ? (
                          userStats.recentActivity.sessions.map((session, index) => (
                            <div key={session._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">{session.title}</p>
                                <p className="text-sm text-gray-500">{session.room?.name}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(session.date || session.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">{index + 1}</Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No sessions created yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Settings