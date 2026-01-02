const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Image = require('./models/Image');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Image.deleteMany();

        const images = [
            {
                prompt: "A futuristic city with flying cars and neon lights, cyberpunk style, high detail",
                imageUrl: "https://images.unsplash.com/photo-1545153245-c8c4601346e6", // Placeholder
                style: "Cyberpunk",
                tags: ["city", "future", "neon"]
            },
            {
                prompt: "A serene lake at sunset with mountains in the background, watercolor style",
                imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
                style: "Watercolor",
                tags: ["nature", "landscape"]
            },
            {
                prompt: "Portrait of a robot with human emotions, realistic oil painting",
                imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
                style: "Realistic",
                tags: ["robot", "portrait"]
            },
            {
                prompt: "Abstract geometric shapes floating in space, 3D render, 8k",
                imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853",
                style: "3D Render",
                tags: ["abstract", "space"]
            },
            {
                prompt: "A cute cat wearing sunglasses on a beach, anime style",
                imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
                style: "Anime",
                tags: ["cat", "cute"]
            }
        ];

        await Image.insertMany(images);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
