import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ProductService } from './products/services/product.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isDark = signal(true);
  showProfileMenu = signal(false);
  isSidebarOpen = signal(true);
  authService = inject(AuthService);
  private router = inject(Router);
  public productService = inject(ProductService);
  toastService = inject(ToastService);

  ngOnInit() {
    // Leer tema guardado en localStorage, por defecto oscuro
    const saved = localStorage.getItem('theme');
    const prefersDark = saved ? saved === 'dark' : true;
    this.isDark.set(prefersDark);
    this.applyTheme(prefersDark);
  }

  // Alterna entre tema claro y oscuro
  toggleTheme() {
    const newValue = !this.isDark();
    this.isDark.set(newValue);
    this.applyTheme(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }

  // Aplica el tema al documento HTML
  private applyTheme(dark: boolean) {
    if (dark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  // Muestra u oculta el menú desplegable del perfil
  toggleProfileMenu() {
    this.showProfileMenu.update(v => !v);
  }

  // Muestra u oculta la barra lateral en móviles
  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  // Cierra la barra lateral (útil al hacer clic en un enlace)
  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  // Verifica si debe mostrar la barra de búsqueda (solo en artículos)
  get showSearch(): boolean {
    return this.router.url === '/' || this.router.url.startsWith('/products');
  }

  // Actualiza el término de búsqueda global en el servicio de productos
  onSearch(term: string) {
    this.productService.searchTerm.set(term);
  }

  // Limpia el buscador y muestra todos los productos
  clearSearch(input: HTMLInputElement) {
    input.value = '';
    this.productService.searchTerm.set('');
  }

  logout() {
    this.showProfileMenu.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
