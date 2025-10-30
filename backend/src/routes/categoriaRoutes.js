import express from 'express';
import { catchAsync } from '../middleware/errorHandler.js';
import * as categoriaController from '../controllers/categoriaController.js';

const router = express.Router();

// GET /api/categorias - Buscar todas as categorias
router.get('/', catchAsync(categoriaController.getCategorias));

// GET /api/categorias/:id - Buscar categoria específica
router.get('/:id', catchAsync(categoriaController.getCategoriaById));

// POST /api/categorias - Criar nova categoria
router.post('/', catchAsync(categoriaController.createCategoria));

// PUT /api/categorias/:id - Atualizar categoria
router.put('/:id', catchAsync(categoriaController.updateCategoria));

// DELETE /api/categorias/:id - Deletar categoria
router.delete('/:id', catchAsync(categoriaController.deleteCategoria));

export default router;