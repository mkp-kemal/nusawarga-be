import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/users.models.js';

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'Admin tidak terdaftar' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'username atau password salah!' });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await User.findByIdAndUpdate(user._id, { token });

        res.cookie('jwt', token, { httpOnly: true, maxAge: 5 * 60 * 60 * 1000 });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in' });
    }
};

export const logout = async (req, res) => {
    const authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ message: 'Unauthorized' });

    const userId = req.userId;
    console.log('User ID:', userId);

    try {
        await User.findByIdAndUpdate(userId, { token: "-" });

        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        res.status(500).json({ message: 'Error logging out' });
        console.error('Error logging out:', err.message);
    }
};

export const users = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendapatkan data users', error: error.message });
    }
};

export const getIsAuth = async (req, res) => {
    const token = req.cookies?.jwt || req.headers?.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Sesi login belum dibuat' });
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ message: 'Sesi login sudah dibuat', user: decoded.username });
    } catch (err) {
        res.status(401).json({ message: 'Sesi login expired' });
    }
};

export const decodeToken = (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json(decoded.username);
};
