import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, X, FileText, Star } from 'lucide-react'

const CreateRoomModal = ({ isOpen, onClose, onCreateRoom }) => {
  const [currentStep, setCurrentStep] = useState('basic')
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [fieldConfiguration, setFieldConfiguration] = useState({
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'email', type: 'email', required: false }
    ],
    primaryField: 'name'
  })
  const [loading, setLoading] = useState(false)

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const roomData = {
        ...formData,
        fieldConfiguration
      }

      await onCreateRoom(roomData)
      
      // Reset form
      setFormData({ title: '', description: '' })
      setFieldConfiguration({
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'email', required: false }
        ],
        primaryField: 'name'
      })
      setCurrentStep('basic')
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setLoading(false)
    }
  }

  const addField = () => {
    setFieldConfiguration(prev => ({
      ...prev,
      fields: [...prev.fields, { name: '', type: 'text', required: false }]
    }))
  }

  const removeField = (index) => {
    setFieldConfiguration(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }))
  }

  const updateField = (index, key, value) => {
    setFieldConfiguration(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => 
        i === index ? { ...field, [key]: value } : field
      )
    }))
  }

  const handleClose = () => {
    setFormData({ title: '', description: '' })
    setFieldConfiguration({
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: false }
      ],
      primaryField: 'name'
    })
    setCurrentStep('basic')
    onClose()
  }

  const isStepValid = (step) => {
    switch (step) {
      case 'basic':
        return formData.title.trim() !== ''
      case 'fields':
        return fieldConfiguration.fields.length > 0 && 
               fieldConfiguration.fields.every(f => f.name.trim() !== '') &&
               fieldConfiguration.primaryField !== ''
      default:
        return true
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Room
          </DialogTitle>
          <DialogDescription>
            Set up your room with custom fields. Supports CSV and Excel file uploads.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="relative">
              Basic Info
              {isStepValid('basic') && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>}
            </TabsTrigger>
            <TabsTrigger value="fields" className="relative">
              Fields Setup
              {isStepValid('fields') && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>}
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="mt-6">
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Room Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Annual Conference 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-2 focus:border-purple-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="border-2 focus:border-purple-400"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setCurrentStep('fields')}
                  disabled={!isStepValid('basic')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Next: Setup Fields
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Define Your CSV/File Fields</Label>
                  <Button type="button" onClick={addField} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </Button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {fieldConfiguration.fields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Input
                        placeholder="Field name (e.g., name, email, phone)"
                        value={field.name}
                        onChange={(e) => updateField(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      
                      <Select 
                        value={field.type} 
                        onValueChange={(value) => updateField(index, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(index, 'required', e.target.checked)}
                          className="rounded"
                        />
                        <Label className="text-xs">Required</Label>
                      </div>

                      <Button
                        type="button"
                        onClick={() => removeField(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        disabled={fieldConfiguration.fields.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Primary Identifier Field *</Label>
                  <Select 
                    value={fieldConfiguration.primaryField} 
                    onValueChange={(value) => setFieldConfiguration(prev => ({ ...prev, primaryField: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldConfiguration.fields
                        .filter(field => field.name.trim() !== '')
                        .map(field => (
                        <SelectItem key={field.name} value={field.name}>
                          <div className="flex items-center space-x-2">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{field.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    This field will be used as the main identifier for attendance tracking
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentStep('basic')}
                >
                  Previous
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !isStepValid('fields')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {loading ? 'Creating...' : 'Create Room'}
                </Button>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default CreateRoomModal
