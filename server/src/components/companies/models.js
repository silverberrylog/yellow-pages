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

const CompanyDataSchema = new mongoose.Schema(
    {},
    {
        timestamps: true,
    }
)

const CompanySchema = new mongoose.Schema(
    {
        companyData: { type: CompanyDataSchema, required: false },
        email: { type: String, required: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true,
    }
)

export const Company = mongoose.model('Company', CompanySchema)
