const bcrypt = require('bcrypt');
const {userModel} = require('../db')

function hash(req, res, next) {
    try{
        const password = req.userDetails.password;
        
        const saltingRounds = 10;

        bcrypt.genSalt(saltingRounds, (err, salt) => {
            bcrypt.hash(password, salt, (err, hashedPassword) => {
                req.hashedPassword = hashedPassword;
                next();
            })
        })

    } catch(err) {
        // Handle any error that may occur
        console.error(`Error while hashing password: ${err}`);
        res.status(500).send("We will be right back");
    }
}

async function verifyPassword(req, res, next) {
    try{
        const {email , password} = req.userDetails;
        if (!password && !email) return res.status(400).json({
            message: "email and password required"
        })

        const foundUser = await userModel.findOne({
            email
        });
        
        if(foundUser){
           bcrypt.compare(password, foundUser.password, (err, result) => {
            if(result) {
                req.verifiedUser = foundUser;
                next();
            } else{
                res.status(401).json({
                    message: "password didn't match"
                })
            }
           }) 
        } else{
            res.status(404).json({
                message: "user not found"
            })
        } 

    } catch(err) {
        // Handle any error that may occur
        console.error(`Error while hashing password: ${err}`);
        res.status(500).send("We will be right back");
    }
}

module.exports = {
    hash,
    verifyPassword
};