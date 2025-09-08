import express from 'express';
const router = express.Router();
import  adminOnly  from "../middlewares/roleMiddleware.js";
import authMiddleware from '../middlewares/authMiddleware.js'
import { listTemplates,createTemplate,updateTemplate,deleteTemplate} from "../controllers/messageTemplateController.js";


router.get('/:workspaceId/templates', authMiddleware, adminOnly('editor','viewer'), listTemplates);
router.post('/:workspaceId/templates', authMiddleware, adminOnly('editor'), createTemplate);
router.put('/:workspaceId/templates/:id', authMiddleware, adminOnly('editor'), updateTemplate);
router.delete('/:workspaceId/templates/:id', authMiddleware, adminOnly('editor'), deleteTemplate);



export default router; // Export the router to use it in other files