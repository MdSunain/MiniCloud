import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const deleteUser = async (req, res) => {
    try {
        const userId = req.user.id;  // This comes from the authMiddleware
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

export const registerUser = async (req, res) => {
    const {name,email,password} = req.body;

    try {
        let user = await User.findOne({email});
        if(user) return res.status(400).json({message: "User already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({name,email,password: hashedPassword});
        await user.save();

        res.status(201).json({message: "Registered Successfully"});
        
    } catch (error) {
        res.status(500).json({message:" Boom!"});
    }
};

export const loginUser = async (req,res)=>{
    const {email,password} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message:"No User Found"});
        
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch)  return res.status(400).json({message:"Invalid Credentials"});
        // include email in the token so downstream middleware/controllers can access it
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({message: 'Login successful', token,user: {
    name: user.name,
    email: user.email
  } });
    } catch(error){

        res.status(500).json({message:"Boom!"});
    }
}

export const logoutUser = (req,res)=>{
    res.json({message:"Logged out Successfully"});
}