import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser, signup, login } from '../Controllers/UserController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/createUser', createUser);
router.get('/getAllUsers', getAllUsers);
router.get('/getUserById/:id', getUserById);
router.put('/updateUser/:id', updateUser);
router.delete('/deleteUser/:id', deleteUser);

export default router;
