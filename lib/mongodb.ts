import mongoose from 'mongoose';

// Переменная для отслеживания соединения
let isConnected = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 5;

// Функция для кодирования специальных символов в пароле
function encodeMongoPassword(password: string): string {
  // Убираем < и > символы, если они присутствуют
  let cleanPassword = password.replace(/[<>]/g, '');
  
  // Кодируем специальные символы для URL
  return encodeURIComponent(cleanPassword);
}

// Функция для подключения к MongoDB
async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  if (connectionAttempts >= MAX_ATTEMPTS) {
    console.warn(`Exceeded maximum MongoDB connection attempts (${MAX_ATTEMPTS}). Using fallback mode.`);
    // В режиме fallback приложение продолжит работу без базы данных
    isConnected = true;
    return;
  }

  connectionAttempts++;

  try {
    // Детальное логирование переменных окружения (без пароля)
    console.log('MongoDB connection attempt with environment variables:');
    console.log(`- MONGODB_URI defined: ${Boolean(process.env.MONGODB_URI)}`);
    console.log(`- MONGODB_USERNAME: ${process.env.MONGODB_USERNAME || 'not defined'}`);
    console.log(`- MONGODB_CLUSTER: ${process.env.MONGODB_CLUSTER || 'not defined'}`);
    console.log(`- MONGODB_DATABASE: ${process.env.MONGODB_DATABASE || 'not defined'}`);
    console.log(`- PASSWORD defined: ${Boolean(process.env.MONGODB_PASSWORD)}`);
    
    // Использовать готовый URI или собрать из компонентов
    let MONGODB_URI = process.env.MONGODB_URI;
    
    // Если URI не задан, собираем его из компонентов
    if (!MONGODB_URI) {
      const username = process.env.MONGODB_USERNAME || 'krasnovinvest';
      const password = process.env.MONGODB_PASSWORD || '';
      const cluster = process.env.MONGODB_CLUSTER || 'durak.wphttqm.mongodb.net';
      const database = process.env.MONGODB_DATABASE || 'durak';
      
      if (!password) {
        console.error('MongoDB password is not defined. Please check your environment variables.');
        throw new Error('MongoDB password is not defined. Please check your environment variables.');
      }
      
      // Кодируем пароль для корректного URI
      const encodedPassword = encodeMongoPassword(password);
      
      MONGODB_URI = `mongodb+srv://${username}:${encodedPassword}@${cluster}/${database}?retryWrites=true&w=majority`;
      console.log(`Generated MongoDB URI from components (without showing password)`);
    } else {
      // Если URI задан напрямую, проверяем, нужно ли обработать пароль
      if (MONGODB_URI.includes('<') || MONGODB_URI.includes('>')) {
        console.log('URI contains special characters that need encoding, processing...');
        // Извлекаем и кодируем пароль
        const uriParts = MONGODB_URI.split('@');
        if (uriParts.length > 1) {
          const credentialsPart = uriParts[0].split('://')[1];
          const [username, rawPassword] = credentialsPart.split(':');
          const encodedPassword = encodeMongoPassword(rawPassword);
          
          // Пересобираем URI с закодированным паролем
          MONGODB_URI = `${uriParts[0].split(':')[0]}://${username}:${encodedPassword}@${uriParts[1]}`;
          console.log('Processed MongoDB URI with encoded special characters');
        }
      } else {
        console.log('Using predefined MONGODB_URI from environment variables');
      }
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
    } else {
      // В последней попытке включаем fallback режим
      console.warn('All MongoDB connection attempts failed. Starting in fallback mode without database.');
      isConnected = true; // Устанавливаем флаг подключения чтобы не повторять попытки
    }
  }
}

export default connectToDatabase; 