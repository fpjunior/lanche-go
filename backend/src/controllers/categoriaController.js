import * as categoriaService from '../services/categoriaService.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/categorias
export const getCategorias = async (req, res) => {
  const { ativo } = req.query;
  
  const categorias = await categoriaService.getAllCategorias(ativo);
  
  res.status(200).json({
    success: true,
    data: categorias,
    count: categorias.length
  });
};

// GET /api/categorias/:id
export const getCategoriaById = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const categoria = await categoriaService.getCategoriaById(parseInt(id));
  
  if (!categoria) {
    throw new AppError('Categoria não encontrada', 404, 'CATEGORIA_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    data: categoria
  });
};

// POST /api/categorias
export const createCategoria = async (req, res) => {
  const categoriaData = req.body;
  
  if (!categoriaData.nome) {
    throw new AppError('Nome da categoria é obrigatório', 400, 'MISSING_NAME');
  }
  
  const novaCategoria = await categoriaService.createCategoria(categoriaData);
  
  res.status(201).json({
    success: true,
    message: 'Categoria criada com sucesso',
    data: novaCategoria
  });
};

// PUT /api/categorias/:id
export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const updatedCategoria = await categoriaService.updateCategoria(parseInt(id), updateData);
  
  if (!updatedCategoria) {
    throw new AppError('Categoria não encontrada', 404, 'CATEGORIA_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Categoria atualizada com sucesso',
    data: updatedCategoria
  });
};

// DELETE /api/categorias/:id
export const deleteCategoria = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const deleted = await categoriaService.deleteCategoria(parseInt(id));
  
  if (!deleted) {
    throw new AppError('Categoria não encontrada', 404, 'CATEGORIA_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Categoria removida com sucesso'
  });
};