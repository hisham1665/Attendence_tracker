import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  RefreshCw
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const SessionAttendance = ({ session, room, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [members, setMembers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [attendanceFilter, setAttendanceFilter] = useState('all')

  useEffect(() => {
    fetchMembers()
    fetchAttendance()
  }, [session._id])

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
      const response = await fetch(`/api/attendance?session=${session._id}`, {
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
          session: session._id,
          status: status,
          timestamp: new Date().toISOString()
        }),
      })
      
      if (response.ok) {
        fetchAttendance()
      } else {
        const errorData = await response.json()
        console.error('Failed to update attendance:', errorData.message)
        alert('Failed to update attendance: ' + errorData.message)
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
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
    a.download = `${session.title}_attendance_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Combine members with their attendance status
  const membersWithAttendance = members.map(member => {
    const memberAttendance = attendance.find(a => a.member === member._id)
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
    absent: membersWithAttendance.filter(m => m.attendanceStatus === 'absent').length,
    late: membersWithAttendance.filter(m => m.attendanceStatus === 'late').length,
    excused: membersWithAttendance.filter(m => m.attendanceStatus === 'excused').length
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
      case 'late': return 'bg-yellow-500 text-white'
      case 'absent': return 'bg-red-500 text-white'
      case 'excused': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />
      case 'late': return <Clock className="h-4 w-4" />
      case 'absent': return <XCircle className="h-4 w-4" />
      case 'excused': return <UserCheck className="h-4 w-4" />
      default: return <UserX className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 transition-all duration-500">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="border-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Room
            </Button>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {session.title}
              </h1>
              <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(session.date)}</span>
                </div>
                {session.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location}</span>
                  </div>
                )}
                <Badge className={getStatusColor(session.status)}>
                  {session.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={exportToCSV}
              className="border-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <Button 
              onClick={fetchAttendance}
              variant="outline"
              className="border-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Members</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Present</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Absent</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
                </div>
                <UserX className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Late</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{attendanceRate}%</p>
                </div>
                <div className="w-8 h-8 bg-purple-600 dark:bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  %
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80 border-2 focus:border-purple-400 transition-colors duration-200"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-2">
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
              <DropdownMenuItem onClick={() => setAttendanceFilter('late')}>
                Late Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAttendanceFilter('excused')}>
                Excused Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Attendance List */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Member Attendance</CardTitle>
            <CardDescription>
              Mark attendance for each member. Click the status buttons to update attendance.
            </CardDescription>
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-lg">{member.name}</h3>
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
                      <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                        <span>{member.email}</span>
                        {member.phone && <span>{member.phone}</span>}
                        {member.department && <span>{member.department}</span>}
                        {member.studentid && <span>ID: {member.studentid}</span>}
                      </div>
                      {(member.checkInTime || member.checkOutTime) && (
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          {member.checkInTime && (
                            <span>Check-in: {formatTime(member.checkInTime)}</span>
                          )}
                          {member.checkOutTime && (
                            <span>Check-out: {formatTime(member.checkOutTime)}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={member.attendanceStatus === 'present' ? 'default' : 'outline'}
                        onClick={() => toggleAttendance(member._id, 'present')}
                        className={member.attendanceStatus === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={member.attendanceStatus === 'late' ? 'default' : 'outline'}
                        onClick={() => toggleAttendance(member._id, 'late')}
                        className={member.attendanceStatus === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      >
                        Late
                      </Button>
                      <Button
                        size="sm"
                        variant={member.attendanceStatus === 'absent' ? 'default' : 'outline'}
                        onClick={() => toggleAttendance(member._id, 'absent')}
                        className={member.attendanceStatus === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        Absent
                      </Button>
                      <Button
                        size="sm"
                        variant={member.attendanceStatus === 'excused' ? 'default' : 'outline'}
                        onClick={() => toggleAttendance(member._id, 'excused')}
                        className={member.attendanceStatus === 'excused' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        Excused
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
