import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../products/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../products/models/product';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  // Inyectamos los servicios necesarios
  private productService = inject(ProductService);
  public authService = inject(AuthService);

  // Señal que contendrá nuestra lista de productos
  products = signal<Product[]>([]);


  // Computed: Total de productos registrados
  totalProducts = computed(() => this.products().length);

  // Computed: Valor total del inventario (precio * stock de cada producto)
  totalValue = computed(() => {
    return this.products().reduce((total, product) => total + (product.price * product.stock), 0);
  });

  // Computed: Cantidad de productos con stock bajo (<= 5 unidades)
  lowStockProducts = computed(() => {
    return this.products().filter(product => product.stock <= 5).length;
  });

  // Computed: Lista de categorías únicas con la cantidad de productos en cada una
  categories = computed(() => {
    const categoryCount: { [key: string]: number } = {};
    this.products().forEach(product => {
      const cat = product.category || 'Sin categoría';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    // Convertimos el objeto a un arreglo para poder iterar en la vista
    return Object.entries(categoryCount).map(([name, count]) => ({ name, count }));
  });

  // Computed: Producto con el precio más alto
  mostExpensiveProduct = computed(() => {
    const allProducts = this.products();
    if (allProducts.length === 0) return null;
    return allProducts.reduce((max, product) => product.price > max.price ? product : max, allProducts[0]);
  });

  ngOnInit() {
    // Obtenemos los productos al iniciar el componente
    this.productService.findAll(0, 1000).subscribe({
      next: (response: any) => this.products.set(response.content),
      error: (err: any) => console.error('Error al cargar productos', err),
    });
  }
}
