import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    })
}

//@desc  Register new user
//@route POST /api/auth/register
//@access Public    

export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        // Check if User Exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({
                success: false,
                error: userExists.email === email ? 'Email already registered' : 'Username already taken'
            });
        } 

        // Use () for function calls, not []
        const user = await User.create({ 
            username,
            email, 
            password,
        });

        //Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "User registered Successfully", // Moved inside the object
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        next(error);
    }
};

//@desc Login User
//@routes POST/api/auth/login
//@access Public

export const login  = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate Inputs
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password',
                statusCode: 400
            });
        }
        // Check for user (include password for comparison)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                statusCode: 401
            });
        }
        // Check Password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                statusCode: 401,
            });
        }

        //Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
            token,
            message: "Login successful",
        });
    } catch (error) {
        next(error);
    }
}

//@desc   GET user profile
//@routes GET/api/auth/login
//@access Private

export const getProfile = async (req, res, next) => {
    try {
        const user  = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
}

//@desc Update user profile
//@routes PUT/api/auth/login
//@access Private

export const updateProfile = async (req, res, next) => {
    try {
        const { username, email, profilePicture } = req.body;

        const user = await User.findById(req.user._id);
        
        if (username) user.username = username;
        if (email) user.email = email;
        if (profilePicture) user.profilePicture = profilePicture;

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
            message: "Profile updated successfully",
        });
    } catch (error) {
        next(error);
    }
}

//@desc ChangePassword
//@routes POST/api/auth/login
//@access Private
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Please provide current and new password',
                statusCode: 400,
            });
        }
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect',
                statusCode: 401,
            });
        }
        
        // Update to new password

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
}

//@desc Upload profile picture
//@routes POST/api/auth/upload-avatar
//@access Private
export const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a valid image file',
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Generate the URL path for the frontend to access
        const imageUrl = `/uploads/profiles/${req.file.filename}`;
        
        user.profilePicture = imageUrl;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            data: {
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        next(error);
    }
}