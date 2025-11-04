import pool from '../config/database.js';
import multer from 'multer';
import sharp from 'sharp';

// Configuração do multer para armazenar em memória
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

class MenuItemsController {
  /**
   * Listar todos os itens do menu
   * @route GET /api/menu-items
   */
  static async index(req, res) {
    try {
      const { categoria, disponivel, search } = req.query;
      
      let query = `
        SELECT mi.*, c.nome as categoria_nome,
               CASE WHEN mi.image_data IS NOT NULL THEN true ELSE false END as has_image
        FROM menu_items mi 
        LEFT JOIN categorias c ON mi.categoria_id = c.id 
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (categoria) {
        paramCount++;
        query += ` AND mi.categoria = $${paramCount}`;
        params.push(categoria);
      }

      if (disponivel !== undefined) {
        paramCount++;
        query += ` AND mi.disponivel = $${paramCount}`;
        params.push(disponivel === 'true');
      }

      if (search) {
        paramCount++;
        query += ` AND (mi.nome ILIKE $${paramCount} OR mi.descricao ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      query += ` ORDER BY mi.created_at DESC`;

      const result = await pool.query(query, params);

      res.json({
        status: 'SUCCESS',
        data: result.rows.map(item => ({
          ...item,
          // Não incluir image_data na listagem para economizar bandwidth
          image_data: undefined,
          image_url: item.image_data ? `/api/menu-items/${item.id}/image` : null
        }))
      });

    } catch (error) {
      console.error('Erro ao listar itens do menu:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Buscar item específico do menu
   * @route GET /api/menu-items/:id
   */
  static async show(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(`
        SELECT mi.*, c.nome as categoria_nome,
               CASE WHEN mi.image_data IS NOT NULL THEN true ELSE false END as has_image
        FROM menu_items mi 
        LEFT JOIN categorias c ON mi.categoria_id = c.id 
        WHERE mi.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Item não encontrado',
          code: 'ITEM_NOT_FOUND'
        });
      }

      const item = result.rows[0];
      
      res.json({
        status: 'SUCCESS',
        data: {
          ...item,
          // Não incluir image_data na resposta JSON
          image_data: undefined,
          image_url: item.image_data ? `/api/menu-items/${item.id}/image` : null
        }
      });

    } catch (error) {
      console.error('Erro ao buscar item do menu:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Criar novo item do menu
   * @route POST /api/menu-items
   */
  static async create(req, res) {
    try {
      const {
        nome,
        descricao,
        preco,
        categoria,
        categoria_id,
        ingredientes,
        tags,
        disponivel = true
      } = req.body;

      // Validações básicas
      if (!nome || !preco || !categoria) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Nome, preço e categoria são obrigatórios',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      // Processar arrays de ingredientes e tags
      let processedIngredientes = null;
      let processedTags = null;

      if (ingredientes) {
        try {
          // Se for string, fazer parse do JSON
          const ingredientesArray = typeof ingredientes === 'string' 
            ? JSON.parse(ingredientes) 
            : ingredientes;
          processedIngredientes = Array.isArray(ingredientesArray) ? ingredientesArray : null;
        } catch (error) {
          console.error('Erro ao processar ingredientes:', error);
          processedIngredientes = null;
        }
      }

      if (tags) {
        try {
          // Se for string, fazer parse do JSON
          const tagsArray = typeof tags === 'string' 
            ? JSON.parse(tags) 
            : tags;
          processedTags = Array.isArray(tagsArray) ? tagsArray : null;
        } catch (error) {
          console.error('Erro ao processar tags:', error);
          processedTags = null;
        }
      }

      // Processar imagem se enviada
      let imageData = null;
      let imageName = null;
      let imageMimeType = null;
      let imageSize = null;

      if (req.file) {
        try {
          // Redimensionar e otimizar imagem
          const processedImage = await sharp(req.file.buffer)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();

          imageData = processedImage;
          imageName = req.file.originalname;
          imageMimeType = 'image/jpeg';
          imageSize = processedImage.length;
        } catch (imageError) {
          console.error('Erro ao processar imagem:', imageError);
          return res.status(400).json({
            status: 'ERROR',
            message: 'Erro ao processar imagem',
            code: 'IMAGE_PROCESSING_ERROR'
          });
        }
      }

      const result = await pool.query(`
        INSERT INTO menu_items (
          nome, descricao, preco, categoria, categoria_id, 
          ingredientes, tags, disponivel,
          image_data, image_name, image_mime_type, image_size,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
        ) RETURNING *
      `, [
        nome, 
        descricao, 
        parseFloat(preco), 
        categoria, 
        categoria_id,
        null, // ingredientes temporariamente null
        null, // tags temporariamente null
        disponivel,
        imageData, 
        imageName, 
        imageMimeType, 
        imageSize
      ]);

      const createdItem = result.rows[0];

      res.status(201).json({
        status: 'SUCCESS',
        message: 'Item criado com sucesso',
        data: {
          ...createdItem,
          image_data: undefined,
          image_url: createdItem.image_data ? `/api/menu-items/${createdItem.id}/image` : null
        }
      });

    } catch (error) {
      console.error('Erro ao criar item do menu:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Atualizar item do menu
   * @route PUT /api/menu-items/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        preco,
        categoria,
        categoria_id,
        ingredientes,
        tags,
        disponivel
      } = req.body;

      // Verificar se item existe
      const existingResult = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
      
      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Item não encontrado',
          code: 'ITEM_NOT_FOUND'
        });
      }

      const existingItem = existingResult.rows[0];

      // Processar nova imagem se enviada
      let imageData = existingItem.image_data;
      let imageName = existingItem.image_name;
      let imageMimeType = existingItem.image_mime_type;
      let imageSize = existingItem.image_size;

      if (req.file) {
        try {
          const processedImage = await sharp(req.file.buffer)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();

          imageData = processedImage;
          imageName = req.file.originalname;
          imageMimeType = 'image/jpeg';
          imageSize = processedImage.length;
        } catch (imageError) {
          console.error('Erro ao processar imagem:', imageError);
          return res.status(400).json({
            status: 'ERROR',
            message: 'Erro ao processar imagem',
            code: 'IMAGE_PROCESSING_ERROR'
          });
        }
      }

      // Por enquanto, apenas campos básicos sem imagem
      const result = await pool.query(`
        UPDATE menu_items SET 
          nome = $1, descricao = $2, preco = $3, categoria = $4, disponivel = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `, [
        nome || existingItem.nome,
        descricao !== undefined ? descricao : existingItem.descricao,
        preco ? parseFloat(preco) : existingItem.preco,
        categoria || existingItem.categoria,
        disponivel !== undefined ? disponivel : existingItem.disponivel,
        id
      ]);

      const updatedItem = result.rows[0];

      res.json({
        status: 'SUCCESS',
        message: 'Item atualizado com sucesso',
        data: {
          ...updatedItem,
          image_data: undefined,
          image_url: updatedItem.image_data ? `/api/menu-items/${updatedItem.id}/image` : null
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar item do menu:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Deletar item do menu
   * @route DELETE /api/menu-items/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Item não encontrado',
          code: 'ITEM_NOT_FOUND'
        });
      }

      res.json({
        status: 'SUCCESS',
        message: 'Item deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar item do menu:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Servir imagem do item
   * @route GET /api/menu-items/:id/image
   */
  static async getImage(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(`
        SELECT image_data, image_mime_type, image_name 
        FROM menu_items 
        WHERE id = $1 AND image_data IS NOT NULL
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'ERROR',
          message: 'Imagem não encontrada',
          code: 'IMAGE_NOT_FOUND'
        });
      }

      const { image_data, image_mime_type, image_name } = result.rows[0];

      res.set({
        'Content-Type': image_mime_type || 'image/jpeg',
        'Content-Length': image_data.length,
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 ano
        'Content-Disposition': `inline; filename="${image_name || 'image.jpg'}"`
      });

      res.send(image_data);

    } catch (error) {
      console.error('Erro ao servir imagem:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Middleware de upload
   */
  static uploadMiddleware() {
    return upload.single('image');
  }
}

export default MenuItemsController;