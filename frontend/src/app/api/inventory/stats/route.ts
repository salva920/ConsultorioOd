import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/config/database';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { Inventory } = await import('@/lib/models');

    // Obtener estadísticas del inventario
    const totalItems = await Inventory.countDocuments();
    const lowStockItems = await Inventory.countDocuments({
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    });
    
    // Calcular valor total del inventario
    const items = await Inventory.find({}, 'currentStock cost');
    const totalValue = items.reduce((sum, item) => {
      return sum + ((item.cost || 0) * (item.currentStock || 0));
    }, 0);

    // Obtener artículos por tipo
    const itemsByType = await Inventory.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Contar artículos próximos a vencer (si tienen fecha de vencimiento)
    const expiringItems = await Inventory.countDocuments({
      expirationDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      }
    });

    return NextResponse.json({
      totalItems,
      lowStockItems,
      totalValue,
      itemsByType,
      expiringCount: expiringItems
    });
  } catch (error) {
    console.error('Error getting inventory stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
