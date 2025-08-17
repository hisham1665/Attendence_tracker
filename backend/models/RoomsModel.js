import mongoose from 'mongoose';

const RoomsSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Dynamic field configuration for CSV/file uploads
    fieldConfiguration: {
        fields: [{
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ['text', 'email', 'phone', 'number', 'date'],
                default: 'text'
            },
            required: {
                type: Boolean,
                default: false
            }
        }],
        primaryField: {
            type: String,
            required: true,
            default: 'name'
        }
    }
}, {
    timestamps: true
});

export default mongoose.model('Room', RoomsSchema);