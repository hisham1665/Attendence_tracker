import express from 'express';
import { createRoom, getAllRooms, getRoomById, updateRoom, deleteRoom } from '../Controllers/RoomsController.js';

const router = express.Router();

router.post('/createRoom', createRoom);
router.get('/getAllRooms', getAllRooms);
router.get('/getRoomById/:id', getRoomById);
router.put('/updateRoom/:id', updateRoom);
router.delete('/deleteRoom/:id', deleteRoom);

export default router;
