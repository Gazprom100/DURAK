import mongoose from 'mongoose';

// Формат строки подключения: MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/durak';

// Кэш для подключения, чтобы не создавать новое соединение при каждом вызове
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Настройка mongoose для избежания предупреждений
    mongoose.set('strictQuery', false);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('Error connecting to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 