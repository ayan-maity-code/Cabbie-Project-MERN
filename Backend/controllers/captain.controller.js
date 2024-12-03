const captainModel = require("../models/captain.model");
const blacklistTokenModel = require("../models/blacklist.token.model");
const {validationResult} = require("express-validator");
const captainServices = require("../services/captain.services");
module.exports.registerCaptain = async (req, res) => {
    const errors = validationResult(req);

    if(! errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {fullname,email,password,vehicle} = req.body;

    const isCaptainExists = await captainModel.findOne({email});
    if(isCaptainExists){
        return res.status(400).json({errors: [{msg: 'Captain already exists'}]});
    }
    const hashedPassword = await captainModel.hashPassword(password);
    const captain = await captainServices.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    })

    const token = captain.generateAuthToken();
    console.log("Captain registered successfully");
    
    res.status(201).json({token,captain});
}

module.exports.loginCaptain = async (req, res) => {
    const errors = validationResult(req);

    if(! errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }   

    const {email,password} = req.body;
    const captain = await captainModel.findOne({email}).select('+password');
    if(!captain){
        return res.status(401).json({errors: [{msg: 'Invalid Credentials'}]});
    }

    const isMatch = await captain.comparePassword(password);

    if(!isMatch){
        return res.status(401).json({errors: [{msg: 'Invalid Credentials'}]});
    }

    const token = captain.generateAuthToken();
    res.cookie('token', token);
    res.status(200).json({token,captain});
}

module.exports.getCaptainProfile = async (req, res) => {
    const captain = req.captain;
    res.status(200).json({captain});
}

module.exports.logoutCaptain = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];
    await blacklistTokenModel.create({token});
    res.clearCookie('token');
    res.status(200).json({message: "Logout Successfully"});
}
