const userModel = require("../models/user.model");
const userServices = require("../services/user.services");
const {validationResult} = require("express-validator");
const blacklistTokenModel = require("../models/blacklist.token.model");
module.exports.registerUser = async(req, res) => {
    const errors = validationResult(req);
    if( ! errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    
    const {fullName,email,password} = req.body;
    const hashedPassword = await userModel.hashPassword(password);
    const user = await userServices.createUser({
        firstName: fullName.firstName,
        lastName: fullName.lastName,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();
    res.status(201).json({token,user});
}

module.exports.loginUser = async(req, res) => {
    const errors = validationResult(req);

    if( ! errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email,password} = req.body;

    const user = await userModel.findOne({email}).select('+password');
    if(!user){
        return res.status(401).json({errors: [{msg: 'Invalid Credentials'}]});
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
        return res.status(401).json({errors: [{msg: 'Invalid Credentials'}]});
    }

    const token = user.generateAuthToken();
    res.cookie('token', token);
    res.status(200).json({token,user});
}

module.exports.getUserProfile = async (req, res) => {
    const user = req.user;
    
    
    res.status(200).json({user});

}

module.exports.logoutUser = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    await blacklistTokenModel.create({token});
    res.clearCookie('token');
    res.status(200).json({message: "Logout Successfully"});
}