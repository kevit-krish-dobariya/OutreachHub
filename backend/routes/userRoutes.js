import express from 'express';
import verifyToken from '../middlewares/authMiddleware.js'
import authorizeRoles from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/admin', verifyToken, authorizeRoles("admin") ,(req,res)=> {
    res.json({message: "Welcome Admin "})
})

router.get('/editor', verifyToken,authorizeRoles("admin","editor"),(req,res)=> {
    res.json({message: "Welcome Editor "})
})

router.get('/viewer',verifyToken, authorizeRoles("admin","viewer","editor"),(req,res)=> {
    res.json({message: "Welcome Viewer "})
})

export default router;