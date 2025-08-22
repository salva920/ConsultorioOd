import React from 'react';

interface LowStockAlertProps {
  count: number;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-6 shadow-soft animate-pulse-slow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="bg-red-500 p-3 rounded-full shadow-md">
            <span className="text-3xl">⚠️</span>
          </div>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-bold text-red-800 mb-1">
            Alerta de Stock Bajo
          </h3>
          <div className="text-sm text-red-700">
            <p>
              Tienes <strong className="text-red-900">{count}</strong> insumo{count !== 1 ? 's' : ''} con stock bajo que requieren atención inmediata.
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => {
              // Aquí podrías agregar lógica para filtrar solo los items con stock bajo
              const lowStockFilter = document.querySelector('[data-filter="low-stock"]') as HTMLButtonElement;
              if (lowStockFilter) {
                lowStockFilter.click();
              }
            }}
            className="btn-danger text-sm px-4 py-2"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert; 