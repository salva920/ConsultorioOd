import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { Inventory } = await import('@/lib/models');

    // Obtener items con stock bajo
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minStock'] }
    }).select('name quantity minStock category unit supplier');

    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error('Error getting low stock items:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
