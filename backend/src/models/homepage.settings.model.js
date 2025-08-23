import mongoose from 'mongoose';
const { Schema } = mongoose;

const homepageSettingsSchema = new Schema({
    schoolInfo: {
        name: {
            type: String,
            required: true,
            default: 'ENSATE'
        },
        description: {
            type: String,
            required: true,
            default: 'School Description'
        },
        images: [{
            type: String
        }]
    },
    timeline: [{
        id: {
            type: String,
            required: true,
            default: () => new mongoose.Types.ObjectId().toString()
        },
        date: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    }],
    companyRanks: [{
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company'
        },
        rank: {
            type: String,
            enum: ['Official', 'Platinum', 'Gold', 'Silver', 'Bronze'],
            required: true
        }
    }],
    sponsors: [{
        name: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            required: false
        },
        rank: {
            type: String,
            enum: ['Premium', 'Gold', 'Silver'],
            required: true
        }
    }]
}, {
    timestamps: true
});

// Ensure only one settings document exists
homepageSettingsSchema.pre('save', async function(next) {
    const count = await this.constructor.countDocuments();
    if (count > 0 && !this.isModified()) {
        throw new Error('Only one homepage settings document can exist');
    }
    next();
});

export default mongoose.model('HomepageSettings', homepageSettingsSchema);
