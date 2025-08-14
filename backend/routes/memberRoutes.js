import express from 'express'
import {
  getMembers,
  getMemberById,
  createMember,
  bulkCreateMembers,
  updateMember,
  deleteMember
} from '../Controllers/MemberController.js'
import authenticateToken from '../middleware/auth.js'

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateToken)

// GET /api/members - Get all members (with optional room filter)
router.get('/', getMembers)

// GET /api/members/:id - Get a single member
router.get('/:id', getMemberById)

// POST /api/members - Create a new member
router.post('/', createMember)

// POST /api/members/bulk - Bulk create members
router.post('/bulk', bulkCreateMembers)

// PUT /api/members/:id - Update a member
router.put('/:id', updateMember)

// DELETE /api/members/:id - Delete a member
router.delete('/:id', deleteMember)

export default router
