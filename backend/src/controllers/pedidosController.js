import pedidosService from '../services/pedidosService.js';

class PedidosController {
  async criarPedido(req, res) {
    try {
      console.log('Criando novo pedido:', req.body);
      
      const dadosPedido = req.body;
      
      // Validações básicas
      if (!dadosPedido.cliente_nome) {
        return res.status(400).json({
          success: false,
          message: 'Nome do cliente é obrigatório'
        });
      }

      if (!dadosPedido.itens || dadosPedido.itens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'O pedido deve conter pelo menos um item'
        });
      }

      // Calcular total baseado nos itens
      const total = dadosPedido.itens.reduce((sum, item) => {
        return sum + (parseFloat(item.preco_unitario) * parseInt(item.quantidade));
      }, 0);

      dadosPedido.total = total.toFixed(2);

      // Calcular subtotal de cada item
      dadosPedido.itens = dadosPedido.itens.map(item => ({
        ...item,
        subtotal: (parseFloat(item.preco_unitario) * parseInt(item.quantidade)).toFixed(2)
      }));

      const novoPedido = await pedidosService.criarPedido(dadosPedido);
      
      console.log('Pedido criado com sucesso:', novoPedido.id);
      
      res.status(201).json({
        success: true,
        data: novoPedido,
        message: 'Pedido criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  async buscarPedidos(req, res) {
    try {
      const filtros = {
        status: req.query.status,
        cliente_telefone: req.query.cliente_telefone,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined
      };

      const pedidos = await pedidosService.buscarPedidos(filtros);
      
      res.json({
        success: true,
        data: pedidos,
        total: pedidos.length
      });
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  async buscarPedidoPorId(req, res) {
    try {
      const { id } = req.params;
      const pedido = await pedidosService.buscarPedidoPorId(id);
      
      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      res.json({
        success: true,
        data: pedido
      });
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  async atualizarStatusPedido(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status é obrigatório'
        });
      }

      const statusValidos = ['pendente', 'confirmado', 'preparando', 'pronto', 'entregue', 'cancelado'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status inválido'
        });
      }

      const pedidoAtualizado = await pedidosService.atualizarStatusPedido(id, status);
      
      if (!pedidoAtualizado) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      res.json({
        success: true,
        data: pedidoAtualizado,
        message: 'Status do pedido atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  async deletarPedido(req, res) {
    try {
      const { id } = req.params;
      const deletado = await pedidosService.deletarPedido(id);
      
      if (!deletado) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Pedido deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new PedidosController();