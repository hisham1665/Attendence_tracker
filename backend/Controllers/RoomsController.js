import Room from '../models/RoomsModel.js';

// Create a new room
export const createRoom = async (req, res) => {
  try {
    // Debug logging
    console.log('User from middleware:', req.user);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const roomData = {
      ...req.body,
      createdBy: req.user._id // Get from authenticated user
    };
    
    const room = new Room(roomData);
    await room.save();
    
    // Populate the createdBy field before sending response
    await room.populate('createdBy', 'name email');
    
    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    // Get only rooms created by the authenticated user
    const rooms = await Room.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a room by ID
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    }).populate('createdBy', 'name email');
    
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a room
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
