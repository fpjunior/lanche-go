import * as pedidoService from '../services/pedidoService.js';
import { AppError } from '../middleware/errorHandler.js';

// GET /api/pedidos
export const getPedidos = async (req, res) => {
  const { status, limite = 50, pagina = 1 } = req.query;
  
  const pedidos = await pedidoService.getAllPedidos({
    status,
    limite: parseInt(limite),
    offset: (parseInt(pagina) - 1) * parseInt(limite)
  });
  
  res.status(200).json({
    success: true,
    data: pedidos,
    count: pedidos.length,
    pagina: parseInt(pagina),
    limite: parseInt(limite)
  });
};

// GET /api/pedidos/:id
export const getPedidoById = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const pedido = await pedidoService.getPedidoById(parseInt(id));
  
  if (!pedido) {
    throw new AppError('Pedido não encontrado', 404, 'PEDIDO_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    data: pedido
  });
};

// POST /api/pedidos
export const createPedido = async (req, res) => {
  const pedidoData = req.body;
  
  // Validações básicas
  if (!pedidoData.itens || !Array.isArray(pedidoData.itens) || pedidoData.itens.length === 0) {
    throw new AppError('Pedido deve ter pelo menos um item', 400, 'INVALID_ITEMS');
  }
  
  if (!pedidoData.total || pedidoData.total <= 0) {
    throw new AppError('Total do pedido inválido', 400, 'INVALID_TOTAL');
  }
  
  const novoPedido = await pedidoService.createPedido(pedidoData);
  
  res.status(201).json({
    success: true,
    message: 'Pedido criado com sucesso',
    data: novoPedido
  });
};

// PUT /api/pedidos/:id
export const updatePedido = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const updatedPedido = await pedidoService.updatePedido(parseInt(id), updateData);
  
  if (!updatedPedido) {
    throw new AppError('Pedido não encontrado', 404, 'PEDIDO_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Pedido atualizado com sucesso',
    data: updatedPedido
  });
};

// PATCH /api/pedidos/:id/status
export const updateStatusPedido = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  if (!status) {
    throw new AppError('Status é obrigatório', 400, 'MISSING_STATUS');
  }
  
  const validStatuses = ['novo', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Status inválido', 400, 'INVALID_STATUS');
  }
  
  const updatedPedido = await pedidoService.updateStatusPedido(parseInt(id), status);
  
  if (!updatedPedido) {
    throw new AppError('Pedido não encontrado', 404, 'PEDIDO_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: `Status do pedido alterado para ${status}`,
    data: updatedPedido
  });
};

// DELETE /api/pedidos/:id
export const cancelPedido = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    throw new AppError('ID inválido', 400, 'INVALID_ID');
  }
  
  const canceledPedido = await pedidoService.cancelPedido(parseInt(id));
  
  if (!canceledPedido) {
    throw new AppError('Pedido não encontrado', 404, 'PEDIDO_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Pedido cancelado com sucesso',
    data: canceledPedido
  });
};

// GET /api/pedidos/status/:status
export const getPedidosByStatus = async (req, res) => {
  const { status } = req.params;
  const { limite = 50, pagina = 1 } = req.query;
  
  const validStatuses = ['novo', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Status inválido', 400, 'INVALID_STATUS');
  }
  
  const pedidos = await pedidoService.getPedidosByStatus(status, {
    limite: parseInt(limite),
    offset: (parseInt(pagina) - 1) * parseInt(limite)
  });
  
  res.status(200).json({
    success: true,
    data: pedidos,
    count: pedidos.length,
    status,
    pagina: parseInt(pagina),
    limite: parseInt(limite)
  });
};