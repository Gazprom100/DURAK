import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Расширяем тип Session чтобы включить пользовательские поля
   */
  interface Session {
    user: {
      id?: string;
      bonusPoints?: number;
      wins?: number;
      losses?: number;
      gamesPlayed?: number;
      walletAddress?: string;
      walletBalance?: string;
      walletCreated?: boolean;
    } & DefaultSession["user"];
  }
} 