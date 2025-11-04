import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Middleware simples para upload de imagens sem dependências externas
 */
class ImageUploadService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads', 'menu');
    this.maxSize = 5 * 1024 * 1024; // 5MB
    this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    // Criar diretório se não existir
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validar tipo de arquivo
   */
  isValidImageType(mimetype) {
    return this.allowedTypes.includes(mimetype);
  }

  /**
   * Gerar nome único para arquivo
   */
  generateUniqueFilename(originalName) {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `menu_${timestamp}_${hash}${ext}`;
  }

  /**
   * Salvar arquivo no disco
   */
  async saveFile(buffer, filename) {
    const filepath = path.join(this.uploadDir, filename);
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, buffer, (err) => {
        if (err) reject(err);
        else resolve(filepath);
      });
    });
  }

  /**
   * Deletar arquivo
   */
  async deleteFile(filename) {
    const filepath = path.join(this.uploadDir, filename);
    return new Promise((resolve) => {
      fs.unlink(filepath, (err) => {
        if (err) console.warn('Erro ao deletar arquivo:', err.message);
        resolve(true);
      });
    });
  }

  /**
   * Middleware para processar upload
   */
  uploadMiddleware = (req, res, next) => {
    const chunks = [];
    let totalSize = 0;

    req.on('data', (chunk) => {
      totalSize += chunk.length;
      
      if (totalSize > this.maxSize) {
        return res.status(413).json({
          status: 'ERROR',
          message: 'Arquivo muito grande. Máximo permitido: 5MB',
          code: 'FILE_TOO_LARGE'
        });
      }
      
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        return next();
      }

      const buffer = Buffer.concat(chunks);
      
      // Parse básico do multipart/form-data
      const boundary = req.headers['content-type']?.split('boundary=')[1];
      if (!boundary) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Formato de upload inválido',
          code: 'INVALID_FORMAT'
        });
      }

      try {
        const parts = this.parseMultipart(buffer, boundary);
        req.files = parts.files;
        req.body = { ...req.body, ...parts.fields };
        next();
      } catch (error) {
        console.error('Erro no upload:', error);
        res.status(400).json({
          status: 'ERROR',
          message: 'Erro ao processar upload',
          code: 'UPLOAD_ERROR'
        });
      }
    });

    req.on('error', (error) => {
      console.error('Erro na requisição:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      });
    });
  };

  /**
   * Parser básico para multipart/form-data
   */
  parseMultipart(buffer, boundary) {
    const textDecoder = new TextDecoder();
    const boundaryBytes = Buffer.from(`--${boundary}`);
    const parts = [];
    const files = [];
    const fields = {};

    let start = 0;
    while (true) {
      const boundaryIndex = buffer.indexOf(boundaryBytes, start);
      if (boundaryIndex === -1) break;

      if (start > 0) {
        const partData = buffer.slice(start, boundaryIndex);
        const headerEnd = partData.indexOf('\r\n\r\n');
        
        if (headerEnd !== -1) {
          const headers = textDecoder.decode(partData.slice(0, headerEnd));
          const content = partData.slice(headerEnd + 4, -2); // Remove \r\n no final

          const nameMatch = headers.match(/name="([^"]+)"/);
          const filenameMatch = headers.match(/filename="([^"]+)"/);
          const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);

          if (nameMatch) {
            const fieldName = nameMatch[1];
            
            if (filenameMatch && contentTypeMatch) {
              // É um arquivo
              const filename = filenameMatch[1];
              const mimetype = contentTypeMatch[1].trim();
              
              if (this.isValidImageType(mimetype)) {
                files.push({
                  fieldname: fieldName,
                  originalname: filename,
                  mimetype: mimetype,
                  buffer: content,
                  size: content.length
                });
              }
            } else {
              // É um campo de texto
              fields[fieldName] = textDecoder.decode(content);
            }
          }
        }
      }

      start = boundaryIndex + boundaryBytes.length;
    }

    return { files, fields };
  }
}

export default new ImageUploadService();