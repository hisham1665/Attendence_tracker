import React, { useState, useEffect } from 'react'
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
import UploadMembersModal from '../components/UploadMembersModal'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const RoomDetail = ({ room, onBack, onSessionSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sessions, setSessions] = useState([])
  const [members, setMembers] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false)
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [isUploadMembersModalOpen, setIsUploadMembersModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [showMembersSection, setShowMembersSection] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    studentid: ''
  })

  useEffect(() => {
    fetchSessions()
    fetchMembers()
    fetchAllAttendance()
  }, [room._id])

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sessions?room=${room._id}`, {
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
    } finally {
      setLoading(false)
    }
  }

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

  const fetchAllAttendance = async () => {
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
        console.log('All attendance data:', data)
        console.log('Valid attendance data:', validAttendanceData)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const getSessionAttendanceCount = (sessionId) => {
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
  }

  const handleCreateSession = async (sessionData) => {
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
          room: room._id
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
  }

  const handleUploadMembers = async (csvData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/members/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          members: csvData,
          room: room._id
        }),
      })
      
      if (response.ok) {
        fetchMembers()
        setIsUploadMembersModalOpen(false)
      }
    } catch (error) {
      console.error('Error uploading members:', error)
    }
  }

  const handleDeleteSession = async (sessionId) => {
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
  }

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
          ...newMember,
          room: room._id
        }),
      })

      if (response.ok) {
        fetchMembers()
        setIsAddMemberModalOpen(false)
        setNewMember({
          name: '',
          email: '',
          phone: '',
          department: '',
          studentid: ''
        })
        alert('Member added successfully')
      } else {
        alert('Failed to add member')
      }
    } catch (error) {
      console.error('Error adding member:', error)
      alert('Error adding member')
    }
  }

  const filteredSessions = sessions.filter(session => {
    const title = (session.title || '').toLowerCase()
    const name = (session.name || '').toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return title.includes(searchLower) || name.includes(searchLower)
  })

  // Add attendance count to sessions
  const sessionsWithAttendance = filteredSessions.map(session => {
    try {
      return {
        ...session,
        attendanceCount: getSessionAttendanceCount(session._id)
      }
    } catch (error) {
      console.error('Error calculating attendance:', error)
      return {
        ...session,
        attendanceCount: 0  // Safe fallback
      }
    }
  })

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
              Back to Dashboard
            </Button>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {room.name || room.title || 'Untitled Room'}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                {room.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sessions.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {sessions.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80 border-2 focus:border-purple-400 transition-colors duration-200"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setIsUploadMembersModalOpen(true)}
              className="border-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Members
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsAddMemberModalOpen(true)}
              className="border-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Single Member
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowMembersSection(!showMembersSection)}
              className="border-2"
            >
              <Users className="h-4 w-4 mr-2" />
              {showMembersSection ? 'Hide' : 'View'} Members
            </Button>
            
            <Button 
              onClick={() => setIsCreateSessionModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </div>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
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
        {!loading && filteredSessions.length === 0 && (
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
                      <TableHead className="w-[250px] font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Department</TableHead>
                      <TableHead className="font-semibold">Student ID</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-800 dark:text-white">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {member.email}
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
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
      
      <UploadMembersModal 
        isOpen={isUploadMembersModalOpen}
        onClose={() => setIsUploadMembersModalOpen(false)}
        onUploadMembers={handleUploadMembers}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter full name"
                className="col-span-3"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                className="col-span-3"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
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
                value={newMember.phone}
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
                value={newMember.department}
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
                value={newMember.studentid}
                onChange={(e) => setNewMember({...newMember, studentid: e.target.value})}
              />
            </div>
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
              disabled={!newMember.name || !newMember.email}
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
