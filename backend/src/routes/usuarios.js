import { Router } from 'express';
import UsuariosController from '../controllers/UsuariosController.js';
import auth, { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route GET /api/usuarios/modulos
 * @desc Listar módulos disponíveis
 * @access Private (Admin)
 */
router.get('/modulos', authenticateToken, auth(['admin']), UsuariosController.getModulos);

/**
 * @route GET /api/usuarios
 * @desc Listar todos os usuários
 * @access Private (Admin)
 */
router.get('/', authenticateToken, auth(['admin']), UsuariosController.index);

/**
 * @route GET /api/usuarios/:id
 * @desc Buscar usuário por ID
 * @access Private (Admin)
 */
router.get('/:id', authenticateToken, auth(['admin']), UsuariosController.show);

/**
 * @route POST /api/usuarios
 * @desc Criar novo usuário
 * @access Private (Admin)
 */
router.post('/', authenticateToken, auth(['admin']), UsuariosController.create);

/**
 * @route PUT /api/usuarios/:id
 * @desc Atualizar usuário
 * @access Private (Admin)
 */
router.put('/:id', authenticateToken, auth(['admin']), UsuariosController.update);

/**
 * @route DELETE /api/usuarios/:id
 * @desc Remover usuário
 * @access Private (Admin)
 */
router.delete('/:id', authenticateToken, auth(['admin']), UsuariosController.delete);

export default router;