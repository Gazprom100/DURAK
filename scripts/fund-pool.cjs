require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

/**
 * Скрипт для пополнения кошелька пула через тестовый фаусет
 * Примечание: В реальном окружении кошелек пула должен быть
 * пополнен реальными средствами.
 */
async function fundPoolWallet() {
  console.log('\n💸 Запрашиваем тестовые DEL для кошелька пула...\n');
  
  // Проверяем наличие настроенного кошелька
  const poolAddress = process.env.GAME_POOL_ADDRESS;
  
  if (!poolAddress) {
    console.log('❌ Кошелек пула игры не настроен!');
    console.log('   Запустите setup.sh для автоматической настройки кошелька.');
    return;
  }
  
  console.log(`📋 Адрес кошелька пула: ${poolAddress}`);
  
  try {
    // Проверяем текущий баланс
    const provider = new ethers.providers.JsonRpcProvider(process.env.DECIMAL_CHAIN_RPC_URL || 'https://node.decimalchain.com/web3/');
    const initialBalance = await provider.getBalance(poolAddress);
    const initialEtherBalance = ethers.utils.formatEther(initialBalance);
    
    console.log(`💰 Текущий баланс: ${initialEtherBalance} DEL`);
    
    // Запрос к тестовому фаусету
    // Примечание: в реальной реализации этот URL должен быть заменен на адрес фаусета сети DecimalChain
    console.log(`📡 Отправляем запрос к тестовому фаусету...`);
    
    // Имитация запроса к фаусету
    // В реальной реализации здесь был бы настоящий запрос к API фаусета
    console.log(`🔄 Обработка запроса...`);
    
    // Вывод инструкций для ручного пополнения в случае, если автоматическое не работает
    console.log('\n⚠️ Примечание: Автоматическое пополнение через фаусет в тестовой версии недоступно.');
    console.log('\n✅ Инструкция по ручному пополнению кошелька пула:');
    console.log('   1. Перейдите на официальный сайт DecimalChain');
    console.log('   2. Найдите и используйте тестовый фаусет (для тестовой сети)');
    console.log(`   3. Укажите адрес кошелька пула: ${poolAddress}`);
    console.log('   4. Следуйте инструкциям на сайте для получения тестовых токенов');
    console.log('\n📝 После пополнения баланса, выполните команду:');
    console.log('   node scripts/check-wallet.js');
    console.log('   для проверки баланса кошелька.');
    
  } catch (error) {
    console.log(`❌ Ошибка: ${error.message}`);
  }
}

fundPoolWallet(); 