import { Router } from 'express';
import ImageController from '../controllers/ImageController.js';
import imageUploadService from '../middleware/imageUpload.js';
import { authenticateToken } from '../middleware/auth.js';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * @route POST /api/images/menu
 * @desc Upload de imagem para item do menu
 * @access Private
 */
router.post('/menu', 
  authenticateToken,
  imageUploadService.uploadMiddleware,
  ImageController.uploadMenuImage
);

/**
 * @route DELETE /api/images/menu/:filename
 * @desc Deletar imagem do menu
 * @access Private
 */
router.delete('/menu/:filename', 
  authenticateToken,
  ImageController.deleteMenuImage
);

/**
 * @route GET /api/images/menu
 * @desc Listar todas as imagens do menu
 * @access Private
 */
router.get('/menu', 
  authenticateToken,
  ImageController.listMenuImages
);

/**
 * @route GET /api/images/menu/:filename
 * @desc Servir imagem do menu (público)
 * @access Public
 */
router.get('/menu/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(process.cwd(), 'uploads', 'menu', filename);

    // Verificar se arquivo existe
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Imagem não encontrada',
        code: 'IMAGE_NOT_FOUND'
      });
    }

    // Definir content-type baseado na extensão
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Configurar headers para cache
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000', // 1 ano
      'ETag': `"${filename}"`,
      'Vary': 'Accept-Encoding'
    });

    // Enviar arquivo
    res.sendFile(filepath);

  } catch (error) {
    console.error('❌ [IMAGE] Erro ao servir imagem:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;