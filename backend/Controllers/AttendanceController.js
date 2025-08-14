import AttendenceModel from '../models/AttendenceModel.js'
import mongoose from 'mongoose'

// Get attendance records for a session
export const getAttendance = async (req, res) => {
  try {
    const { session, member } = req.query
    const query = {}
    
    if (session) query.session = session
    if (member) query.member = member
    
    const attendance = await AttendenceModel.find(query)
      .populate('member', 'name email phone department studentid')
      .populate('session', 'title date')
      .sort({ timestamp: -1 })
    
    res.json(attendance)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single attendance record
export const getAttendanceById = async (req, res) => {
  try {
    const attendance = await AttendenceModel.findById(req.params.id)
      .populate('member', 'name email phone department studentid')
      .populate('session', 'title date')
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' })
    }
    
    res.json(attendance)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create or update attendance record
export const markAttendance = async (req, res) => {
  try {
    const { member, session, status, timestamp } = req.body
    
    // Check if attendance record already exists
    let attendance = await AttendenceModel.findOne({ member, session })
    
    if (attendance) {
      // Update existing record
      attendance.status = status
      attendance.timestamp = timestamp || new Date()
      
      // Update check-in/check-out times based on status
      if (status === 'present' || status === 'late') {
        if (!attendance.checkInTime) {
          attendance.checkInTime = timestamp || new Date()
        }
      } else if (status === 'absent') {
        attendance.checkInTime = null
        attendance.checkOutTime = null
      }
      
      await attendance.save()
    } else {
      // Create new record
      attendance = new AttendenceModel({
        member,
        session,
        status,
        timestamp: timestamp || new Date(),
        checkInTime: (status === 'present' || status === 'late') ? (timestamp || new Date()) : null
      })
      
      await attendance.save()
    }
    
    await attendance.populate('member', 'name email phone department studentid')
    await attendance.populate('session', 'title date')
    
    res.status(201).json(attendance)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update check-out time
export const markCheckOut = async (req, res) => {
  try {
    const { member, session, timestamp } = req.body
    
    const attendance = await AttendenceModel.findOne({ member, session })
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' })
    }
    
    attendance.checkOutTime = timestamp || new Date()
    await attendance.save()
    
    await attendance.populate('member', 'name email phone department studentid')
    await attendance.populate('session', 'title date')
    
    res.json(attendance)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Bulk mark attendance
export const bulkMarkAttendance = async (req, res) => {
  try {
    const { attendanceRecords } = req.body
    
    if (!Array.isArray(attendanceRecords)) {
      return res.status(400).json({ message: 'Attendance records array is required' })
    }
    
    const savedRecords = []
    
    for (const record of attendanceRecords) {
      const { member, session, status, timestamp } = record
      
      let attendance = await AttendenceModel.findOne({ member, session })
      
      if (attendance) {
        attendance.status = status
        attendance.timestamp = timestamp || new Date()
        
        if (status === 'present' || status === 'late') {
          if (!attendance.checkInTime) {
            attendance.checkInTime = timestamp || new Date()
          }
        } else if (status === 'absent') {
          attendance.checkInTime = null
          attendance.checkOutTime = null
        }
        
        await attendance.save()
      } else {
        attendance = new AttendenceModel({
          member,
          session,
          status,
          timestamp: timestamp || new Date(),
          checkInTime: (status === 'present' || status === 'late') ? (timestamp || new Date()) : null
        })
        
        await attendance.save()
      }
      
      savedRecords.push(attendance)
    }
    
    res.status(201).json(savedRecords)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Get attendance statistics for a session
export const getAttendanceStats = async (req, res) => {
  try {
    const { session } = req.params
    
    const stats = await AttendenceModel.aggregate([
      { $match: { session: mongoose.Types.ObjectId(session) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])
    
    const result = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    }
    
    stats.forEach(stat => {
      result[stat._id] = stat.count
    })
    
    result.total = Object.values(result).reduce((sum, count) => sum + count, 0)
    result.attendanceRate = result.total > 0 ? Math.round((result.present / result.total) * 100) : 0
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete an attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await AttendenceModel.findByIdAndDelete(req.params.id)
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' })
    }
    
    res.json({ message: 'Attendance record deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
