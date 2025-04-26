require('dotenv').config();
const { ethers } = require('ethers');

async function checkWallet() {
  console.log('\n🔍 Проверка кошелька пула игры...\n');
  
  // Проверяем наличие настроенного кошелька
  const poolAddress = process.env.GAME_POOL_ADDRESS;
  const poolPrivateKey = process.env.GAME_POOL_PRIVATE_KEY;
  
  if (!poolAddress || !poolPrivateKey) {
    console.log('❌ Кошелек пула игры не настроен!');
    console.log('   Запустите setup.sh для автоматической настройки кошелька.');
    return;
  }
  
  console.log(`✅ Кошелек пула игры настроен`);
  console.log(`📋 Адрес: ${poolAddress}`);
  
  // Проверяем баланс кошелька
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.DECIMAL_CHAIN_RPC_URL || 'https://node.decimalchain.com/web3/');
    const balance = await provider.getBalance(poolAddress);
    const etherBalance = ethers.utils.formatEther(balance);
    
    console.log(`💰 Баланс: ${etherBalance} DEL`);
    
    if (Number(etherBalance) === 0) {
      console.log('\n⚠️ Внимание: Баланс кошелька пула равен 0!');
      console.log('   Для полноценной работы с ставками необходимо пополнить кошелек пула.');
    }
  } catch (error) {
    console.log(`❌ Не удалось получить баланс кошелька: ${error.message}`);
  }
  
  console.log('\n🔐 Приватный ключ: (скрыт для безопасности)');
  console.log(`   ${poolPrivateKey.substring(0, 6)}...${poolPrivateKey.substring(poolPrivateKey.length - 4)}`);
  
  console.log('\n📝 Для восстановления полной информации о кошельке используйте файл wallet-info.txt');
}

checkWallet(); 