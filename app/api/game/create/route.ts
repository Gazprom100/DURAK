import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, getUserPrivateKey, getGamePoolWallet } from '@/app/api/auth/[...nextauth]/auth';
import { nanoid } from 'nanoid';
import { placeBet } from '@/utils/decimal';

// In a real application, you would use a database
const activeGames = new Map();

interface BetResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

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
    const { betAmount } = await req.json();
    const hasBet = betAmount && parseFloat(betAmount) > 0;
    
    // Validate bet amount if provided
    if (hasBet && (isNaN(parseFloat(betAmount)) || parseFloat(betAmount) <= 0)) {
      return NextResponse.json(
        { error: 'Invalid bet amount', success: false }, 
        { status: 400 }
      );
    }

    let betResult: BetResult = { success: false };
    
    // If it's a bet game, process the bet
    if (hasBet) {
      // Get user's private key and wallet info
      const privateKey = getUserPrivateKey(session.user.id);
      const gamePoolWallet = getGamePoolWallet();
      
      if (!privateKey || !session.user.walletAddress) {
        return NextResponse.json(
          { error: 'Wallet access error', success: false }, 
          { status: 400 }
        );
      }
      
      if (!gamePoolWallet.address) {
        return NextResponse.json(
          { error: 'Game pool not configured', success: false }, 
          { status: 500 }
        );
      }
      
      // Process the bet
      betResult = await placeBet(
        privateKey,
        session.user.walletAddress,
        gamePoolWallet.address,
        betAmount
      );
      
      if (!betResult.success) {
        return NextResponse.json(
          { error: betResult.error || 'Bet placement failed', success: false }, 
          { status: 400 }
        );
      }
    }

    // Create game ID
    const gameId = nanoid();
    
    // Store game data
    activeGames.set(gameId, {
      id: gameId,
      creatorId: session.user.id,
      creatorName: session.user.name,
      createdAt: new Date(),
      status: 'waiting',
      hasBet,
      betAmount: hasBet ? betAmount : '0',
      betTxHash: hasBet ? betResult.txHash : null,
    });

    return NextResponse.json({
      success: true,
      gameId,
      hasBet,
    });
  } catch (error: any) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred', success: false }, 
      { status: 500 }
    );
  }
}

// Helper function to get game by ID (would be replaced by a database query in a real app)
export const getGame = (gameId: string) => {
  return activeGames.get(gameId);
}; 