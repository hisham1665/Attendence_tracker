import express from 'express';
import { 
  createUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  signup, 
  login,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getUserStats
} from '../Controllers/UserController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);

// Admin routes
router.post('/createUser', createUser);
router.get('/getAllUsers', getAllUsers);
router.get('/getUserById/:id', getUserById);
router.put('/updateUser/:id', updateUser);
router.delete('/deleteUser/:id', deleteUser);

// Profile routes (protected)
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/change-password', authMiddleware, changePassword);
router.get('/stats', authMiddleware, getUserStats);

export default router;
