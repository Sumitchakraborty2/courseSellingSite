const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.USER_JWT_SECRET || "s3cret"

function authentication(req, res, next) {
    const token = req.headers.authorization;

    if(!token) return res.status(403).json({
        message: "token not found"
    })

    try{
        const payload = jwt.verify(token,JWT_SECRET);        
        req.id = payload.id;
        next();
    } catch(err) {
        res.status(401).json({message: `Error while verifying token ${err}`});
        
    }
    
}

module.exports = {
    authentication
}