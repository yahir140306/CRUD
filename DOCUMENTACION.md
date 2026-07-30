# Documentación Detallada del Sistema CRUD (Gestión de Inventario Farmacéutico)

Esta documentación exhaustiva explica archivo por archivo y bloque por bloque cómo funciona la aplicación, cubriendo tanto el Backend (Spring Boot) como el Frontend (Angular 17).

---

## 1. BACKEND (Spring Boot 3 + Java 17)
El backend está estructurado en capas (Controladores, Servicios, Repositorios y Entidades) siguiendo el patrón MVC y conectándose a una base de datos PostgreSQL.

### 1.1 Entidades (Modelos de Base de Datos)
Definen la estructura de las tablas en PostgreSQL.

**`entities/User.java`**
Representa a los usuarios del sistema. Implementa `UserDetails` de Spring Security para manejar la autenticación.
- **Campos principales:** `id`, `username`, `email`, `password`, `role`.
- **Bloque clave:** Los roles (`ROLE_USER`, `ROLE_ADMIN`, `ROLE_OWNER`) definen qué puede hacer cada usuario.

**`entities/Product.java`**
Representa los artículos médicos o productos.
- **Campos principales:** `id`, `name`, `description`, `price`, `stock`, `category`, `imageBase64`.
- **Relación:** Contiene `@ManyToOne User user;` indicando que muchos productos son registrados por un usuario.
```java
@ManyToOne
@JoinColumn(name = "user_id", nullable = false)
private User user; // Vincula el producto con su creador
```

### 1.2 Repositorios (Acceso a Datos)
Interfaces que extienden de `JpaRepository` para proporcionar métodos mágicos que hacen consultas SQL de forma automática.

**`repository/UserRepository.java`**
```java
Optional<User> findByUsername(String username); // Busca un usuario para el Login
```

**`repository/ProductRepository.java`**
```java
// Hereda métodos como findAll(), findById(), save(), delete()
public interface ProductRepository extends JpaRepository<Product, Long> { }
```

### 1.3 Servicios (Lógica de Negocio)
Aquí residen las reglas y restricciones del sistema.

**`services/UserDetailsServiceImpl.java`**
Le dice a Spring Security cómo buscar a un usuario en la BD durante el login. Si no existe, lanza un error.

**`services/ProductServiceImpl.java`**
Implementa el CRUD. 
- **Lectura (`findAll`):** Retorna todos los productos para que el inventario sea global.
- **Creación (`createForCurrentUser`):** Asigna el usuario logueado actualmente al producto antes de guardarlo.
- **Actualización (`updateForCurrentUser`):** Busca el producto, actualiza sus campos, pero mantiene intacto al `User` original que lo creó para no perder el registro.
```java
Product existing = productRepository.findById(id)...
product.setId(id);
product.setUser(existing.getUser()); // Conserva al creador original
return productRepository.save(product);
```

### 1.4 Controladores (Endpoints de la API REST)
Puntos de entrada que el Frontend llama a través de HTTP.

**`controllers/ProductController.java`**
Expone las rutas `/api/products`.
- `@GetMapping`: Llama al servicio para obtener la lista de productos o un producto por ID.
- `@PostMapping`: Llama al servicio para crear un producto leyendo el `@RequestBody` (JSON).
- `@PutMapping("/{id}")`: Actualiza el producto asociado a ese ID.
- `@DeleteMapping("/{id}")`: Elimina un producto.

### 1.5 Seguridad y Autenticación (JWT)

**`security/JwtTokenProvider.java`**
Se encarga de crear (firmar) un Token JWT al iniciar sesión y de validarlo en cada petición subsecuente.

**`security/JwtAuthenticationFilter.java`**
Es un "guardia de seguridad" (Filtro) que se ejecuta antes de cualquier petición.
- **Flujo:** Extrae el token de la cabecera `Authorization: Bearer <token>`. Si es válido, extrae el `username`, busca los roles y establece el usuario como "Autenticado" en el contexto de Spring.

**`SpringSecurityConfig.java`**
El corazón de la seguridad. Define quién puede entrar a qué lugar.
```java
.requestMatchers(HttpMethod.GET, "/api/products/**").authenticated() // Todos pueden leer
.requestMatchers("/api/users/**").hasRole("OWNER") // Solo el dueño gestiona roles
.requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "OWNER") // Solo Admin y Dueño crean productos
```

---

## 2. FRONTEND (Angular 17)
El Frontend utiliza componentes "Standalone" (sin módulos), la API Reactiva "Signals" y CSS puro para un diseño adaptable a móviles.

### 2.1 Configuración Base

**`app.routes.ts`**
Define qué componente cargar según la URL. Utiliza `canActivate: [authGuard]` para impedir que usuarios sin sesión activa entren al dashboard o a ver los productos.

**`core/interceptors/auth.interceptor.ts`**
Intercepta *todas* las peticiones HTTP que salen de Angular hacia Spring Boot y les inyecta automáticamente el Token JWT en la cabecera. Si no existiera, Spring Boot las rechazaría.
```typescript
const cloned = req.clone({
  headers: req.headers.set('Authorization', `Bearer ${token}`)
});
return next(cloned);
```

### 2.2 Servicios Frontend

**`core/services/auth.service.ts`**
Maneja el inicio de sesión. Hace el `POST /api/auth/login`, recibe el token, lo guarda en `localStorage` y actualiza una señal `currentUserSignal` para que toda la app sepa quién está conectado.

**`products/services/product.service.ts`**
Tiene los métodos para hablar con `ProductController.java` mediante `HttpClient`.
Además, tiene una señal reactiva `searchTerm = signal<string>('')` que guarda el texto que el usuario escribe en el buscador superior.

### 2.3 Componente Principal y Navegación

**`app.component.ts` & `app.component.html`**
- Es la "Cáscara" de la aplicación. Contiene el Header (barra superior) y el Sidebar (menú lateral).
- **Buscador:** El `<input>` en el header llama a `onSearch(term)`, que actualiza globalmente la señal `searchTerm` en el `ProductService`.

### 2.4 Gestión de Productos (CRUD)

**`products/components/product/product.component.ts` (Lógica)**
- Utiliza **Signals**: `products` guarda la lista obtenida de la BD.
- Utiliza **Computed**: `filteredProducts` se recalcula *automáticamente* y de inmediato en cuanto `products` o `searchTerm` cambian. Esto permite buscar en tiempo real sin recargar.
```typescript
filteredProducts = computed(() => {
  const term = this.service.searchTerm().toLowerCase();
  return this.products().filter(p => p.name.includes(term) || p.description.includes(term));
});
```

**`products/components/product/product.component.html` (Vista)**
Muestra la lista de productos. 
- **Tabla HTML:** Se itera usando `@for (product of filteredProducts())`.
- **Modales (Popups):** Usa `@if (imageToView())` y `@if (productDetails())` para mostrar la imagen ampliada o los detalles del producto cuando el usuario hace clic.

**`products/components/product/product.component.css` (Diseño Responsive)**
El bloque de medios `@media (max-width: 768px)` convierte la tabla clásica de HTML en "Tarjetas" para celulares, cambiando el `display` de los `<tr>` a `block`, y usando pseudo-elementos (`::before`) para inyectar títulos.

**`products/components/form/product-form.component.ts`**
El formulario reactivo. Usa `FormBuilder` para aplicar validaciones (ej. el precio debe ser mayor a 0).
Cuando el usuario da clic en "Crear" o "Actualizar", emite un evento `newProductEvent` que atrapa el componente padre (`ProductComponent`) para mandarlo al servidor.

### 2.5 Gestión de Usuarios

**`features/users/users.component.ts` & `.html`**
- Una pantalla exclusiva para el rol `ROLE_OWNER`.
- Consiste en una tabla (que también se convierte en tarjetas en móvil) donde se listan los empleados.
- El dueño puede usar un elemento `<select>` para cambiarle el rol a otro usuario (hacerlo ADMIN o degradarlo a USER). Al cambiar el selector, se envía la petición al backend para actualizar los permisos en la base de datos.
