import mongoose, { Schema, model, models } from 'mongoose';

const PromptSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    prompt: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    style: {
        type: String,
        default: 'General',
    },
    keywords: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        default: 'Men',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Prevent overwrite on HMR
const Prompt = models.Prompt || model('Prompt', PromptSchema);

export default Prompt;
