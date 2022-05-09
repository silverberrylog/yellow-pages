import mongoose from 'mongoose'

export default async () => {
    const { connection } = await mongoose.connect(process.env.MONGO_URI)

    if (process.env.NODE_ENV === 'test') {
        const collections = await connection.db.collections()

        for (const collection of collections) {
            await collection.deleteMany({})
        }
    }
}
