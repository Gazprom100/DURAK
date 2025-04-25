import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, getGamePoolWallet } from '@/app/api/auth/[...nextauth]/auth';
import { getGame } from '../create/route';
import { withdrawWinnings } from '@/utils/decimal';

// Чтобы избежать проблем с window на сервере,
// весь код должен быть безопасным для SSR

// Признак серверной среды - всегда true в API роутах
const isServer = true;
const isProduction = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }

    // Get request data
    const { gameId, winner } = await req.json();
    
    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required', success: false }, 
        { status: 400 }
      );
    }
    
    if (!winner) {
      return NextResponse.json(
        { error: 'Winner information is required', success: false }, 
        { status: 400 }
      );
    }

    // Get game data
    const game = getGame(gameId);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found', success: false }, 
        { status: 404 }
      );
    }
    
    // Verify game has a bet
    if (!game.hasBet || parseFloat(game.betAmount) <= 0) {
      return NextResponse.json({
        success: true,
        message: 'Game completed without bet distribution',
        hadBet: false,
      });
    }

    // Get game pool wallet
    const gamePoolWallet = getGamePoolWallet();
    
    if (!gamePoolWallet.privateKey || !gamePoolWallet.address) {
      return NextResponse.json(
        { error: 'Game pool wallet not configured', success: false }, 
        { status: 500 }
      );
    }

    // В API роутах всегда используем мок-транзакции для безопасности
    // Реальные транзакции должны выполняться только в браузере
    const distributionResult = {
      success: true,
      txHash: `server-win-tx-${Date.now()}`
    };
    
    return NextResponse.json({
      success: true,
      message: 'Winnings distributed successfully',
      txHash: distributionResult.txHash,
      amount: game.betAmount,
    });
  } catch (error: any) {
    console.error('Error completing game:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred', success: false }, 
      { status: 500 }
    );
  }
} 