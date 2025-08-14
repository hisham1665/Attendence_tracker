import MembersModel from '../models/MembersModel.js'

// Get all members for a room
export const getMembers = async (req, res) => {
  try {
    const { room } = req.query
    const query = room ? { room } : {}
    
    const members = await MembersModel.find(query).populate('room', 'title')
    res.json(members)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single member
export const getMemberById = async (req, res) => {
  try {
    const member = await MembersModel.findById(req.params.id).populate('room', 'title')
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    res.json(member)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new member
export const createMember = async (req, res) => {
  try {
    const member = new MembersModel(req.body)
    const savedMember = await member.save()
    
    await savedMember.populate('room', 'title')
    res.status(201).json(savedMember)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Bulk create members
export const bulkCreateMembers = async (req, res) => {
  try {
    const { members, room } = req.body
    
    if (!Array.isArray(members) || !room) {
      return res.status(400).json({ message: 'Members array and room ID are required' })
    }
    
    // Add room to each member
    const membersWithRoom = members.map(member => ({
      ...member,
      room
    }))
    
    const savedMembers = await MembersModel.insertMany(membersWithRoom)
    res.status(201).json(savedMembers)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Update a member
export const updateMember = async (req, res) => {
  try {
    const member = await MembersModel.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('room', 'title')
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    res.json(member)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Delete a member
export const deleteMember = async (req, res) => {
  try {
    const member = await MembersModel.findByIdAndDelete(req.params.id)
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    res.json({ message: 'Member deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
