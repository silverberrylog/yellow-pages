import mongoose from 'mongoose'

const SessionSchema = new mongoose.Schema(
    {
        publicId: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        account: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Account',
        },
    },
    {
        timestamps: true,
    }
)
export const Session = mongoose.model('Session', SessionSchema)

const AccountSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true,
    }
)

export const Account = mongoose.model('Account', AccountSchema)
