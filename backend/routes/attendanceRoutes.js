import express from 'express'
import {
  getAttendance,
  getAttendanceById,
  markAttendance,
  markCheckOut,
  bulkMarkAttendance,
  getAttendanceStats,
  deleteAttendance
} from '../Controllers/AttendanceController.js'
import authenticateToken from '../middleware/auth.js'

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// GET /api/attendance - Get attendance records (with optional session/member filter)
router.get('/', getAttendance)

// GET /api/attendance/:id - Get a single attendance record
router.get('/:id', getAttendanceById)

// POST /api/attendance - Mark attendance (create or update)
router.post('/', markAttendance)

// POST /api/attendance/checkout - Mark check-out time
router.post('/checkout', markCheckOut)

// POST /api/attendance/bulk - Bulk mark attendance
router.post('/bulk', bulkMarkAttendance)

// GET /api/attendance/stats/:session - Get attendance statistics for a session
router.get('/stats/:session', getAttendanceStats)

// DELETE /api/attendance/:id - Delete an attendance record
router.delete('/:id', deleteAttendance)

export default router
