const express = require('express');
const router = express.Router();
const Image = require('../models/Image');

// @desc    Get all images
// @route   GET /api/images
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { prompt: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }, // Search in tags array
                { style: { $regex: search, $options: 'i' } } // Search in style
            ];
        }

        const images = await Image.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Image.countDocuments(query);

        res.json({
            images,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Add a new image
// @route   POST /api/images
// @access  Admin (Protected in future)
router.post('/', async (req, res) => {
    const { prompt, imageUrl, style, tags } = req.body;

    if (!prompt || !imageUrl) {
        return res.status(400).json({ message: 'Please provide prompt and image URL' });
    }

    try {
        const image = new Image({
            prompt,
            imageUrl,
            style,
            tags
        });

        const createdImage = await image.save();
        res.status(201).json(createdImage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete an image
// @route   DELETE /api/images/:id
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (image) {
            await image.deleteOne();
            res.json({ message: 'Image removed' });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
