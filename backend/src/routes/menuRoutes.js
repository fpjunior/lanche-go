import express from 'express';
import { catchAsync } from '../middleware/errorHandler.js';
import * as menuController from '../controllers/menuController.js';

const router = express.Router();

// GET /api/menu - Buscar todos os itens do menu
router.get('/', catchAsync(menuController.getMenuItems));

// GET /api/menu/categoria/:categoria - Buscar itens por categoria
router.get('/categoria/:categoria', catchAsync(menuController.getMenuItemsByCategory));

// GET /api/menu/search - Buscar itens (query: ?q=termo)
router.get('/search', catchAsync(menuController.searchMenuItems));

// GET /api/menu/:id - Buscar item específico
router.get('/:id', catchAsync(menuController.getMenuItemById));

// POST /api/menu - Criar novo item (para admin futuramente)
router.post('/', catchAsync(menuController.createMenuItem));

// PUT /api/menu/:id - Atualizar item (para admin futuramente)
router.put('/:id', catchAsync(menuController.updateMenuItem));

// DELETE /api/menu/:id - Deletar item (para admin futuramente)
router.delete('/:id', catchAsync(menuController.deleteMenuItem));

// PATCH /api/menu/:id/disponibilidade - Alterar disponibilidade
router.patch('/:id/disponibilidade', catchAsync(menuController.toggleDisponibilidade));

// PUT /api/menu/:id/imagem - Atualizar imagem do item
router.put('/:id/imagem', catchAsync(menuController.updateMenuItemImage));

// DELETE /api/menu/:id/imagem - Remover imagem do item
router.delete('/:id/imagem', catchAsync(menuController.removeMenuItemImage));

export default router;