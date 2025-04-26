const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Проверка, запущен ли скрипт на сервере
const isServer = typeof window === 'undefined';

// Проверка и установка необходимых зависимостей
function checkAndInstallDependencies() {
  console.log('🔍 Проверка необходимых зависимостей...');
  
  let needsInstall = false;
  
  // Проверяем необходимые зависимости
  const requiredDeps = ['ethers', 'dotenv', 'decimal-js-sdk'];
  
  try {
    for (const dep of requiredDeps) {
      try {
        require.resolve(dep);
      } catch (e) {
        console.log(`📦 Установка зависимости: ${dep}...`);
        needsInstall = true;
        break;
      }
    }
    
    if (needsInstall) {
      console.log('📦 Установка необходимых зависимостей...');
      execSync('npm install --save ethers@5.7.2 decimal-js-sdk dotenv', { stdio: 'inherit' });
      console.log('✅ Зависимости успешно установлены');
    } else {
      console.log('✅ Все необходимые зависимости уже установлены');
    }
  } catch (error) {
    console.error('❌ Ошибка при установке зависимостей:', error.message);
    process.exit(1);
  }
}

// Проверяем зависимости перед запуском основного кода
checkAndInstallDependencies();

// Подключаем необходимые библиотеки
require('dotenv').config();

// Безопасный импорт библиотек, которые могут использовать браузерные API
let ethers;
try {
  ethers = require('ethers');
} catch (error) {
  console.error('❌ Ошибка при импорте ethers:', error.message);
  process.exit(1);
}

// Создаем папку scripts, если она не существует
if (!fs.existsSync(path.join(__dirname))) {
  fs.mkdirSync(path.join(__dirname), { recursive: true });
}

// Путь к .env файлу
const envPath = path.join(__dirname, '../.env.local');

/**
 * Создает кошелек для пула игры
 */
function createGamePoolWallet() {
  console.log('🔑 Создаем кошелек пула игры...');
  try {
    const wallet = ethers.Wallet.createRandom();
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase
    };
  } catch (error) {
    console.error('❌ Ошибка при создании кошелька:', error.message);
    return null;
  }
}

/**
 * Обновляет .env.local файл с данными кошелька
 */
function updateEnvFile(wallet) {
  if (!wallet) {
    console.error('❌ Невозможно обновить файл конфигурации: кошелек не создан');
    return;
  }
  
  console.log('📝 Обновляем конфигурационные файлы...');
  
  // Проверяем существует ли .env.local, если нет - создаем его из .env.example
  if (!fs.existsSync(envPath)) {
    const exampleEnvPath = path.join(__dirname, '../.env.example');
    if (fs.existsSync(exampleEnvPath)) {
      fs.copyFileSync(exampleEnvPath, envPath);
    } else {
      // Если и .env.example не существует, создаем пустой .env.local
      fs.writeFileSync(envPath, '');
    }
  }
  
  // Читаем текущее содержимое .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Добавляем или обновляем переменные кошелька
  const envVars = {
    DECIMAL_CHAIN_RPC_URL: 'https://node.decimalchain.com/web3/',
    GAME_POOL_ADDRESS: wallet.address,
    GAME_POOL_PRIVATE_KEY: wallet.privateKey
  };
  
  // Обновляем каждую переменную в файле
  Object.entries(envVars).forEach(([key, value]) => {
    // Проверяем существует ли переменная в файле
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      // Обновляем существующую переменную
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Добавляем новую переменную
      envContent += `\n${key}=${value}`;
    }
  });
  
  // Записываем обновленное содержимое в файл
  fs.writeFileSync(envPath, envContent);
  
  // Создаем файл с мнемонической фразой для восстановления кошелька
  const walletInfoPath = path.join(__dirname, '../wallet-info.txt');
  const walletInfo = `
======= ИНФОРМАЦИЯ О КОШЕЛЬКЕ ПУЛА ИГРЫ =======
ВАЖНО: Храните эту информацию в безопасном месте!

Адрес кошелька: ${wallet.address}
Приватный ключ: ${wallet.privateKey}
Мнемоническая фраза: ${wallet.mnemonic}

============================================
`;
  fs.writeFileSync(walletInfoPath, walletInfo);
  console.log(`✅ Информация о кошельке сохранена в файле: wallet-info.txt`);
}

/**
 * Основная функция инициализации кошельков
 */
function initWallets() {
  console.log('🚀 Инициализация кошельков DecimalChain...');
  
  // Проверяем, есть ли уже настроенный кошелек пула игры
  let existingPoolWallet = process.env.GAME_POOL_ADDRESS && process.env.GAME_POOL_PRIVATE_KEY;
  
  if (existingPoolWallet) {
    console.log('ℹ️ Кошелек пула игры уже настроен. Пропускаем создание...');
    return;
  }
  
  // Создаем новый кошелек пула игры
  const gamePoolWallet = createGamePoolWallet();
  
  // Обновляем .env файл
  updateEnvFile(gamePoolWallet);
  
  if (gamePoolWallet) {
    console.log(`
🎮 Кошелек пула игры успешно создан!
📋 Адрес: ${gamePoolWallet.address}
  
⚠️ ВАЖНО: Мы сохранили приватный ключ и мнемоническую фразу в файле wallet-info.txt
⚠️ Для безопасности рекомендуем сохранить эту информацию в другом месте и удалить файл
    `);
  }
}

// Запускаем инициализацию кошельков только если скрипт запущен напрямую
if (require.main === module) {
  initWallets();
}

// Экспортируем функции для использования в других модулях
module.exports = {
  initWallets,
  createGamePoolWallet,
  updateEnvFile
}; 