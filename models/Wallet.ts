import mongoose, { Schema, Document } from 'mongoose';

// Интерфейс для типизации документа кошелька
export interface IWallet extends Document {
  address: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Схема кошелька для MongoDB
const WalletSchema = new Schema<IWallet>(
  {
    address: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    balance: { type: Number, default: 1000 }, // Начальный баланс для новых кошельков
  },
  { timestamps: true }
);

// Создаем индекс для быстрого поиска кошелька по userId
WalletSchema.index({ userId: 1 });

// Проверяем, не была ли модель уже скомпилирована
export default mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', WalletSchema); 