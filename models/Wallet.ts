import mongoose from 'mongoose';

// Интерфейс для типизации документа кошелька
export interface IWallet {
  address: string;
  privateKey: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Схема кошелька для MongoDB
const WalletSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, unique: true },
    privateKey: { type: String, required: true },
    userId: { type: String, required: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Создаем индекс для быстрого поиска по userId
WalletSchema.index({ userId: 1 });

// Проверяем, не была ли модель уже скомпилирована
const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema);

export default Wallet; 