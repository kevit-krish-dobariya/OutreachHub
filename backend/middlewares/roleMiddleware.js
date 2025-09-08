
const authorizeRoles = (...allowedRoles)=> {
    return (req,res,next)=> {
        if(!allowedRoles.includes(req.user.role))
        {
            return res.status(403).json({message:"You do not have access to this resource"});
        }
        next();
    }
}

export default authorizeRoles;