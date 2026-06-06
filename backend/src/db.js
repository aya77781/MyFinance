import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connecte');
  } catch (err) {
    console.error('Echec de connexion a MongoDB :', err.message);
    process.exit(1);
  }
}
