import express from 'express';
import { body } from 'express-validator';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    uploadProfilePicture,
} from '../controller/authController.js';
import protect from '../middleware/auth.js';
import uploadProfile from '../config/multerProfile.js';

const router = express.Router();

// validation middleware for registration and login
const registerValidation = [
    body('Username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),   
    body('password')
    .notEmpty()
    .withMessage('Password is required')
];


// public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/upload-avatar', protect, uploadProfile.single('image'), uploadProfilePicture);

export default router;