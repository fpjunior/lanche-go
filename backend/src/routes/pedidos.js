import express from 'express';
import pedidosController from '../controllers/pedidosController.js';

const router = express.Router();

// Criar novo pedido
router.post('/', pedidosController.criarPedido);

// Buscar todos os pedidos com filtros opcionais
router.get('/', pedidosController.buscarPedidos);

// Buscar pedido por ID
router.get('/:id', pedidosController.buscarPedidoPorId);

// Atualizar status do pedido
router.patch('/:id/status', pedidosController.atualizarStatusPedido);

// Deletar pedido
router.delete('/:id', pedidosController.deletarPedido);

export default router;