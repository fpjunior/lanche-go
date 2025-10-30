import express from 'express';
import { catchAsync } from '../middleware/errorHandler.js';
import * as pedidoController from '../controllers/pedidoController.js';

const router = express.Router();

// GET /api/pedidos - Buscar todos os pedidos
router.get('/', catchAsync(pedidoController.getPedidos));

// GET /api/pedidos/:id - Buscar pedido específico
router.get('/:id', catchAsync(pedidoController.getPedidoById));

// POST /api/pedidos - Criar novo pedido
router.post('/', catchAsync(pedidoController.createPedido));

// PUT /api/pedidos/:id - Atualizar pedido
router.put('/:id', catchAsync(pedidoController.updatePedido));

// PATCH /api/pedidos/:id/status - Atualizar status do pedido
router.patch('/:id/status', catchAsync(pedidoController.updateStatusPedido));

// DELETE /api/pedidos/:id - Cancelar pedido
router.delete('/:id', catchAsync(pedidoController.cancelPedido));

// GET /api/pedidos/status/:status - Buscar pedidos por status
router.get('/status/:status', catchAsync(pedidoController.getPedidosByStatus));

export default router;