import mongoose from 'mongoose';

const AttendenceSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
        required: true
    },
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Attendence', AttendenceSchema);