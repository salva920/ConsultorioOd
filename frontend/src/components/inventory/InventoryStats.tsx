import React from 'react';

interface InventoryStatsProps {
  stats: {
    totalItems: number;
    lowStockCount: number;
    expiringCount: number;
    totalValue: number;
  };
}

const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total de Insumos',
      value: stats.totalItems,
      icon: '📦',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStockCount,
      icon: '⚠️',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Próximos a Vencer',
      value: stats.expiringCount,
      icon: '⏰',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Valor Total',
      value: formatCurrency(stats.totalValue),
      icon: '💰',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 hover-lift shadow-soft`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${stat.textColor} mb-2`}>
                {stat.value}
              </p>
            </div>
            <div className={`${stat.color} p-4 rounded-full shadow-md`}>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
          
          {/* Indicador visual para stock bajo y próximos a vencer */}
          {(stat.title === 'Stock Bajo' || stat.title === 'Próximos a Vencer') && (
            <div className="mt-4">
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-3 mr-3 shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      stat.title === 'Stock Bajo' ? 'gradient-danger' : 'gradient-warning'
                    }`}
                    style={{ 
                      width: `${Math.min((stats.totalItems > 0 ? Number(stat.value) / stats.totalItems : 0) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <span className={`text-sm font-bold ${stat.textColor}`}>
                  {stats.totalItems > 0 ? Math.round((Number(stat.value) / stats.totalItems) * 100) : 0}%
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InventoryStats; 