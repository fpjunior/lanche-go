import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ImageUploadResponse {
  status: string;
  message: string;
  data: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
  };
}

export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'success' | 'error';
  filename?: string;
  url?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private baseUrl = `${environment.apiUrl}/images`;
  private uploadProgressSubject = new BehaviorSubject<UploadProgress | null>(null);
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Upload de imagem para o cardápio
   */
  uploadMenuImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    this.uploadProgressSubject.next({
      progress: 0,
      status: 'uploading'
    });

    return this.http.post<ImageUploadResponse>(`${this.baseUrl}/menu`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const progress = Math.round(100 * event.loaded / event.total);
              this.uploadProgressSubject.next({
                progress,
                status: 'uploading'
              });
            }
            return null;

          case HttpEventType.Response:
            const response = event.body as ImageUploadResponse;
            this.uploadProgressSubject.next({
              progress: 100,
              status: 'success',
              filename: response.data.filename,
              url: response.data.url
            });
            return response;

          default:
            return null;
        }
      }),
      // Filtrar valores null
      map(response => response!)
    );
  }

  /**
   * Deletar imagem do cardápio
   */
  deleteMenuImage(filename: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/menu/${filename}`);
  }

  /**
   * Listar todas as imagens do cardápio
   */
  listMenuImages(): Observable<any> {
    return this.http.get(`${this.baseUrl}/menu`);
  }

  /**
   * Atualizar imagem de um item do menu
   */
  updateMenuItemImage(itemId: number, imageUrl: string): Observable<any> {
    return this.http.put(`${environment.apiUrl}/menu/${itemId}/imagem`, {
      imagemUrl: imageUrl
    });
  }

  /**
   * Remover imagem de um item do menu
   */
  removeMenuItemImage(itemId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/menu/${itemId}/imagem`);
  }

  /**
   * Validar arquivo de imagem
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Verificar tamanho (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo permitido: 5MB'
      };
    }

    // Verificar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido. Use: JPEG, PNG ou WebP'
      };
    }

    return { valid: true };
  }

  /**
   * Gerar URL completa da imagem
   */
  getImageUrl(filename: string): string {
    if (!filename) return this.getPlaceholderImage('default');
    
    // Se já é uma URL completa, retorna como está
    if (filename.startsWith('http')) return filename;
    
    // Se é um caminho relativo da API, constrói a URL completa
    if (filename.startsWith('/api/images/')) {
      return `${environment.apiUrl.replace('/api', '')}${filename}`;
    }
    
    // Se é apenas o nome do arquivo, constrói a URL da API
    return `${this.baseUrl}/menu/${filename}`;
  }

  /**
   * Gerar imagem placeholder baseada no tipo de item
   */
  getPlaceholderImage(category: string): string {
    const placeholders: { [key: string]: string } = {
      'lanche': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&auto=format',
      'bebida': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&auto=format',
      'sobremesa': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&auto=format',
      'petisco': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop&auto=format',
      'default': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format'
    };
    
    return placeholders[category] || placeholders['default'];
  }

  /**
   * Reset do progresso de upload
   */
  resetUploadProgress(): void {
    this.uploadProgressSubject.next(null);
  }

  /**
   * Reportar erro de upload
   */
  reportUploadError(error: string): void {
    this.uploadProgressSubject.next({
      progress: 0,
      status: 'error',
      error
    });
  }
}