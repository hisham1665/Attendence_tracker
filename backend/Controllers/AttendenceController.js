import Attendence from '../models/AttendenceModel.js';

// Create a new attendence record
export const createAttendence = async (req, res) => {
  try {
    const attendence = new Attendence(req.body);
    await attendence.save();
    res.status(201).json(attendence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all attendence records
export const getAllAttendence = async (req, res) => {
  try {
    const attendence = await Attendence.find();
    res.json(attendence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an attendence record by ID
export const getAttendenceById = async (req, res) => {
  try {
    const attendence = await Attendence.findById(req.params.id);
    if (!attendence) return res.status(404).json({ error: 'Attendence not found' });
    res.json(attendence);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an attendence record
export const updateAttendence = async (req, res) => {
  try {
    const attendence = await Attendence.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attendence) return res.status(404).json({ error: 'Attendence not found' });
    res.json(attendence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete an attendence record
export const deleteAttendence = async (req, res) => {
  try {
    const attendence = await Attendence.findByIdAndDelete(req.params.id);
    if (!attendence) return res.status(404).json({ error: 'Attendence not found' });
    res.json({ message: 'Attendence deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
