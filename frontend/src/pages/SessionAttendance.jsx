import React, { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
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
  Unlock,
  FileText
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

  // Helper function to get field value from member
  const getMemberFieldValue = (member, fieldName) => {
    // Check dynamic fields first
    if (member.dynamicFields && member.dynamicFields[fieldName]) {
      return member.dynamicFields[fieldName]
    }
    // Fall back to legacy fields
    return member[fieldName] || ''
  }

  // Helper function to get primary field value (main identifier)
  const getMemberPrimaryValue = (member) => {
    const primaryField = room?.fieldConfiguration?.primaryField || 'name'
    const value = getMemberFieldValue(member, primaryField)
    
    // If primary field is empty, try to find any non-empty field as fallback
    if (!value) {
      const fields = room?.fieldConfiguration?.fields || [
        { name: 'name' }, { name: 'email' }, { name: 'studentid' }, { name: 'phone' }
      ]
      
      for (const field of fields) {
        const fallbackValue = getMemberFieldValue(member, field.name)
        if (fallbackValue) {
          return fallbackValue
        }
      }
      
      return 'Unknown Member'
    }
    
    return value
  }

  // Helper function to get all searchable field values
  const getMemberSearchableValues = (member) => {
    const fields = room?.fieldConfiguration?.fields || []
    return fields.map(field => getMemberFieldValue(member, field.name)).filter(Boolean)
  }

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
    const csvData = membersWithAttendance.map(member => {
      const rowData = {}
      
      // Add dynamic fields based on room configuration
      if (room?.fieldConfiguration?.fields) {
        room.fieldConfiguration.fields.forEach(field => {
          const fieldName = field.name.charAt(0).toUpperCase() + field.name.slice(1)
          rowData[fieldName] = getMemberFieldValue(member, field.name)
        })
      } else {
        // Fallback to legacy fields if no configuration
        rowData.Name = getMemberFieldValue(member, 'name')
        rowData.Email = getMemberFieldValue(member, 'email')
        rowData.Phone = getMemberFieldValue(member, 'phone')
        rowData.Department = getMemberFieldValue(member, 'department')
        rowData.StudentId = getMemberFieldValue(member, 'studentid')
      }
      
      // Add attendance specific fields
      rowData.Status = member.attendanceStatus
      rowData.CheckInTime = member.checkInTime || ''
      rowData.CheckOutTime = member.checkOutTime || ''
      
      return rowData
    })

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

  // PDF Export - Simple Excel-like table
  const exportToPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let currentY = margin

    // Simple header
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('HH Attendance Report', margin, currentY)
    currentY += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Room: ${room.title}`, margin, currentY)
    currentY += 6
    doc.text(`Session: ${sessionData.title}`, margin, currentY)
    currentY += 6
    doc.text(`Date: ${new Date(sessionData.createdAt).toLocaleDateString()}`, margin, currentY)
    currentY += 15

    // Prepare table data using dynamic field configuration
    const headers = ['S.No']
    
    // Add dynamic headers from room configuration
    if (room.fieldConfiguration?.fields) {
      room.fieldConfiguration.fields.forEach(field => {
        headers.push(field.name.charAt(0).toUpperCase() + field.name.slice(1))
      })
    }
    headers.push('Status')
    
    const tableData = []
    
    membersWithAttendance.forEach((member, index) => {
      console.log('Member data:', member) // Debug log
      
      const row = [(index + 1).toString()] // Start with S.No
      
      // Add data for each dynamic field
      if (room.fieldConfiguration?.fields) {
        room.fieldConfiguration.fields.forEach(field => {
          const value = getMemberFieldValue(member, field.name) || 'N/A'
          row.push(value)
        })
      }
      
      // Add attendance status
      row.push(member.attendanceStatus?.toUpperCase() || 'ABSENT')
      
      tableData.push(row)
    })

    console.log('Headers:', headers) // Debug log
    console.log('Table data:', tableData) // Debug log

    // Create dynamic column styles
    const columnStyles = {}
    const totalColumns = headers.length
    const availableWidth = 175 // Increased width to use more space on right side
    
    // S.No column (fixed width)
    columnStyles[0] = { halign: 'center', cellWidth: 15 }
    
    // Dynamic field columns (distribute remaining width)
    const remainingWidth = availableWidth - 15 - 25 // Subtract S.No and Status width
    const fieldCount = totalColumns - 2 // Exclude S.No and Status
    const fieldWidth = fieldCount > 0 ? remainingWidth / fieldCount : 35
    
    for (let i = 1; i < totalColumns - 1; i++) {
      columnStyles[i] = { halign: 'left', cellWidth: fieldWidth }
    }
    
    // Status column (slightly increased width)
    columnStyles[totalColumns - 1] = { halign: 'center', cellWidth: 25 }

    // Use autoTable for clean Excel-like table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: currentY,
      margin: { left: margin, right: 10 }, // Reduced right margin to allow more table width
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      },
      columnStyles: columnStyles,
      didParseCell: function(data) {
        // Color status cells (last column)
        if (data.column.index === totalColumns - 1 && data.section === 'body') {
          const status = data.cell.text[0]
          if (status === 'PRESENT') {
            data.cell.styles.textColor = [0, 128, 0] // Green
          } else if (status === 'ABSENT') {
            data.cell.styles.textColor = [255, 0, 0] // Red
          } else if (status === 'LATE') {
            data.cell.styles.textColor = [255, 165, 0] // Orange
          }
        }
      }
    })

    // Save the PDF
    const fileName = `${sessionData.title}_attendance_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
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
    // Get all searchable values from the member's dynamic fields
    const searchableValues = getMemberSearchableValues(member)
    const searchLower = searchTerm.toLowerCase()
    
    const matchesSearch = searchTerm === '' || searchableValues.some(value => 
      value.toLowerCase().includes(searchLower)
    )
    
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-2 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
                        <h3 className="font-medium text-base sm:text-lg">
                          {getMemberPrimaryValue(member)}
                        </h3>
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
                        {room?.fieldConfiguration?.fields ? (
                          // Display dynamic fields based on room configuration
                          room.fieldConfiguration.fields
                            .filter(field => field.name !== room.fieldConfiguration.primaryField) // Don't show primary field again
                            .slice(0, 3) // Limit to first 3 additional fields
                            .map(field => {
                              const value = getMemberFieldValue(member, field.name)
                              return value ? (
                                <span key={field.name} className="break-words">
                                  {field.name === 'email' ? value : 
                                   field.name === 'phone' ? value :
                                   field.name === 'studentid' ? `ID: ${value}` : 
                                   value}
                                </span>
                              ) : null
                            })
                        ) : (
                          // Fallback to legacy field display
                          <>
                            <span className="break-words">{getMemberFieldValue(member, 'email') || 'No email'}</span>
                            {getMemberFieldValue(member, 'phone') && (
                              <span>{getMemberFieldValue(member, 'phone')}</span>
                            )}
                            {getMemberFieldValue(member, 'department') && (
                              <span>{getMemberFieldValue(member, 'department')}</span>
                            )}
                            {getMemberFieldValue(member, 'studentid') && (
                              <span>ID: {getMemberFieldValue(member, 'studentid')}</span>
                            )}
                          </>
                        )}
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
