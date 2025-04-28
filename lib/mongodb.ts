import mongoose from 'mongoose';

// Переменная для отслеживания соединения
let isConnected = false;

// Функция для подключения к MongoDB
async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://krasnovinvest:durak-mongodb-password@durak.wphttqm.mongodb.net/durak?retryWrites=true&w=majority';
    
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectToDatabase; 