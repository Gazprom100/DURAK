import { Wallet, Decimal } from 'decimal-js-sdk';
import { ethers } from 'ethers';

// Initialize decimal wallet with the provided RPC URL
const rpcUrl = 'https://node.decimalchain.com/web3/';

// Platform fee percentage
const PLATFORM_FEE_PERCENT = 20;

// Generate a new wallet
export const createWallet = async (): Promise<{ address: string; privateKey: string }> => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
};

// Get wallet balance
export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    // Create a wallet instance
    const wallet = new Wallet();
    const decimal = new Decimal({
      wallet,
      baseURL: rpcUrl
    });
    
    const response = await decimal.getAddress(address);
    if (response && response.address && response.address.balance) {
      // Get DEL balance
      return response.address.balance.del || '0';
    }
    return '0';
  } catch (error: any) {
    console.error('Error getting wallet balance:', error);
    return '0';
  }
};

// Transfer tokens to game pool
export const placeBet = async (
  privateKey: string, 
  fromAddress: string, 
  gamePoolAddress: string, 
  amount: string
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(new ethers.providers.JsonRpcProvider(rpcUrl));
    
    // Create and sign transaction
    const tx = await signer.sendTransaction({
      to: gamePoolAddress,
      value: ethers.utils.parseEther(amount),
    });
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('Error placing bet:', error);
    return { success: false, error: error.message };
  }
};

// Transfer winnings to user's wallet after taking platform fee
export const withdrawWinnings = async (
  gamePoolPrivateKey: string,
  gamePoolAddress: string,
  winnerAddress: string,
  amount: string
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    const wallet = new ethers.Wallet(gamePoolPrivateKey);
    const signer = wallet.connect(new ethers.providers.JsonRpcProvider(rpcUrl));
    
    // Calculate platform fee
    const totalAmount = ethers.utils.parseEther(amount);
    const platformFee = totalAmount.mul(PLATFORM_FEE_PERCENT).div(100);
    const winnerAmount = totalAmount.sub(platformFee);
    
    // Send winnings to winner
    const tx = await signer.sendTransaction({
      to: winnerAddress,
      value: winnerAmount,
    });
    
    await tx.wait();
    
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('Error withdrawing winnings:', error);
    return { success: false, error: error.message };
  }
};

// Transfer tokens to external wallet
export const transferToExternalWallet = async (
  privateKey: string,
  fromAddress: string,
  toAddress: string,
  amount: string
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(new ethers.providers.JsonRpcProvider(rpcUrl));
    
    // Create and sign transaction
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(amount),
    });
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('Error transferring tokens:', error);
    return { success: false, error: error.message };
  }
}; 