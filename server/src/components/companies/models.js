import mongoose from 'mongoose'

const SessionSchema = new mongoose.Schema(
    {
        publicId: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        company: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Company',
        },
    },
    {
        timestamps: true,
    }
)

export const Session = mongoose.model('Session', SessionSchema)

const CompanyPhotoSchema = new mongoose.Schema(
    {
        privatePath: { type: String, required: true },
        publicPath: { type: String, required: true },
        company: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'Company',
        },
    },
    {
        timestamps: true,
    }
)

export const CompanyPhoto = mongoose.model('CompanyPhoto', CompanyPhotoSchema)

const PointSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const BusinessHours = {
    startsAt: { type: Number, required: true },
    endsAt: { type: Number, required: true },
}

const CompanyData = {
    name: { type: String, required: true },
    description: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    addressCoords: { type: PointSchema, required: true, index: '2dsphere' },
    businessHours: { type: [BusinessHours], required: true },
}

const CompanySchema = new mongoose.Schema(
    {
        companyData: { type: CompanyData, required: false },
        email: { type: String, required: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true,
    }
)

export const Company = mongoose.model('Company', CompanySchema)
