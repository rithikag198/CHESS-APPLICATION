const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { User } = require('./database');

const JWT_SECRET = process.env.JWT_SECRET || 'chess-app-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

class AuthController {
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;

            const errors = this.validateRegistrationData(username, email, password);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            const existingUser = await User.findOne({
                $or: [{ email }, { username }]
            });

            if (existingUser) {
                return res.status(400).json({ 
                    error: 'User with this email or username already exists' 
                });
            }

            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = new User({
                username,
                email,
                password: hashedPassword
            });

            await user.save();

            const token = this.generateToken(user._id);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    rating: user.rating,
                    gamesPlayed: user.gamesPlayed,
                    gamesWon: user.gamesWon,
                    gamesLost: user.gamesLost,
                    gamesDrawn: user.gamesDrawn
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }

            if (!validator.isEmail(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            user.lastLogin = new Date();
            await user.save();

            const token = this.generateToken(user._id);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    rating: user.rating,
                    gamesPlayed: user.gamesPlayed,
                    gamesWon: user.gamesWon,
                    gamesLost: user.gamesLost,
                    gamesDrawn: user.gamesDrawn,
                    currentGame: user.currentGame
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id)
                .select('-password')
                .populate('currentGame');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    rating: user.rating,
                    gamesPlayed: user.gamesPlayed,
                    gamesWon: user.gamesWon,
                    gamesLost: user.gamesLost,
                    gamesDrawn: user.gamesDrawn,
                    currentGame: user.currentGame,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                }
            });
        } catch (error) {
            console.error('Profile error:', error);
            res.status(500).json({ error: 'Failed to get profile' });
        }
    }

    static async updateProfile(req, res) {
        try {
            const { username, email } = req.body;
            const userId = req.user.id;

            const errors = this.validateUpdateData(username, email, userId);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            const updateData = {};
            if (username) updateData.username = username;
            if (email) updateData.email = email;

            const user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    rating: user.rating,
                    gamesPlayed: user.gamesPlayed,
                    gamesWon: user.gamesWon,
                    gamesLost: user.gamesLost,
                    gamesDrawn: user.gamesDrawn
                }
            });
        } catch (error) {
            console.error('Profile update error:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }

    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ 
                    error: 'Current password and new password are required' 
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ 
                    error: 'New password must be at least 6 characters long' 
                });
            }

            const user = await User.findById(userId);
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isCurrentPasswordValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            const salt = await bcrypt.genSalt(12);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedNewPassword;
            await user.save();

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error('Password change error:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    }

    static generateToken(userId) {
        return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
    }

    static async verifyToken(req, res, next) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ error: 'Access denied. No token provided.' });
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ error: 'Invalid token.' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ error: 'Invalid token.' });
        }
    }

    static validateRegistrationData(username, email, password) {
        const errors = [];

        if (!username || username.length < 3 || username.length > 20) {
            errors.push('Username must be between 3 and 20 characters');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }

        if (!validator.isEmail(email)) {
            errors.push('Invalid email format');
        }

        if (!password || password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }

        return errors;
    }

    static async validateUpdateData(username, email, userId) {
        const errors = [];

        if (username) {
            if (username.length < 3 || username.length > 20) {
                errors.push('Username must be between 3 and 20 characters');
            }

            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                errors.push('Username can only contain letters, numbers, and underscores');
            }

            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                errors.push('Username is already taken');
            }
        }

        if (email) {
            if (!validator.isEmail(email)) {
                errors.push('Invalid email format');
            }

            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                errors.push('Email is already taken');
            }
        }

        return errors;
    }
}

module.exports = AuthController;
