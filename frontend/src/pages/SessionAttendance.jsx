import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navbar from '@/components/Navbar'
import { 
  ArrowLeft, 
  Search, 
  Users, 
  Clock, 
  MapPin,
  UserCheck,
  UserX,
  Download,
  Calendar,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const SessionAttendance = ({ session, room, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [attendanceFilter, setAttendanceFilter] = useState('all')
  const [sessionData, setSessionData] = useState(session)

  useEffect(() => {
    fetchMembers()
    fetchAttendance()
  }, [sessionData._id])

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/members?room=${room._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/attendance?session=${sessionData._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAttendance(data)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAttendance = async (memberId, status) => {
    // Check if session is closed
    if (sessionData.status === 'closed') {
      alert('Cannot mark attendance. Session is closed.')
      return
    }

    // Helper function to get member ID consistently
    const getMemberId = (attendance) => {
      if (typeof attendance.member === 'object' && attendance.member._id) {
        return attendance.member._id  // Extract ID from populated object
      }
      return attendance.member        // Return ID directly if it's a string
    }

    // Optimistic update
    setAttendance(prevAttendance => {
      const existingIndex = prevAttendance.findIndex(a => getMemberId(a) === memberId)
      
      if (existingIndex >= 0) {
        // Update existing record
        const updated = [...prevAttendance]
        updated[existingIndex] = { ...updated[existingIndex], status }
        return updated
      } else {
        // Add new record
        return [...prevAttendance, {
          _id: `temp_${Date.now()}`,
          member: memberId,
          session: sessionData._id,
          status,
          timestamp: new Date().toISOString()
        }]
      }
    })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          member: memberId,
          session: sessionData._id,
          status: status
        }),
      })
      
      if (response.ok) {
        // Replace optimistic update with real data
        await fetchAttendance()
      } else {
        // Revert optimistic update on error
        await fetchAttendance()
        const errorData = await response.json()
        console.error('Failed to update attendance:', errorData.message)
        alert('Failed to update attendance: ' + errorData.message)
      }
    } catch (error) {
      // Revert optimistic update on error
      await fetchAttendance()
      console.error('Error updating attendance:', error)
      alert('Network error. Please try again.')
    }
  }

  const toggleSessionStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sessions/${sessionData._id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const updatedSession = await response.json()
        // Update local session state
        setSessionData(updatedSession)
      } else {
        const errorData = await response.json()
        console.error('Failed to toggle session status:', errorData.error)
        alert('Failed to toggle session status: ' + errorData.error)
      }
    } catch (error) {
      console.error('Error toggling session status:', error)
      alert('Network error. Please try again.')
    }
  }

  const exportToCSV = () => {
    const csvData = membersWithAttendance.map(member => ({
      Name: member.name,
      Email: member.email,
      Phone: member.phone || '',
      Department: member.department || '',
      StudentId: member.studentid || '',
      Status: member.attendanceStatus,
      CheckInTime: member.checkInTime || '',
      CheckOutTime: member.checkOutTime || ''
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sessionData.title}_attendance_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Combine members with their attendance status
  // Helper function to get member ID consistently (same as in toggleAttendance)
  const getMemberId = (attendance) => {
    if (typeof attendance.member === 'object' && attendance.member._id) {
      return attendance.member._id  // Extract ID from populated object
    }
    return attendance.member        // Return ID directly if it's a string
  }

  const membersWithAttendance = members.map(member => {
    const memberAttendance = attendance.find(a => getMemberId(a) === member._id)
    return {
      ...member,
      attendanceStatus: memberAttendance?.status || 'absent',
      checkInTime: memberAttendance?.checkInTime,
      checkOutTime: memberAttendance?.checkOutTime,
      attendanceId: memberAttendance?._id
    }
  })

  // Filter members based on search and attendance status
  const filteredMembers = membersWithAttendance.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.studentid && member.studentid.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = attendanceFilter === 'all' || 
                         member.attendanceStatus === attendanceFilter
    
    return matchesSearch && matchesFilter
  })

  // Get attendance statistics
  const stats = {
    total: members.length,
    present: membersWithAttendance.filter(m => m.attendanceStatus === 'present').length,
    absent: membersWithAttendance.filter(m => m.attendanceStatus === 'absent').length
  }

  const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0

  const formatTime = (timeString) => {
    if (!timeString) return '-'
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500 text-white'
      case 'absent': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />
      case 'absent': return <XCircle className="h-4 w-4" />
      default: return <UserX className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 transition-all duration-500">
      <Navbar subtitle="Session Attendance" />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-2 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Room
            </Button>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent break-words">
                {sessionData.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{formatDate(sessionData.date)}</span>
                </div>
                {sessionData.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm sm:text-base">{sessionData.location}</span>
                  </div>
                )}
                <Badge className={getStatusColor(sessionData.status)}>
                  {sessionData.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={toggleSessionStatus}
              className={`border-2 w-full sm:w-auto ${sessionData.status === 'closed' ? 'border-red-500 text-red-600 hover:bg-red-50' : 'border-green-500 text-green-600 hover:bg-green-50'}`}
            >
              {sessionData.status === 'closed' ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Reopen Session</span>
                  <span className="sm:hidden">Reopen</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Close Session</span>
                  <span className="sm:hidden">Close</span>
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={exportToCSV}
              className="border-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </Button>
            
            <Button 
              onClick={fetchAttendance}
              variant="outline"
              className="border-2 w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Total Members</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Present</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
                </div>
                <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-red-200 dark:border-red-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Absent</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
                </div>
                <UserX className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Attendance Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{attendanceRate}%</p>
                </div>
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 dark:bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  %
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80 border-2 focus:border-purple-400 transition-colors duration-200"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filter: {attendanceFilter === 'all' ? 'All' : attendanceFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setAttendanceFilter('all')}>
                All Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAttendanceFilter('present')}>
                Present Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAttendanceFilter('absent')}>
                Absent Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Attendance List */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Member Attendance</CardTitle>
            <CardDescription>
              {sessionData.status === 'closed' 
                ? 'Session is closed. Attendance cannot be modified. Reopen the session to make changes.' 
                : 'Mark attendance for each member. Click the status buttons to update attendance.'
              }
            </CardDescription>
            {sessionData.status === 'closed' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2">
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Session Closed</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  All attendance modification features are disabled.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                        <div className="h-3 bg-slate-200 rounded w-48"></div>
                      </div>
                      <div className="h-8 bg-slate-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <div 
                    key={member._id} 
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      sessionData.status === 'closed' 
                        ? 'bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer sm:cursor-default'
                    }`}
                    onClick={() => {
                      // On mobile, clicking the card toggles between present and absent (if session is active)
                      if (window.innerWidth < 640 && sessionData.status === 'active') {
                        const newStatus = member.attendanceStatus === 'present' ? 'absent' : 'present'
                        toggleAttendance(member._id, newStatus)
                      }
                    }}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-base sm:text-lg">{member.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(member.attendanceStatus)} border-0`}
                        >
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(member.attendanceStatus)}
                            <span className="capitalize">{member.attendanceStatus}</span>
                          </span>
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <span className="break-words">{member.email}</span>
                        {member.phone && <span>{member.phone}</span>}
                        {member.department && <span>{member.department}</span>}
                        {member.studentid && <span>ID: {member.studentid}</span>}
                      </div>
                      {(member.checkInTime || member.checkOutTime) && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-slate-500">
                          {member.checkInTime && (
                            <span>Check-in: {formatTime(member.checkInTime)}</span>
                          )}
                          {member.checkOutTime && (
                            <span>Check-out: {formatTime(member.checkOutTime)}</span>
                          )}
                        </div>
                      )}
                      <div className="block sm:hidden text-xs text-slate-500 mt-2">
                        {sessionData.status === 'closed' ? 'Session is closed' : 'Tap to toggle attendance'}
                      </div>
                    </div>
                    
                    {/* Buttons - Hidden on mobile */}
                    <div className="hidden sm:flex space-x-2">
                      <Button
                        size="sm"
                        variant={member.attendanceStatus === 'present' ? 'default' : 'outline'}
                        onClick={() => toggleAttendance(member._id, 'present')}
                        className={`flex items-center gap-2 ${member.attendanceStatus === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                        disabled={loading || sessionData.status === 'closed'}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={member.attendanceStatus === 'absent' ? 'default' : 'outline'}
                        onClick={() => toggleAttendance(member._id, 'absent')}
                        className={`flex items-center gap-2 ${member.attendanceStatus === 'absent' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                        disabled={loading || sessionData.status === 'closed'}
                      >
                        <XCircle className="h-4 w-4" />
                        Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!loading && filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold">No members found</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm ? 'Try searching with different keywords' : 'Upload members to start taking attendance'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SessionAttendance
