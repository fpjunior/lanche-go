import { Router } from 'express';
import MenuItemsController from '../controllers/MenuItemsController.js';
import { authenticateToken } from '../middleware/auth.js';
import auth from '../middleware/auth.js';

const router = Router();

console.log('📋 Registrando rotas de Menu Items...');

/**
 * @route GET /api/menu-items
 * @desc Listar todos os itens do menu
 * @access Public (para visualização do cardápio)
 */
router.get('/', MenuItemsController.index);
console.log('✅ Rota GET /api/menu-items registrada');

/**
 * @route GET /api/menu-items/:id
 * @desc Buscar item específico do menu
 * @access Public
 */
router.get('/:id', MenuItemsController.show);

/**
 * @route GET /api/menu-items/:id/image
 * @desc Servir imagem do item
 * @access Public
 */
router.get('/:id/image', MenuItemsController.getImage);

/**
 * @route POST /api/menu-items
 * @desc Criar novo item do menu
 * @access Private (Admin apenas)
 */
router.post('/', 
  authenticateToken, 
  auth(['admin']), 
  MenuItemsController.uploadMiddleware(),
  MenuItemsController.create
);

/**
 * @route PUT /api/menu-items/:id
 * @desc Atualizar item do menu
 * @access Private (Admin apenas)
 */
router.put('/:id', 
  authenticateToken, 
  auth(['admin']), 
  MenuItemsController.uploadMiddleware(),
  MenuItemsController.update
);

/**
 * @route DELETE /api/menu-items/:id
 * @desc Deletar item do menu
 * @access Private (Admin apenas)
 */
router.delete('/:id', 
  authenticateToken, 
  auth(['admin']), 
  MenuItemsController.delete
);

export default router;