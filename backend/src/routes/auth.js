import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route GET /api/auth/test
 * @desc Teste simples
 * @access Public
 */
router.get('/test', (req, res) => {
  console.log('🧪 [AUTH] Rota de teste chamada');
  res.json({ message: 'Rota de autenticação funcionando', timestamp: new Date().toISOString() });
});

/**
 * @route POST /api/auth/login
 * @desc Login do usuário
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout do usuário
 * @access Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @route GET /api/auth/me
 * @desc Dados do usuário autenticado
 * @access Private
 */
router.get('/me', authenticateToken, AuthController.me);

/**
 * @route GET /api/auth/permissions
 * @desc Permissões do usuário autenticado
 * @access Private
 */
router.get('/permissions', authenticateToken, AuthController.permissions);

/**
 * @route PUT /api/auth/change-password
 * @desc Alterar senha do usuário
 * @access Private
 */
router.put('/change-password', authenticateToken, AuthController.changePassword);

/**
 * @route POST /api/auth/forgot-password
 * @desc Solicitar redefinição de senha
 * @access Public
 */
router.post('/forgot-password', AuthController.forgotPassword);

/**
 * @route POST /api/auth/reset-password
 * @desc Redefinir senha usando token
 * @access Public
 */
router.post('/reset-password', AuthController.resetPassword);

export default router;