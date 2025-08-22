import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Users, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import CreateRoomModal from '../components/CreateRoomModal'
import EditRoomModal from '../components/EditRoomModal'
import Navbar from '../components/Navbar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const Dashboard = ({ onRoomSelect, onSettingsClick }) => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [rooms, setRooms] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setRooms(data)
      } else {
        console.error('Failed to fetch rooms')
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (roomData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      })
      
      if (response.ok) {
        fetchRooms() // Refresh the rooms list
        setIsCreateModalOpen(false)
      }
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  const filteredRooms = rooms.filter(room =>
    room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/rooms/${roomId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          fetchRooms() // Refresh the rooms list
        }
      } catch (error) {
        console.error('Error deleting room:', error)
      }
    }
  }

  const handleEditRoom = (room) => {
    setSelectedRoomForEdit(room)
    setIsEditModalOpen(true)
  }

  const handleUpdateRoom = async (roomId, roomData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      })
      
      if (response.ok) {
        fetchRooms() // Refresh the rooms list
        setIsEditModalOpen(false)
        setSelectedRoomForEdit(null)
      }
    } catch (error) {
      console.error('Error updating room:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 transition-all duration-500">
        <Navbar 
          title={`Welcome back, ${user?.name}! 👋`} 
          subtitle="Manage your event rooms and track attendance" 
          onSettingsClick={onSettingsClick}
        />
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Navbar */}

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-80 border-2 focus:border-purple-400 transition-colors duration-200"
            />
          </div>
          
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Total Rooms Display */}
        <div className="flex mt-6 mb-2">
          <div className="flex items-center space-x-3 text-center">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300">
              You have 
              <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 mx-2">
                {rooms.length}
              </span>
              {rooms.length === 1 ? 'room' : 'rooms'} created
            </span>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {filteredRooms.map((room) => (
              <Card 
                key={room._id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 dark:hover:border-purple-600"
                onClick={() => onRoomSelect(room)}
              >
                <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                        {room.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm line-clamp-2">
                        {room.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 sm:transition-opacity ml-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleEditRoom(room)
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Room
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteRoom(room._id)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span>{room.memberCount || 0} members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📅 {room.sessionCount || 0} sessions</span>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="group-hover:border-purple-400 self-start sm:self-center">
                      {room.status || 'Active'}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 sm:mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto group-hover:bg-purple-50 group-hover:border-purple-300 dark:group-hover:bg-purple-900/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRoomSelect(room)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRooms.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">No rooms found</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchTerm ? 'Try searching with different keywords' : 'Create your first room to get started!'}
                  </p>
                </div>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Room
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <CreateRoomModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
      
      <EditRoomModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRoomForEdit(null)
        }}
        onUpdateRoom={handleUpdateRoom}
        room={selectedRoomForEdit}
      />
    </div>
  )
}

export default Dashboard
