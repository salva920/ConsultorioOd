import React, { useState, useEffect } from 'react';

interface InventoryItemFormProps {
  item?: any;
  onClose: () => void;
  onSubmit: (data: any, id?: string) => void;
}

const defaultForm = {
  name: '',
  type: 'material',
  currentStock: 0,
  minimumStock: 0,
  unit: 'unidades',
  description: '',
  expirationDate: '',
  supplier: '',
  cost: '',
  location: '',
  notes: ''
};

const typeOptions = [
  { value: 'material', label: 'Material' },
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'equipo', label: 'Equipo' },
  { value: 'consumible', label: 'Consumible' }
];

const unitOptions = [
  'unidades', 'cajas', 'ml', 'g', 'tabletas', 'ampollas', 'otros'
];

const InventoryForm: React.FC<InventoryItemFormProps> = ({ item, onClose, onSubmit }) => {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (item) {
      setForm({
        ...defaultForm,
        ...item,
        expirationDate: item.expirationDate ? item.expirationDate.slice(0, 10) : ''
      });
    } else {
      setForm(defaultForm);
    }
  }, [item]);

  const validate = () => {
    const newErrors: any = {};
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.type) newErrors.type = 'El tipo es obligatorio';
    if (String(form.currentStock) === '' || isNaN(Number(form.currentStock))) newErrors.currentStock = 'Stock actual requerido';
    if (String(form.minimumStock) === '' || isNaN(Number(form.minimumStock))) newErrors.minimumStock = 'Stock mínimo requerido';
    if (!form.unit) newErrors.unit = 'Unidad requerida';
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      const data = {
        ...form,
        currentStock: Number(form.currentStock),
        minimumStock: Number(form.minimumStock),
        cost: form.cost ? Number(form.cost) : undefined,
        expirationDate: form.expirationDate ? new Date(form.expirationDate) : undefined
      };
      onSubmit(data, item?._id);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={onClose}
        >
          ×
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {item ? 'Editar Insumo' : 'Nuevo Insumo'}
          </h2>
          <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Ej: Anestesia local"
              required
            />
            {errors.name && <div className="text-xs text-red-500 mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.name}
            </div>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={`input-field ${errors.type ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.type && <div className="text-xs text-red-500 mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.type}
              </div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unidad *</label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className={`input-field ${errors.unit ? 'border-red-500 focus:ring-red-500' : ''}`}
                required
              >
                {unitOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.unit && <div className="text-xs text-red-500 mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.unit}
              </div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock actual *</label>
              <input
                type="number"
                name="currentStock"
                value={form.currentStock}
                onChange={handleChange}
                min={0}
                className={`input-field ${errors.currentStock ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0"
                required
              />
              {errors.currentStock && <div className="text-xs text-red-500 mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.currentStock}
              </div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock mínimo *</label>
              <input
                type="number"
                name="minimumStock"
                value={form.minimumStock}
                onChange={handleChange}
                min={0}
                className={`input-field ${errors.minimumStock ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0"
                required
              />
              {errors.minimumStock && <div className="text-xs text-red-500 mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.minimumStock}
              </div>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Costo (opcional)</label>
              <input
                type="number"
                name="cost"
                value={form.cost}
                onChange={handleChange}
                min={0}
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de vencimiento</label>
              <input
                type="date"
                name="expirationDate"
                value={form.expirationDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Proveedor</label>
              <input
                type="text"
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                className="input-field"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ubicación</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej: Estante A, Caja 1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input-field resize-none"
              rows={3}
              placeholder="Descripción detallada del insumo..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input-field resize-none"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {item ? 'Guardar cambios' : 'Agregar insumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm; 