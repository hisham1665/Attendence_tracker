import express from 'express';
import { createAttendence, getAllAttendence, getAttendenceById, updateAttendence, deleteAttendence } from '../Controllers/AttendenceController.js';

const router = express.Router();

router.post('/createAttendence', createAttendence);
router.get('/getAllAttendence', getAllAttendence);
router.get('/getAttendenceById/:id', getAttendenceById);
router.put('/updateAttendence/:id', updateAttendence);
router.delete('/deleteAttendence/:id', deleteAttendence);

export default router;
