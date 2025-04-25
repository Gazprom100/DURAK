import mongoose, { Schema, Document } from 'mongoose';

// Интерфейс для бонусной транзакции
export interface ITransaction extends Document {
  userId: string;
  amount: number;
  type: 'reward' | 'deposit' | 'withdrawal' | 'game_win' | 'game_loss';
  txHash?: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Интерфейс для бонусного баланса пользователя
export interface IUserBonus extends Document {
  userId: string;
  walletAddress?: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Schema.Types.ObjectId[] | ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

// Схема для бонусной транзакции
const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['reward', 'deposit', 'withdrawal', 'game_win', 'game_loss'] 
    },
    txHash: { type: String },
    status: { 
      type: String, 
      required: true, 
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    description: { type: String, required: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Схема для бонусного баланса пользователя
const UserBonusSchema = new Schema<IUserBonus>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    walletAddress: { type: String, sparse: true },
    balance: { type: Number, required: true, default: 0 },
    totalEarned: { type: Number, required: true, default: 0 },
    totalSpent: { type: Number, required: true, default: 0 },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Создаем модели, если они еще не существуют
export const Transaction = mongoose.models.Transaction || 
  mongoose.model<ITransaction>('Transaction', TransactionSchema);

export const UserBonus = mongoose.models.UserBonus || 
  mongoose.model<IUserBonus>('UserBonus', UserBonusSchema); 