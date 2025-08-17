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
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'))
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
    
    // Convert to JSON with header row as keys
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      header: 1, // Use first row as header
      defval: '', // Default value for empty cells
      raw: false // Parse values as strings
    })
    
    if (jsonData.length === 0) {
      throw new Error('Excel file is empty')
    }
    
    // Convert array of arrays to array of objects
    const headers = jsonData[0].map(header => String(header).trim())
    const data = jsonData.slice(1).map(row => {
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] ? String(row[index]).trim() : ''
      })
      return obj
    }).filter(row => {
      // Filter out completely empty rows
      return Object.values(row).some(value => value && value.trim() !== '')
    })
    
    return data
  } catch (error) {
    throw new Error('Failed to parse Excel file: ' + error.message)
  }
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
      console.log('Field mapping:', mapping)
    } catch (error) {
      return res.status(400).json({ message: 'Invalid field mapping format' })
    }

    const filePath = req.file.path
    const fileExtension = path.extname(req.file.originalname).toLowerCase()
    
    let fileData = []
    
    // Parse file based on extension
    try {
      console.log(`Parsing ${fileExtension} file: ${req.file.originalname}`)
      
      switch (fileExtension) {
        case '.csv':
          fileData = await parseCSV(filePath)
          console.log(`CSV parsed successfully: ${fileData.length} rows`)
          break
        case '.xlsx':
        case '.xls':
          fileData = parseExcel(filePath)
          console.log(`Excel parsed successfully: ${fileData.length} rows`)
          break
        default:
          throw new Error('Unsupported file format. Only CSV and Excel files are supported.')
      }
      
      // Log sample of parsed data for debugging
      if (fileData.length > 0) {
        console.log('Sample parsed data:', JSON.stringify(fileData[0], null, 2))
        console.log('Available columns:', Object.keys(fileData[0]))
      } else {
        throw new Error('No data found in file')
      }
      
    } catch (parseError) {
      console.error('Parse error:', parseError)
      // Clean up uploaded file
      fs.unlinkSync(filePath)
      return res.status(400).json({ message: 'Failed to parse file: ' + parseError.message })
    }

    // Process and validate data
    const processedMembers = []
    const errors = []
    
    console.log(`Processing ${fileData.length} rows with mapping:`, mapping)
    
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
        console.error(`Error processing row ${i + 1}:`, error.message, 'Row data:', row)
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
