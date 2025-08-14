import React, { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Download, Users, FileText, X, Check, AlertCircle } from 'lucide-react'

const UploadMembersModal = ({ isOpen, onClose, onUploadMembers }) => {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: upload, 2: preview, 3: confirm

  const sampleData = `name,email,phone,department,studentId
John Doe,john.doe@email.com,+1234567890,Computer Science,CS001
Jane Smith,jane.smith@email.com,+1234567891,Engineering,EN002
Bob Johnson,bob.johnson@email.com,+1234567892,Mathematics,MT003`

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file')
      return
    }
    
    setFile(selectedFile)
    setError('')
    parseCSV(selectedFile)
  }

  const parseCSV = (file) => {
    setLoading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          setError('CSV file must contain at least a header row and one data row')
          setLoading(false)
          return
        }
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const requiredHeaders = ['name', 'email']
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
        
        if (missingHeaders.length > 0) {
          setError(`Missing required columns: ${missingHeaders.join(', ')}`)
          setLoading(false)
          return
        }
        
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim())
          const member = {}
          
          headers.forEach((header, i) => {
            member[header] = values[i] || ''
          })
          
          // Validate required fields
          if (!member.name || !member.email) {
            throw new Error(`Row ${index + 2}: Name and email are required`)
          }
          
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(member.email)) {
            throw new Error(`Row ${index + 2}: Invalid email format`)
          }
          
          return member
        })
        
        setCsvData(data)
        setPreview(data.slice(0, 5)) // Show first 5 rows for preview
        setStep(2)
        setLoading(false)
      } catch (error) {
        setError(error.message)
        setLoading(false)
      }
    }
    
    reader.onerror = () => {
      setError('Error reading file')
      setLoading(false)
    }
    
    reader.readAsText(file)
  }

  const handleConfirmUpload = async () => {
    setLoading(true)
    try {
      await onUploadMembers(csvData)
      setStep(3)
    } catch (error) {
      setError('Error uploading members: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setCsvData([])
    setPreview([])
    setError('')
    setStep(1)
    setDragActive(false)
    onClose()
  }

  const downloadSample = () => {
    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = 'sample_members.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Upload className="h-4 w-4 text-white" />
            </div>
            <span>Upload Members</span>
          </DialogTitle>
          <DialogDescription>
            Import members from a CSV file to add them to your room
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            {/* Sample Download */}
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Need a template?</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Download a sample CSV file</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadSample}
                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </Button>
            </div>

            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-slate-300 dark:border-slate-600 hover:border-purple-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Upload CSV File</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                </div>
                
                <div className="text-sm text-slate-500">
                  <p>Required columns: <span className="font-medium">name, email</span></p>
                  <p>Optional columns: phone, department, studentId</p>
                </div>
              </div>
            </div>

            {file && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">{file.name}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Preview Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Preview Members</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {csvData.length} members found. Showing first {preview.length} rows.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setStep(1)}
              >
                <X className="h-4 w-4 mr-2" />
                Change File
              </Button>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Email</th>
                      <th className="text-left p-3 font-medium">Phone</th>
                      <th className="text-left p-3 font-medium">Department</th>
                      <th className="text-left p-3 font-medium">Student ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((member, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="p-3">{member.name}</td>
                        <td className="p-3">{member.email}</td>
                        <td className="p-3">{member.phone || '-'}</td>
                        <td className="p-3">{member.department || '-'}</td>
                        <td className="p-3">{member.studentid || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {csvData.length > preview.length && (
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                ... and {csvData.length - preview.length} more members
              </p>
            )}

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleConfirmUpload}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                disabled={loading}
              >
                {loading ? 'Uploading...' : `Upload ${csvData.length} Members`}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Check className="h-8 w-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                Members Uploaded Successfully!
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {csvData.length} members have been added to your room
              </p>
            </div>

            <Button 
              onClick={handleClose}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UploadMembersModal
