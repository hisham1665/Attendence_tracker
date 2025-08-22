import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    organization: {
        type: String,
        trim: true
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        notifications: {
            email: { type: Boolean, default: true },
            browser: { type: Boolean, default: true }
        },
        language: {
            type: String,
            default: 'en'
        }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;