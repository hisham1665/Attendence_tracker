import express from 'express';
import { createMember, getAllMembers, getMemberById, updateMember, deleteMember } from '../Controllers/MembersController.js';

const router = express.Router();

router.post('/createMember', createMember);
router.get('/getAllMembers', getAllMembers);
router.get('/getMemberById/:id', getMemberById);
router.put('/updateMember/:id', updateMember);
router.delete('/deleteMember/:id', deleteMember);

export default router;
