import mongoose from 'mongoose';

// Переменная для отслеживания соединения
let isConnected = false;

// Функция для подключения к MongoDB
async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    // Использовать готовый URI или собрать из компонентов
    let MONGODB_URI = process.env.MONGODB_URI;
    
    // Если URI не задан, собираем его из компонентов
    if (!MONGODB_URI) {
      const username = process.env.MONGODB_USERNAME || 'krasnovinvest';
      const password = process.env.MONGODB_PASSWORD;
      const cluster = process.env.MONGODB_CLUSTER || 'durak.wphttqm.mongodb.net';
      const database = process.env.MONGODB_DATABASE || 'durak';
      
      if (!password) {
        throw new Error('MongoDB password is not defined. Please check your environment variables.');
      }
      
      MONGODB_URI = `mongodb+srv://${username}:${encodeURIComponent(password)}@${cluster}/${database}?retryWrites=true&w=majority`;
    }
    
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectToDatabase; 