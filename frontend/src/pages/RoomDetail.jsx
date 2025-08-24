import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Users, 
  Calendar, 
  Clock,
  Play,
  Pause,
  BarChart3,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import CreateSessionModal from '../components/CreateSessionModal'
import FileUploadModal from '../components/FileUploadModal'
import Navbar from '../components/Navbar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const RoomDetail = ({ room, onBack, onSessionSelect, onSettingsClick }) => {
  // Safety check for missing room data
  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900">
        <Navbar title="Room Not Found" subtitle="Please select a valid room" onSettingsClick={onSettingsClick} />
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">Room data not found. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Optimized state management
  const [searchTerm, setSearchTerm] = useState('')
  const [sessions, setSessions] = useState([])
  const [members, setMembers] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false)
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [isUploadMembersModalOpen, setIsUploadMembersModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [showMembersSection, setShowMembersSection] = useState(false)
  const [newMember, setNewMember] = useState({})
  const [roomData, setRoomData] = useState(room) // Local state to manage room data

  // Initialize newMember state based on room field configuration
  useEffect(() => {
    if (roomData?.fieldConfiguration?.fields) {
      const initialMember = {}
      roomData.fieldConfiguration.fields.forEach(field => {
        initialMember[field.name] = ''
      })
      setNewMember(initialMember)
    } else {
      // Fallback to legacy fields
      setNewMember({
        name: '',
        email: '',
        phone: '',
        department: '',
        studentid: ''
      })
    }
  }, [roomData])

  // Effect to ensure room data is complete
  useEffect(() => {
    setRoomData(room)
    
    // If room data is incomplete (missing title/name), refetch it
    if (room && room._id && (!room.title && !room.name)) {
      fetchRoomData()
    }
  }, [room])

  // Optimized fetch functions with useCallback
  const fetchRoomData = useCallback(async () => {
    if (!roomData?._id) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/rooms/${roomData._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setRoomData(data)
      }
    } catch (error) {
      console.error('Error fetching room data:', error)
    }
  }, [roomData?._id])

  const fetchSessions = useCallback(async () => {
    if (!roomData?._id) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sessions?room=${roomData._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }, [roomData?._id])

  const fetchMembers = useCallback(async () => {
    if (!roomData?._id) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/members?room=${roomData._id}`, {
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
  }, [roomData?._id])

  const fetchAllAttendance = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        // Filter out attendance records with null sessions
        const validAttendanceData = data.filter(attendance => attendance.session !== null)
        setAttendanceData(validAttendanceData)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }, [])

  useEffect(() => {
    if (roomData?._id) {
      fetchSessions()
      fetchMembers()
      fetchAllAttendance()
    }
  }, [roomData?._id, fetchSessions, fetchMembers, fetchAllAttendance])

  // Optimized computed values with useMemo
  const getSessionAttendanceCount = useCallback((sessionId) => {
    return attendanceData.filter(attendance => {
      // Skip if no session
      if (!attendance.session) {
        return false
      }
      
      // Handle both populated and non-populated session field
      const attendanceSessionId = typeof attendance.session === 'object' 
        ? attendance.session._id 
        : attendance.session
      
      return attendanceSessionId === sessionId && attendance.status === 'present'
    }).length
  }, [attendanceData])

  // Memoized sessions with attendance data
  const sessionsWithAttendance = useMemo(() => {
    return sessions.map(session => ({
      ...session,
      attendanceCount: getSessionAttendanceCount(session._id)
    }))
  }, [sessions, getSessionAttendanceCount])

  // Memoized filtered sessions
  const filteredSessions = useMemo(() => {
    return sessionsWithAttendance.filter(session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [sessionsWithAttendance, searchTerm])

  // Optimized utility functions with useCallback (defined early to avoid hoisting issues)
  const getMemberFieldValue = useCallback((member, fieldName) => {
    // Check dynamic fields first
    if (member.dynamicFields && member.dynamicFields[fieldName]) {
      return member.dynamicFields[fieldName]
    }
    // Fall back to legacy fields
    return member[fieldName] || '-'
  }, [])

  // Helper function to get display name for field
  const getFieldDisplayName = useCallback((fieldName) => {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1')
  }, [])

  // Memoized filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Get primary field value for search
      const primaryField = roomData?.fieldConfiguration?.primaryField || 'name'
      const primaryValue = getMemberFieldValue(member, primaryField)
      
      // Search in primary field and other common fields
      return primaryValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (member.phone && member.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
             (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()))
    })
  }, [members, searchTerm, roomData?.fieldConfiguration?.primaryField, getMemberFieldValue])

  const handleCreateSession = useCallback(async (sessionData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...sessionData,
          room: roomData._id
          // user field automatically set by backend from JWT
        }),
      })
      
      if (response.ok) {
        fetchSessions()
        fetchAllAttendance() // Also refresh attendance data
        setIsCreateSessionModalOpen(false)
      } else {
        const errorData = await response.json()
        console.error('Failed to create session:', errorData.message)
        alert('Failed to create session: ' + errorData.message)
      }
    } catch (error) {
      console.error('Error creating session:', error)
      alert('Network error. Please try again.')
    }
  }, [roomData._id, fetchSessions, fetchAllAttendance])

  const handleUploadComplete = useCallback((result) => {
    // Refresh members list after successful upload
    fetchMembers()
    setIsUploadMembersModalOpen(false)
    
    // Show success message
    if (result.stats) {
      alert(`Upload complete! ${result.stats.successful} members added successfully.${result.stats.errors > 0 ? ` ${result.stats.errors} rows had errors.` : ''}`)
    }
  }, [fetchMembers])

  const handleDeleteSession = useCallback(async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This will also delete all attendance records for this session.')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          fetchSessions()
          fetchAllAttendance() // Refresh attendance data
          alert('Session deleted successfully')
        } else {
          alert('Failed to delete session')
        }
      } catch (error) {
        console.error('Error deleting session:', error)
        alert('Error deleting session')
      }
    }
  }, [fetchSessions, fetchAllAttendance])

  const handleEditSession = (session) => {
    setEditingSession(session)
    setIsEditSessionModalOpen(true)
  }

  const handleUpdateSession = async (sessionData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sessions/${editingSession._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      })

      if (response.ok) {
        fetchSessions()
        setIsEditSessionModalOpen(false)
        setEditingSession(null)
        alert('Session updated successfully')
      } else {
        alert('Failed to update session')
      }
    } catch (error) {
      console.error('Error updating session:', error)
      alert('Error updating session')
    }
  }

  const handleAddMember = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          dynamicFields: newMember,
          room: roomData._id,
          // Also include legacy fields for backward compatibility
          name: newMember[roomData?.fieldConfiguration?.primaryField] || newMember.name || '',
          email: newMember.email || '',
          phone: newMember.phone || '',
          department: newMember.department || '',
          studentid: newMember.studentid || ''
        }),
      })

      if (response.ok) {
        fetchMembers()
        setIsAddMemberModalOpen(false)
        
        // Reset newMember based on current room configuration
        if (roomData?.fieldConfiguration?.fields) {
          const resetMember = {}
          roomData.fieldConfiguration.fields.forEach(field => {
            resetMember[field.name] = ''
          })
          setNewMember(resetMember)
        } else {
          setNewMember({
            name: '',
            email: '',
            phone: '',
            department: '',
            studentid: ''
          })
        }
        
        alert('Member added successfully')
      } else {
        alert('Failed to add member')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert('Error adding member')
    }
  }

  const handleDeleteMember = async (memberId, memberName) => {
    if (window.confirm(`Are you sure you want to delete ${memberName}? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/members/${memberId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          fetchMembers() // Refresh the members list
          alert('Member deleted successfully')
        } else {
          alert('Failed to delete member')
        }
      } catch (error) {
        console.error('Error deleting member:', error)
        alert('Error deleting member')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 transition-all duration-500">
      <Navbar subtitle="View All The Room Details" title='Room Dashboard' onSettingsClick={onSettingsClick}/>
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
              Back to Dashboard
            </Button>
            
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent break-words">
                {roomData?.name || roomData?.title || 'Untitled Room'}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
                {roomData?.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Total Sessions</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{sessions.length}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Active Sessions</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                    {sessions.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Members</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{members.length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Attendance</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {sessionsWithAttendance.length > 0 && members.length > 0
                      ? Math.round(
                          (sessionsWithAttendance.reduce((sum, session) => sum + session.attendanceCount, 0) / 
                          (sessionsWithAttendance.length * members.length)) * 100
                        )
                      : 0}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80 border-2 focus:border-purple-400 transition-colors duration-200"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row md:flex-wrap lg:flex-nowrap space-y-2 sm:space-y-0 sm:space-x-3 md:gap-2 lg:gap-3">
            <Button 
              variant="outline"
              onClick={() => setIsUploadMembersModalOpen(true)}
              className="border-2 w-full sm:w-auto md:flex-1 lg:flex-none"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Upload Members</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="border-2 w-full sm:w-auto md:flex-1 lg:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Single Member</span>
              <span className="sm:hidden">Add Member</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowMembersSection(!showMembersSection)}
              className="border-2 w-full sm:w-auto md:flex-1 lg:flex-none"
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{showMembersSection ? 'Hide' : 'View'} Members</span>
              <span className="sm:hidden">{showMembersSection ? 'Hide' : 'View'}</span>
            </Button>
            
            <Button 
              onClick={() => setIsCreateSessionModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto md:flex-1 lg:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Session</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        {/* Sessions Grid */}
        {sessionsWithAttendance.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No sessions found for this room</p>
              <Button onClick={() => setIsCreateSessionModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionsWithAttendance.map((session) => (
              <Card 
                key={session._id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 dark:hover:border-purple-600"
                onClick={() => onSessionSelect(session)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {session.title}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(session.status)} text-white border-0`}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {formatDate(session.date)}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleEditSession(session)
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Session
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSession(session._id)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Session
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{session.attendanceCount || 0}/{members.length} attended</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{session.duration || '1h'}</span>
                      </div>
                    </div>
                    
                    {session.attendanceCount !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Attendance Rate</span>
                          <span>{Math.round((session.attendanceCount / members.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(session.attendanceCount / members.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-purple-50 group-hover:border-purple-300 dark:group-hover:bg-purple-900/20"
                    >
                      {session.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Take Attendance
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          View Results
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredSessions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No sessions found</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm ? 'Try searching with different keywords' : 'Create your first session to start tracking attendance!'}
                  </p>
                </div>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsCreateSessionModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Session
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Members Section */}
      {showMembersSection && (
        <div className="mt-8 justify-center m-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Room Members</h3>
            <Badge variant="secondary" className="text-sm">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          {members.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h4 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">No Members Yet</h4>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Add members to this room to start tracking attendance.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setIsUploadMembersModalOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Members
                  </Button>
                  <Button 
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Single Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2">
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {roomData.fieldConfiguration?.fields?.map((field) => (
                        <TableHead key={field.name} className={`font-semibold ${field.name === roomData.fieldConfiguration.primaryField ? 'w-[250px]' : ''}`}>
                          {getFieldDisplayName(field.name)}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                          {field.name === roomData.fieldConfiguration.primaryField && (
                            <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                          )}
                        </TableHead>
                      )) || (
                        // Fallback to legacy headers if no field configuration
                        <>
                          <TableHead className="w-[250px] font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Department</TableHead>
                          <TableHead className="font-semibold">Student ID</TableHead>
                        </>
                      )}
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        {roomData.fieldConfiguration?.fields?.map((field) => (
                          <TableCell key={field.name} className={field.name === roomData.fieldConfiguration.primaryField ? "font-medium" : "text-slate-600 dark:text-slate-400"}>
                            {field.name === roomData.fieldConfiguration.primaryField ? (
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {getMemberFieldValue(member, field.name).charAt(0).toUpperCase()}
                                </div>
                                <span className="text-slate-800 dark:text-white">{getMemberFieldValue(member, field.name)}</span>
                              </div>
                            ) : (
                              getMemberFieldValue(member, field.name)
                            )}
                          </TableCell>
                        )) || (
                          // Fallback to legacy display if no field configuration
                          <>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {member.name?.charAt(0).toUpperCase() || 'M'}
                                </div>
                                <span className="text-slate-800 dark:text-white">{member.name || 'Unknown'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {member.email || '-'}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {member.phone || '-'}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {member.department || '-'}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {member.studentid || '-'}
                            </TableCell>
                          </>
                        )}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(
                              member._id, 
                              getMemberFieldValue(member, roomData.fieldConfiguration?.primaryField || 'name')
                            )}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      <CreateSessionModal 
        isOpen={isCreateSessionModalOpen}
        onClose={() => setIsCreateSessionModalOpen(false)}
        onCreateSession={handleCreateSession}
      />
      
      <CreateSessionModal 
        isOpen={isEditSessionModalOpen}
        onClose={() => {
          setIsEditSessionModalOpen(false)
          setEditingSession(null)
        }}
        onCreateSession={handleUpdateSession}
        editingSession={editingSession}
        isEditing={true}
      />
      
      <FileUploadModal 
        isOpen={isUploadMembersModalOpen}
        onClose={() => setIsUploadMembersModalOpen(false)}
        room={room}
        onUploadComplete={handleUploadComplete}
      />
      
      {/* Add Single Member Modal */}
      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Single Member</DialogTitle>
            <DialogDescription>
              Add a new member to the room manually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {roomData?.fieldConfiguration?.fields ? (
              // Dynamic fields based on room configuration
              roomData.fieldConfiguration.fields.map((field) => (
                <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={field.name} className="text-right">
                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                    {field.name === roomData.fieldConfiguration.primaryField && (
                      <Badge variant="outline" className="ml-1 text-xs">Primary</Badge>
                    )}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type === 'email' ? 'email' : 
                          field.type === 'number' ? 'number' : 
                          field.type === 'date' ? 'date' : 'text'}
                    placeholder={`Enter ${field.name}`}
                    className="col-span-3"
                    value={newMember[field.name] || ''}
                    onChange={(e) => setNewMember({...newMember, [field.name]: e.target.value})}
                    required={field.required}
                  />
                </div>
              ))
            ) : (
              // Fallback to legacy fields if no configuration
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    className="col-span-3"
                    value={newMember.name || ''}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    className="col-span-3"
                    value={newMember.email || ''}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    className="col-span-3"
                    value={newMember.phone || ''}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Department
                  </Label>
                  <Input
                    id="department"
                    placeholder="Enter department"
                    className="col-span-3"
                    value={newMember.department || ''}
                    onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="studentid" className="text-right">
                    Student ID
                  </Label>
                  <Input
                    id="studentid"
                    placeholder="Enter student ID"
                    className="col-span-3"
                    value={newMember.studentid || ''}
                    onChange={(e) => setNewMember({...newMember, studentid: e.target.value})}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleAddMember}
              disabled={(() => {
                // Check if required fields are filled
                if (roomData?.fieldConfiguration?.fields) {
                  return roomData.fieldConfiguration.fields
                    .filter(field => field.required)
                    .some(field => !newMember[field.name]?.trim())
                } else {
                  // Fallback validation for legacy rooms
                  return !newMember.name || !newMember.email
                }
              })()}
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RoomDetail
