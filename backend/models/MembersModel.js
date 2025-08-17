import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    // Dynamic fields based on room configuration
    dynamicFields: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Keep legacy fields for backward compatibility
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    department: {
        type: String
    },
    studentid: {
        type: String
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Member', memberSchema);