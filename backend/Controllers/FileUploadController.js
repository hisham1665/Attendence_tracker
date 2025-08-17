import multer from 'multer'
import csv from 'csv-parser'
import xlsx from 'xlsx'
import fs from 'fs'
import path from 'path'
import Member from '../models/MembersModel.js'
import Room from '../models/RoomsModel.js'

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, and PDF files are allowed.'))
    }
  }
})

// Parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject)
  })
}

// Parse Excel file
const parseExcel = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = xlsx.utils.sheet_to_json(worksheet)
    return jsonData
  } catch (error) {
    throw new Error('Failed to parse Excel file: ' + error.message)
  }
}

// Parse PDF file (basic text extraction)
const parsePDF = async (filePath) => {
  // This would require a PDF parsing library like pdf-parse
  // For now, return a placeholder
  return [{ extractedText: 'PDF parsing not yet implemented' }]
}

// Upload and process members file
export const uploadMembersFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const { roomId, fieldMapping, primaryField } = req.body
    
    // Validate room exists and user has access
    const room = await Room.findOne({ 
      _id: roomId, 
      createdBy: req.user._id 
    })
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    // Parse field mapping
    let mapping
    try {
      mapping = JSON.parse(fieldMapping)
    } catch (error) {
      return res.status(400).json({ message: 'Invalid field mapping format' })
    }

    const filePath = req.file.path
    const fileExtension = path.extname(req.file.originalname).toLowerCase()
    
    let fileData = []
    
    // Parse file based on extension
    try {
      switch (fileExtension) {
        case '.csv':
          fileData = await parseCSV(filePath)
          break
        case '.xlsx':
        case '.xls':
          fileData = parseExcel(filePath)
          break
        case '.pdf':
          fileData = await parsePDF(filePath)
          break
        default:
          throw new Error('Unsupported file format')
      }
    } catch (parseError) {
      // Clean up uploaded file
      fs.unlinkSync(filePath)
      return res.status(400).json({ message: 'Failed to parse file: ' + parseError.message })
    }

    // Process and validate data
    const processedMembers = []
    const errors = []
    
    for (let i = 0; i < fileData.length; i++) {
      const row = fileData[i]
      const memberData = { dynamicFields: {}, room: roomId }
      
      try {
        // Map fields according to configuration
        for (const [roomField, fileColumn] of Object.entries(mapping)) {
          if (fileColumn && fileColumn !== 'none' && row[fileColumn] !== undefined) {
            const value = String(row[fileColumn]).trim()
            
            // Validate required fields
            const fieldConfig = room.fieldConfiguration.fields.find(f => f.name === roomField)
            if (fieldConfig && fieldConfig.required && !value) {
              throw new Error(`Required field "${roomField}" is empty`)
            }
            
            // Store in dynamic fields
            memberData.dynamicFields[roomField] = value
            
            // Also store in legacy fields for backward compatibility
            if (roomField === 'name') memberData.name = value
            if (roomField === 'email') memberData.email = value
            if (roomField === 'phone') memberData.phone = value
            if (roomField === 'department') memberData.department = value
            if (roomField === 'studentid') memberData.studentid = value
          }
        }
        
        // Validate primary field exists
        if (!memberData.dynamicFields[primaryField]) {
          throw new Error(`Primary field "${primaryField}" is required`)
        }
        
        processedMembers.push(memberData)
        
      } catch (error) {
        errors.push({
          row: i + 1,
          error: error.message,
          data: row
        })
      }
    }
    
    // Save valid members to database
    let savedMembers = []
    if (processedMembers.length > 0) {
      try {
        savedMembers = await Member.insertMany(processedMembers)
      } catch (dbError) {
        // Clean up uploaded file
        fs.unlinkSync(filePath)
        return res.status(500).json({ 
          message: 'Database error while saving members: ' + dbError.message 
        })
      }
    }
    
    // Clean up uploaded file
    fs.unlinkSync(filePath)
    
    // Return results
    res.json({
      success: true,
      message: `Successfully processed ${savedMembers.length} members`,
      stats: {
        totalRows: fileData.length,
        successful: savedMembers.length,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined,
      members: savedMembers
    })
    
  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    console.error('Upload error:', error)
    res.status(500).json({ message: error.message })
  }
}

// Middleware export
export const uploadMiddleware = upload.single('file')
