import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { ProductFormComponent } from '../form/product-form.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product',
  imports: [ProductFormComponent, DecimalPipe],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit {
  private service = inject(ProductService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Señales de estado del componente
  products = signal<Product[]>([]);
  username = signal<string | null>(null);
  productSelected = signal<Product>(new Product());
  productToDelete = signal<Product | null>(null);
  productDetails = signal<Product | null>(null); // Añadido para ver detalles
  imageToView = signal<string | null>(null); // Añadido para ver imágenes en grande

  // Señales para la paginación
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(5);
  totalPages = signal<number>(1);
  role = signal<string | null>(null);

  // Filtro de frontend opcional
  filteredProducts = computed(() => {
    const term = this.service.searchTerm().toLowerCase();
    return this.products().filter(
      (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.role.set(this.authService.getRole());
    this.username.set(this.authService.getUsername());
    this.loadProducts();
  }

  loadProducts(): void {
    this.service.findAll(this.currentPage() - 1, this.itemsPerPage()).subscribe((response: any) => {
      this.products.set(response.content);
      this.totalPages.set(response.totalPages);
    });
  }

  // Navega a la página siguiente
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadProducts();
    }
  }

  // Navega a la página anterior
  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadProducts();
    }
  }

  // Navega directamente a una página específica
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }

  // Crea o actualiza un producto según si tiene ID o no
  addProduct(product: Product): void {
    if (product.id > 0) {
      this.service.update(product).subscribe({
        next: (productUpdated: Product) => {
          this.products.update((currentProducts) =>
            currentProducts.map((prod) => (prod.id === product.id ? { ...productUpdated } : prod)),
          );
          this.toastService.show('Producto actualizado exitosamente', 'success');
        },
        error: () => this.toastService.show('Error al actualizar el producto', 'error')
      });
    } else {
      this.service.create(product).subscribe({
        next: (productNew: Product) => {
          this.products.update((currentProducts) => [...currentProducts, { ...productNew }]);
          this.toastService.show('Producto creado exitosamente', 'success');
          this.loadProducts();
        },
        error: () => this.toastService.show('Error al crear el producto', 'error')
      });
    }
    this.productSelected.set(new Product());
  }

  // Selecciona un producto para editarlo en el formulario
  onUpdateProduct(productRow: Product) {
    this.productSelected.set({ ...productRow });
  }

  // Abre el modal de confirmación de eliminación
  onRemoveProduct(product: Product): void {
    this.productToDelete.set(product);
  }

  // Confirma y ejecuta la eliminación del producto
  confirmDelete(): void {
    const product = this.productToDelete();
    if (product) {
      this.service.remove(product.id).subscribe({
        next: () => {
          this.products.update((currentProducts) =>
            currentProducts.filter((p) => p.id !== product.id),
          );
          // Ajustar la paginación si la página actual queda vacía
          if (this.currentPage() > this.totalPages() && this.totalPages() > 0) {
            this.currentPage.set(this.totalPages());
          }
          this.loadProducts();
          this.toastService.show('Producto eliminado exitosamente', 'info');
        },
        error: () => this.toastService.show('Error al eliminar el producto', 'error')
      });
      this.productToDelete.set(null);
    }
  }

  // Cancela la eliminación y cierra el modal
  cancelDelete(): void {
    this.productToDelete.set(null);
  }
}
