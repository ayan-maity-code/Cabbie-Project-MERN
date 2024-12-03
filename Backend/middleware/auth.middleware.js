const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklist.token.model");
const captainModel = require("../models/captain.model");
module.exports.authUser = async (req, res, next) => {
    const token = req.cookies.token ||req.headers.authorization ?.split(" ")[1]; 
        if(!token){
            return res.status(401).send({ error: "Unauthorized" });
        }

        // if  the token is sotored in local storage then clear this
        const isBlackListed = await blacklistTokenModel.findOne({token:token});

        if(isBlackListed){
            return res.status(401).send({ error: "Unauthorized" });
        }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        req.user = user;

       return next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate" });
    }
};

module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token ||req.headers.authorization ?.split(" ")[1]; 
        if(!token){
            return res.status(401).send({ error: "Unauthorized" });
        }

        // if  the token is sotored in local storage then clear this
        const isBlackListed = await blacklistTokenModel.findOne({token:token});

        if(isBlackListed){
            return res.status(401).send({ error: "Unauthorized" });
        }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);

        if (!captain) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        req.captain = captain;

       return next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate" });
    }
};