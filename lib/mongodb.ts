import mongoose from 'mongoose';

// Переменная для отслеживания соединения
let isConnected = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 5;

// Функция для подключения к MongoDB
async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  if (connectionAttempts >= MAX_ATTEMPTS) {
    console.warn(`Exceeded maximum MongoDB connection attempts (${MAX_ATTEMPTS}). Using fallback mode.`);
    return;
  }

  connectionAttempts++;

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
    
    // Добавляем таймаут подключения
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 секунд на выбор сервера
      connectTimeoutMS: 30000, // 30 секунд на подключение
    });
    
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error(`MongoDB connection error (attempt ${connectionAttempts}/${MAX_ATTEMPTS}):`, error);
    
    // Используем таймаут перед повторной попыткой если не превышен лимит
    if (connectionAttempts < MAX_ATTEMPTS) {
      console.log(`Retrying connection in 5 seconds...`);
      setTimeout(() => {
        isConnected = false; // Сбрасываем флаг для новой попытки
      }, 5000);
    }
  }
}

export default connectToDatabase; 