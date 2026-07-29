import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private url: string = `${environment.apiUrl}/products`;
  
  // Signal para la búsqueda global
  searchTerm = signal<string>('');

  constructor(private http: HttpClient) {}

  findAll(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.url}?page=${page}&size=${size}`);
  }

  create(product: Product): Observable<Product> {
    return this.http.post<Product>(this.url, product);
  }

  update(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${product.id}`, product);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
