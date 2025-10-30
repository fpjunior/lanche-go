import * as menuService from '../services/menuService.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/menu
export const getMenuItems = async (req, res) => {
  const { disponivel } = req.query;
  
  const items = await menuService.getAllMenuItems(disponivel);
  
  res.status(200).json({
    success: true,
    data: items,
    count: items.length
  });
};

// GET /api/menu/categoria/:categoria
export const getMenuItemsByCategory = async (req, res) => {
  const { categoria } = req.params;
  const { disponivel } = req.query;
  
  const items = await menuService.getMenuItemsByCategory(categoria, disponivel);
  
  res.status(200).json({
    success: true,
    data: items,
    count: items.length,
    categoria
  });
};

// GET /api/menu/search?q=termo
export const searchMenuItems = async (req, res) => {
  const { q: searchTerm } = req.query;
  
  if (!searchTerm || searchTerm.trim().length < 2) {
    throw new AppError('Termo de busca deve ter pelo menos 2 caracteres', 400, 'INVALID_SEARCH_TERM');
  }
  
  const items = await menuService.searchMenuItems(searchTerm.trim());
  
  res.status(200).json({
    success: true,
    data: items,
    count: items.length,
    searchTerm
  });
};

// GET /api/menu/:id
export const getMenuItemById = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const item = await menuService.getMenuItemById(parseInt(id));
  
  if (!item) {
    throw new AppError('Item não encontrado', 404, 'ITEM_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    data: item
  });
};

// POST /api/menu
export const createMenuItem = async (req, res) => {
  const itemData = req.body;
  
  const newItem = await menuService.createMenuItem(itemData);
  
  res.status(201).json({
    success: true,
    message: 'Item criado com sucesso',
    data: newItem
  });
};

// PUT /api/menu/:id
export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const updatedItem = await menuService.updateMenuItem(parseInt(id), updateData);
  
  if (!updatedItem) {
    throw new AppError('Item não encontrado', 404, 'ITEM_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Item atualizado com sucesso',
    data: updatedItem
  });
};

// DELETE /api/menu/:id
export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const deleted = await menuService.deleteMenuItem(parseInt(id));
  
  if (!deleted) {
    throw new AppError('Item não encontrado', 404, 'ITEM_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Item removido com sucesso'
  });
};

// PATCH /api/menu/:id/disponibilidade
export const toggleDisponibilidade = async (req, res) => {
  const { id } = req.params;
  const { disponivel } = req.body;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  if (typeof disponivel !== 'boolean') {
    throw new AppError('Campo disponivel deve ser boolean', 400, 'INVALID_AVAILABILITY');
  }
  
  const updatedItem = await menuService.updateDisponibilidade(parseInt(id), disponivel);
  
  if (!updatedItem) {
    throw new AppError('Item não encontrado', 404, 'ITEM_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: `Item ${disponivel ? 'disponibilizado' : 'indisponibilizado'} com sucesso`,
    data: updatedItem
  });
};