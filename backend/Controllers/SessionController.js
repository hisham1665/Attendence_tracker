import Session from '../models/SessionModel.js';

// Create a new session
export const createSession = async (req, res) => {
  try {
    const sessionData = {
      ...req.body,
      user: req.user._id // Automatically assign user from JWT
    };
    const session = new Session(sessionData);
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all sessions
export const getAllSessions = async (req, res) => {
  try {
    const { room } = req.query;
    const query = {};
    
    // Filter by room if provided
    if (room) query.room = room;
    
    // Only get sessions for the authenticated user
    query.user = req.user._id;
    
    const sessions = await Session.find(query)
      .populate('room', 'name description')
      .sort({ date: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a session by ID
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a session
export const updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a session
export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
