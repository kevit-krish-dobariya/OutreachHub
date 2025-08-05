import express from 'express';
const router = express.Router();
import  adminOnly  from "../middlewares/roleMiddleware.js";
import authMiddleware from '../middlewares/authMiddleware.js'
import { listContacts,addContacts,updateContacts,deleteContacts} from "../controllers/contactsController.js";


router.get('/:workspaceId/contacts', authMiddleware, adminOnly('editor','viewer'),listContacts);
router.post('/:workspaceId/contacts', authMiddleware, adminOnly('editor'),addContacts);
router.put('/:workspaceId/contacts/:id', authMiddleware, adminOnly('editor'),updateContacts);
router.delete('/:workspaceId/contacts', authMiddleware, adminOnly('editor'),deleteContacts);


export default router; // Export the router to use it in other files