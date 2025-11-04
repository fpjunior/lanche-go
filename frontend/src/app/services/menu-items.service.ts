import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MenuItem {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  categoria_nome?: string;
  disponivel: boolean;
  ingredientes?: string[];
  tags?: string[];
  has_image: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItemsResponse {
  status: string;
  data: MenuItem[];
}

export interface MenuItemResponse {
  status: string;
  data: MenuItem;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuItemsService {
  private apiUrl = `${environment.apiUrl}/menu-items`;

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<MenuItemsResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http.get<MenuItemsResponse>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<MenuItemResponse> {
    return this.http.get<MenuItemResponse>(`${this.apiUrl}/${id}`);
  }

  create(formData: FormData): Observable<MenuItemResponse> {
    return this.http.post<MenuItemResponse>(this.apiUrl, formData);
  }

  createSimple(data: any): Observable<MenuItemResponse> {
    return this.http.post<MenuItemResponse>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<MenuItemResponse> {
    // Se for FormData (com imagem), usar FormData
    if (data instanceof FormData) {
      return this.http.put<MenuItemResponse>(`${this.apiUrl}/${id}`, data);
    }
    
    // Se for objeto simples (sem imagem), usar JSON
    return this.http.put<MenuItemResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getImageUrl(id: number): string {
    return `${this.apiUrl}/${id}/image`;
  }
}