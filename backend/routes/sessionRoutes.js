import express from 'express';
import { createSession, getAllSessions, getSessionById, updateSession, deleteSession } from '../Controllers/SessionController.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.post('/', createSession);
router.get('/', getAllSessions);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
