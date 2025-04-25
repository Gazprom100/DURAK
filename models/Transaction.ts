import mongoose, { Schema, Document } from 'mongoose';

// Перечисление типов транзакций
export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
  GAME_WIN = 'game_win',
  GAME_LOSS = 'game_loss'
}

// Интерфейс для типизации документа транзакции
export interface ITransaction extends Document {
  fromAddress: string;
  toAddress: string;
  amount: number;
  type: TransactionType;
  status: 'pending' | 'completed' | 'failed';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Схема транзакции для MongoDB
const TransactionSchema = new Schema<ITransaction>(
  {
    fromAddress: { type: String, required: true, index: true },
    toAddress: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    type: { 
      type: String, 
      enum: Object.values(TransactionType),
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Создаем индексы для быстрого поиска транзакций
TransactionSchema.index({ fromAddress: 1, createdAt: -1 });
TransactionSchema.index({ toAddress: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, createdAt: -1 });

// Проверяем, не была ли модель уже скомпилирована
export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema); 