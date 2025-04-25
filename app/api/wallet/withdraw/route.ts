import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, getUserPrivateKey } from '@/app/api/auth/[...nextauth]/auth';
import { transferToExternalWallet } from '@/utils/decimal';

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
    const { amount, toAddress } = await req.json();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', success: false }, 
        { status: 400 }
      );
    }
    
    if (!toAddress || !toAddress.trim()) {
      return NextResponse.json(
        { error: 'Invalid destination address', success: false }, 
        { status: 400 }
      );
    }

    // Get user's private key
    const privateKey = getUserPrivateKey(session.user.id);
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Wallet access error', success: false }, 
        { status: 400 }
      );
    }

    // Process the withdrawal
    const withdrawalResult = await transferToExternalWallet(
      privateKey,
      session.user.walletAddress || '',
      toAddress,
      amount
    );
    
    if (!withdrawalResult.success) {
      return NextResponse.json(
        { error: withdrawalResult.error || 'Withdrawal failed', success: false }, 
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully withdrawn ${amount} DEL to ${toAddress}`,
      txHash: withdrawalResult.txHash,
    });
  } catch (error: any) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred', success: false }, 
      { status: 500 }
    );
  }
} 