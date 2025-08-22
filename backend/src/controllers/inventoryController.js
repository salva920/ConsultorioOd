const InventoryItem = require('../models/InventoryItem');

// Obtener todos los insumos
const getAllInventoryItems = async (req, res) => {
  try {
    const { search, type, lowStock } = req.query;
    
    let query = { isActive: true };
    
    // Filtro por búsqueda
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filtro por tipo
    if (type) {
      query.type = type;
    }
    
    // Filtro por stock bajo
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$currentStock', '$minimumStock'] };
    }
    
    const items = await InventoryItem.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Agregar propiedades virtuales
    const itemsWithVirtuals = items.map(item => ({
      ...item,
      isLowStock: item.currentStock <= item.minimumStock,
      daysUntilExpiration: item.expirationDate ? 
        Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      isExpiringSoon: item.expirationDate ? 
        (Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 && 
         Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) >= 0) : false
    }));
    
    res.json(itemsWithVirtuals);
  } catch (error) {
    console.error('Error al obtener insumos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener un insumo por ID
const getInventoryItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Insumo no encontrado' });
    }
    
    // Agregar propiedades virtuales
    const itemWithVirtuals = {
      ...item.toObject(),
      isLowStock: item.currentStock <= item.minimumStock,
      daysUntilExpiration: item.expirationDate ? 
        Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      isExpiringSoon: item.expirationDate ? 
        (Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 && 
         Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) >= 0) : false
    };
    
    res.json(itemWithVirtuals);
  } catch (error) {
    console.error('Error al obtener insumo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nuevo insumo
const createInventoryItem = async (req, res) => {
  try {
    const newItem = new InventoryItem(req.body);
    const savedItem = await newItem.save();
    
    // Agregar propiedades virtuales
    const itemWithVirtuals = {
      ...savedItem.toObject(),
      isLowStock: savedItem.currentStock <= savedItem.minimumStock,
      daysUntilExpiration: savedItem.expirationDate ? 
        Math.ceil((new Date(savedItem.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      isExpiringSoon: savedItem.expirationDate ? 
        (Math.ceil((new Date(savedItem.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 && 
         Math.ceil((new Date(savedItem.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) >= 0) : false
    };
    
    res.status(201).json(itemWithVirtuals);
  } catch (error) {
    console.error('Error al crear insumo:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar insumo
const updateInventoryItem = async (req, res) => {
  try {
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Insumo no encontrado' });
    }
    
    // Agregar propiedades virtuales
    const itemWithVirtuals = {
      ...updatedItem.toObject(),
      isLowStock: updatedItem.currentStock <= updatedItem.minimumStock,
      daysUntilExpiration: updatedItem.expirationDate ? 
        Math.ceil((new Date(updatedItem.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      isExpiringSoon: updatedItem.expirationDate ? 
        (Math.ceil((new Date(updatedItem.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 && 
         Math.ceil((new Date(updatedItem.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) >= 0) : false
    };
    
    res.json(itemWithVirtuals);
  } catch (error) {
    console.error('Error al actualizar insumo:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar insumo (soft delete)
const deleteInventoryItem = async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Insumo no encontrado' });
    }
    
    res.json({ message: 'Insumo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar insumo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener insumos con stock bajo
const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await InventoryItem.find({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    }).sort({ currentStock: 1 }).lean();
    
    // Agregar propiedades virtuales
    const itemsWithVirtuals = lowStockItems.map(item => ({
      ...item,
      isLowStock: true,
      daysUntilExpiration: item.expirationDate ? 
        Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) : null,
      isExpiringSoon: item.expirationDate ? 
        (Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 && 
         Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)) >= 0) : false
    }));
    
    res.json(itemsWithVirtuals);
  } catch (error) {
    console.error('Error al obtener insumos con stock bajo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener insumos próximos a vencer
const getExpiringItems = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringItems = await InventoryItem.find({
      isActive: true,
      expirationDate: { 
        $exists: true, 
        $ne: null,
        $lte: thirtyDaysFromNow,
        $gte: new Date()
      }
    }).sort({ expirationDate: 1 }).lean();
    
    // Agregar propiedades virtuales
    const itemsWithVirtuals = expiringItems.map(item => ({
      ...item,
      isLowStock: item.currentStock <= item.minimumStock,
      daysUntilExpiration: Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)),
      isExpiringSoon: true
    }));
    
    res.json(itemsWithVirtuals);
  } catch (error) {
    console.error('Error al obtener insumos próximos a vencer:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener estadísticas del inventario
const getInventoryStats = async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments({ isActive: true });
    const lowStockCount = await InventoryItem.countDocuments({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    });
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringCount = await InventoryItem.countDocuments({
      isActive: true,
      expirationDate: { 
        $exists: true, 
        $ne: null,
        $lte: thirtyDaysFromNow,
        $gte: new Date()
      }
    });
    
    const totalValue = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$cost'] } } } }
    ]);
    
    res.json({
      totalItems,
      lowStockCount,
      expiringCount,
      totalValue: totalValue[0]?.total || 0
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getExpiringItems,
  getInventoryStats
}; 