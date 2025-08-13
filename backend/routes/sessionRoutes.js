import express from 'express';
import { createSession, getAllSessions, getSessionById, updateSession, deleteSession } from '../Controllers/SessionController.js';

const router = express.Router();

router.post('/createSession', createSession);
router.get('/getAllSessions', getAllSessions);
router.get('/getSessionById/:id', getSessionById);
router.put('/updateSession/:id', updateSession);
router.delete('/deleteSession/:id', deleteSession);

export default router;
