import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react'

const CreateSessionModal = ({ isOpen, onClose, onCreateSession, editingSession, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'lecture'
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Populate form data when editing
  useEffect(() => {
    if (isEditing && editingSession) {
      const sessionDate = new Date(editingSession.date)
      const formattedDate = sessionDate.toISOString().split('T')[0]
      
      setFormData({
        title: editingSession.title || '',
        description: editingSession.description || '',
        date: formattedDate,
        startTime: editingSession.startTime || '',
        endTime: editingSession.endTime || '',
        location: editingSession.location || '',
        type: editingSession.type || 'lecture'
      })
    } else {
      // Reset form for creating new session
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        type: 'lecture'
      })
    }
  }, [isEditing, editingSession, isOpen])

  const sessionTypes = [
    { value: 'lecture', label: 'Lecture', icon: '📚' },
    { value: 'workshop', label: 'Workshop', icon: '🔧' },
    { value: 'meeting', label: 'Meeting', icon: '🤝' },
    { value: 'seminar', label: 'Seminar', icon: '🎓' },
    { value: 'training', label: 'Training', icon: '💪' },
    { value: 'conference', label: 'Conference', icon: '🎤' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required'
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setLoading(true)
    
    try {
      // Combine date and time
      const sessionDateTime = new Date(`${formData.date}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`)
      
      const sessionData = {
        ...formData,
        date: sessionDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        duration: Math.round((endDateTime - sessionDateTime) / (1000 * 60)) // duration in minutes
      }
      
      await onCreateSession(sessionData)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        type: 'lecture'
      })
      setErrors({})
    } catch (error) {
      console.error('Error creating session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      type: 'lecture'
    })
    setErrors({})
    onClose()
  }

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <span>{isEditing ? 'Edit Session' : 'Create New Session'}</span>
          </DialogTitle>
          <DialogDescription>
            Set up a new attendance session for your event. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Session Title *</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Introduction to React"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Session Type */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Session Type</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {sessionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.type === type.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  <div className="text-center space-y-1">
                    <div className="text-lg">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Date *</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                min={today}
                value={formData.date}
                onChange={handleInputChange}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Start *</span>
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                className={errors.startTime ? 'border-red-500' : ''}
              />
              {errors.startTime && <p className="text-sm text-red-500">{errors.startTime}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>End *</span>
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                className={errors.endTime ? 'border-red-500' : ''}
              />
              {errors.endTime && <p className="text-sm text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g., Conference Room A, Online, Building 123"
              value={formData.location}
              onChange={handleInputChange}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of the session content or agenda..."
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={loading}
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Session' : 'Create Session')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSessionModal
