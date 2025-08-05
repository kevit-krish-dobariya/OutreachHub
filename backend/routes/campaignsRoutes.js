import express from 'express';
const router = express.Router();
import  adminOnly  from "../middlewares/roleMiddleware.js";
import authMiddleware from '../middlewares/authMiddleware.js'
import { listCampaigns,viewCampaign,createCampaign,updateCampaign,deleteCampaign,launchCampaign,logCampaignMessage} from "../controllers/campaignsController.js";


router.get('/:workspaceId/campaigns', authMiddleware, adminOnly('editor','viewer'), listCampaigns);
router.get("/:workspaceId/campaigns/:id",authMiddleware, adminOnly('editor','viewer'), viewCampaign);
router.post('/:workspaceId/campaigns', authMiddleware, adminOnly('editor'), createCampaign);
router.put('/:workspaceId/campaigns/:id', authMiddleware, adminOnly('editor'), updateCampaign);
router.delete('/:workspaceId/campaigns/:id', authMiddleware, adminOnly('editor'), deleteCampaign);

router.post("/:workspaceId/campaigns/:id/launch",authMiddleware, adminOnly("editor"), launchCampaign);
router.post("/:workspaceId/campaigns/:id/log", authMiddleware,adminOnly("editor"), logCampaignMessage);


export default router; // Export the router to use it in other files
