const userModel = require('../models/user.model');


module.exports.createUser = async ({ firstName, lastName, email, password }) => {
    // const { firstName, lastName } = fullName; // Destructure fullName object

    // Check if any required field is missing
    if (!firstName || !email || !password) {
        throw new Error('All fields are required');
    }

    // Create the user
    const user = await userModel.create({
        fullName: { firstName, lastName },
        email,
        password
    });

    return user;
}