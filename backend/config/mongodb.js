import mongoose from 'mongoose';

export default async function connectDB() {
  const mongoUrl = process.env.MONGODB_URI;
  if (!mongoUrl) {
    throw new Error('Missing env var: MONGODB_URI');
  }

  mongoose.connection.on('connected', () => {
    // eslint-disable-next-line no-console
    console.log('Database Connected');
  });

  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err);
  });

  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 });
}
