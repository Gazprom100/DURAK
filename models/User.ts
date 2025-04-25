import mongoose, { Schema, Document } from 'mongoose';

// Интерфейс для типизации документа пользователя
export interface IUser extends Document {
  id: string;
  name: string;
  email?: string;
  image?: string;
  walletAddress?: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

// Схема пользователя для MongoDB
const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, sparse: true },
    image: { type: String },
    walletAddress: { type: String, sparse: true },
    balance: { type: Number, default: 1000 }, // Начальный баланс для новых пользователей
  },
  { timestamps: true }
);

// Проверяем, не была ли модель уже скомпилирована
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 