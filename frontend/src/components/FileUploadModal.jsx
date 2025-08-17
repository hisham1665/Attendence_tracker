import React, { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react'

const FileUploadModal = ({ isOpen, onClose, room, onUploadComplete }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fieldMapping, setFieldMapping] = useState({})
  const [previewData, setPreviewData] = useState([])
  const [errors, setErrors] = useState([])
  const [step, setStep] = useState('upload') // upload, mapping, preview, processing

  const supportedFormats = room?.supportedFormats || ['csv', 'xlsx']
  const roomFields = room?.fieldConfiguration?.fields || []
  const primaryField = room?.fieldConfiguration?.primaryField || 'name'

  const handleFileSelect = useCallback(async (event) => {
    const selectedFile = event.target.files[0]
    if (!selectedFile) return

    // Validate file format
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
    if (!supportedFormats.includes(fileExtension)) {
      setErrors([`File format .${fileExtension} is not supported. Supported formats: ${supportedFormats.join(', ')}`])
      return
    }

    setFile(selectedFile)
    setErrors([])
    
    // Parse file preview
    try {
      const preview = await parseFilePreview(selectedFile, fileExtension)
      setPreviewData(preview)
      setStep('mapping')
      
      // Auto-map fields if column names match
      autoMapFields(preview.headers)
    } catch (error) {
      setErrors([`Error reading file: ${error.message}`])
    }
  }, [supportedFormats])

  const parseFilePreview = async (file, extension) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          let data, headers
          
          if (extension === 'csv') {
            const text = e.target.result
            const lines = text.split('\n').filter(line => line.trim())
            headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
            data = lines.slice(1, 6).map(line => // Preview first 5 rows
              line.split(',').map(cell => cell.trim().replace(/"/g, ''))
            )
          } else if (extension === 'xlsx' || extension === 'xls') {
            // For Excel files, we'll need to use a library like xlsx
            // For now, show a placeholder
            headers = ['Column 1', 'Column 2', 'Column 3']
            data = [['Sample', 'Data', 'Preview']]
          } else if (extension === 'pdf') {
            // PDF parsing would require pdf-parse or similar
            headers = ['Extracted Text']
            data = [['PDF content will be processed...']]
          }
          
          resolve({ headers, data })
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      
      if (extension === 'csv') {
        reader.readAsText(file)
      } else {
        reader.readAsArrayBuffer(file)
      }
    })
  }

  const autoMapFields = (fileHeaders) => {
    const mapping = {}
    
    roomFields.forEach(roomField => {
      const matchingHeader = fileHeaders.find(header => 
        header.toLowerCase().includes(roomField.name.toLowerCase()) ||
        roomField.name.toLowerCase().includes(header.toLowerCase())
      )
      
      if (matchingHeader) {
        mapping[roomField.name] = matchingHeader
      }
    })
    
    setFieldMapping(mapping)
  }

  const validateMapping = () => {
    const errors = []
    
    // Check if primary field is mapped
    if (!fieldMapping[primaryField] || fieldMapping[primaryField] === 'none') {
      errors.push(`Primary field "${primaryField}" must be mapped`)
    }
    
    // Check required fields
    roomFields.forEach(field => {
      if (field.required && (!fieldMapping[field.name] || fieldMapping[field.name] === 'none')) {
        errors.push(`Required field "${field.name}" must be mapped`)
      }
    })
    
    return errors
  }

  const handleUpload = async () => {
    const validationErrors = validateMapping()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setStep('processing')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomId', room._id)
      formData.append('fieldMapping', JSON.stringify(fieldMapping))
      formData.append('primaryField', primaryField)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/members/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadProgress(100)
        onUploadComplete(result)
        handleClose()
      } else {
        const errorData = await response.json()
        setErrors([errorData.message || 'Upload failed'])
      }
    } catch (error) {
      setErrors([`Upload error: ${error.message}`])
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    setFieldMapping({})
    setErrors([])
    setStep('upload')
    setUploadProgress(0)
    setUploading(false)
    onClose()
  }

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={supportedFormats.map(f => `.${f}`).join(',')}
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-4">
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium">Choose file to upload</p>
            <p className="text-sm text-gray-500">
              Supported formats: {supportedFormats.map(f => f.toUpperCase()).join(', ')}
            </p>
          </div>
        </label>
      </div>

      {file && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="font-medium">{file.name}</span>
            <Badge variant="secondary">{file.size} bytes</Badge>
          </div>
        </div>
      )}
    </div>
  )

  const renderMappingStep = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="font-semibold">Map File Columns to Room Fields</h3>
        
        {roomFields.map(field => (
          <div key={field.name} className="flex items-center space-x-4 p-3 border rounded-lg">
            <div className="flex-1">
              <Label className="font-medium">{field.name}</Label>
              {field.required && <span className="text-red-500 ml-1">*</span>}
              {field.name === primaryField && (
                <Badge variant="outline" className="ml-2">Primary</Badge>
              )}
              <p className="text-xs text-gray-500">{field.type}</p>
            </div>
            
            <Select
              value={fieldMapping[field.name] || 'none'}
              onValueChange={(value) => setFieldMapping(prev => ({ 
                ...prev, 
                [field.name]: value === 'none' ? '' : value 
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No mapping</SelectItem>
                {previewData.headers?.map(header => (
                  <SelectItem key={header} value={header}>
                    {header}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {previewData.headers && (
        <div className="mt-6">
          <h4 className="font-medium mb-2">File Preview</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {previewData.headers.map(header => (
                    <th key={header} className="px-3 py-2 text-left font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.data?.slice(0, 3).map((row, i) => (
                  <tr key={i} className="border-t">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  const renderProcessingStep = () => (
    <div className="space-y-4 text-center">
      <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
      <div>
        <h3 className="font-semibold">Processing your file...</h3>
        <p className="text-sm text-gray-500">This may take a few moments</p>
      </div>
      <Progress value={uploadProgress} className="w-full" />
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Members File</span>
          </DialogTitle>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'processing' && renderProcessingStep()}
        </div>

        <div className="flex justify-between items-center pt-4">
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Upload & Process
              </Button>
            </>
          )}
          
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose} className="ml-auto">
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FileUploadModal
