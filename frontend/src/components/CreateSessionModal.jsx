import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Plus } from 'lucide-react'

const CreateSessionModal = ({ isOpen, onClose, onCreateSession, editingSession, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: ''
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
        date: formattedDate
      })
    } else {
      // Reset form for creating new session
      setFormData({
        title: '',
        date: ''
      })
    }
  }, [isEditing, editingSession, isOpen])

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
      const sessionData = {
        title: formData.title,
        date: formData.date
      }
      
      await onCreateSession(sessionData)
      
      // Reset form
      setFormData({
        title: '',
        date: ''
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
