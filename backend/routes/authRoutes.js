const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            // Creating a fallback/seed admin if none exists (FOR DEMO ONLY)
            // In production avoid this.
            if (email === 'admin@example.com' && password === 'admin123') {
                // Check if actually exists
                if (!user) {
                    // create on the fly (hashed)
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    const newUser = await User.create({
                        email,
                        password: hashedPassword,
                        isAdmin: true
                    });
                    return res.json({
                        _id: newUser._id,
                        email: newUser.email,
                        isAdmin: newUser.isAdmin,
                        token: generateToken(newUser._id),
                    });
                }
            }

            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
