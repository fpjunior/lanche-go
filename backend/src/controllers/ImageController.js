import imageUploadService from '../middleware/imageUpload.js';
import path from 'path';

class ImageController {
  /**
   * Upload de imagem para item do menu
   * @route POST /api/images/menu
   */
  static async uploadMenuImage(req, res) {
    try {
      console.log('🖼️ [IMAGE] Iniciando upload de imagem do menu');

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Nenhuma imagem foi enviada',
          code: 'NO_FILE'
        });
      }

      const file = req.files[0];
      console.log('📁 [IMAGE] Arquivo recebido:', {
        name: file.originalname,
        size: file.size,
        type: file.mimetype
      });

      // Validar tamanho
      if (file.size > 5 * 1024 * 1024) { // 5MB
        return res.status(413).json({
          status: 'ERROR',
          message: 'Arquivo muito grande. Máximo permitido: 5MB',
          code: 'FILE_TOO_LARGE'
        });
      }

      // Validar tipo
      if (!imageUploadService.isValidImageType(file.mimetype)) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Tipo de arquivo não permitido. Use: JPEG, PNG ou WebP',
          code: 'INVALID_FILE_TYPE'
        });
      }

      // Gerar nome único
      const filename = imageUploadService.generateUniqueFilename(file.originalname);
      
      // Salvar arquivo
      await imageUploadService.saveFile(file.buffer, filename);

      console.log('✅ [IMAGE] Imagem salva:', filename);

      // Retornar informações do arquivo
      res.json({
        status: 'SUCCESS',
        message: 'Imagem enviada com sucesso',
        data: {
          filename: filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: `/api/images/menu/${filename}`
        }
      });

    } catch (error) {
      console.error('❌ [IMAGE] Erro no upload:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Deletar imagem do menu
   * @route DELETE /api/images/menu/:filename
   */
  static async deleteMenuImage(req, res) {
    try {
      const { filename } = req.params;

      if (!filename) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Nome do arquivo é obrigatório',
          code: 'MISSING_FILENAME'
        });
      }

      // Deletar arquivo
      await imageUploadService.deleteFile(filename);

      console.log('🗑️ [IMAGE] Imagem deletada:', filename);

      res.json({
        status: 'SUCCESS',
        message: 'Imagem deletada com sucesso'
      });

    } catch (error) {
      console.error('❌ [IMAGE] Erro ao deletar:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Listar imagens do menu
   * @route GET /api/images/menu
   */
  static async listMenuImages(req, res) {
    try {
      const fs = await import('fs');
      const uploadDir = path.join(process.cwd(), 'uploads', 'menu');

      fs.readdir(uploadDir, (err, files) => {
        if (err) {
          return res.status(500).json({
            status: 'ERROR',
            message: 'Erro ao listar imagens',
            code: 'READ_DIR_ERROR'
          });
        }

        const imageFiles = files
          .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
          .map(file => ({
            filename: file,
            url: `/api/images/menu/${file}`
          }));

        res.json({
          status: 'SUCCESS',
          data: imageFiles
        });
      });

    } catch (error) {
      console.error('❌ [IMAGE] Erro ao listar:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

export default ImageController;