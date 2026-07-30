# 🏥 Sistema de Inventario Farmacéutico

Bienvenido al repositorio del Sistema de Inventario Farmacéutico. Esta aplicación permite gestionar de manera eficiente los artículos médicos, controlando el stock, los precios y manejando un control de acceso estricto a través de roles de usuario.

---

## 🚀 Tecnologías Utilizadas

### Frontend
* **Angular 17** (Standalone Components, Signals, Control Flow)
* **HTML5 y CSS3 Puro** (Diseño totalmente responsivo, interfaz tipo "Tarjetas" para móviles)
* **TypeScript**

### Backend
* **Java 17** con **Spring Boot 3**
* **Spring Security** (Autenticación sin estado - Stateless)
* **JWT (JSON Web Tokens)** para manejo de sesiones
* **Spring Data JPA** (Hibernate)
* **PostgreSQL** (Base de Datos Relacional en la nube)

---

## 📦 Características Principales

* **Autenticación Segura:** Login y registro protegidos mediante tokens JWT.
* **Control de Roles:**
  * `ROLE_USER`: Solo puede visualizar el inventario.
  * `ROLE_ADMIN`: Puede visualizar, crear, editar y eliminar productos.
  * `ROLE_OWNER`: Privilegios supremos, incluyendo la capacidad de promover empleados a administradores.
* **Inventario Global:** Todos los usuarios de la empresa comparten y visualizan el mismo catálogo de productos en tiempo real.
* **Búsqueda Dinámica:** Filtrado de productos instantáneo sin recargar la página, utilizando *Angular Signals*.
* **UI/UX Moderna y Responsiva:** El diseño se adapta perfectamente a dispositivos móviles, cambiando la tradicional tabla de datos por un elegante diseño de tarjetas.
* **Visor de Imágenes:** Sistema de modales integrados para previsualizar fotografías de los artículos.

---

## 🛠️ Instalación y Configuración Local

### Prerrequisitos
* Node.js v18+ y Angular CLI v17+
* Java Development Kit (JDK) 17+
* Maven
* PostgreSQL

### 1. Clonar el repositorio
```bash
git clone https://github.com/yahir140306/CRUD.git
cd CRUD
```

### 2. Configurar el Backend
Dirígete a la carpeta del backend y configura las variables de entorno necesarias para la conexión a la base de datos y la firma del JWT. Puedes exportarlas en tu terminal o configurarlas en tu IDE.

```bash
export DB_URL="jdbc:postgresql://localhost:5432/tu_base_de_datos"
export DB_USER="tu_usuario"
export DB_PASSWORD="tu_password"
export JWT_SECRET="tu_super_secreto_para_firmar_los_tokens"
```

Luego ejecuta el backend:
```bash
cd backend
./mvnw spring-boot:run
```

### 3. Configurar el Frontend
Abre otra pestaña en tu terminal y navega a la carpeta del frontend:
```bash
cd frontend
npm install
npm start
```
La aplicación estará disponible en `http://localhost:4200`.

---

## 📚 Documentación Técnica

Para una explicación a nivel de código sobre la arquitectura, el funcionamiento de los componentes, los interceptores, el manejo de Signals y las reglas de seguridad del Backend, por favor revisa el archivo [DOCUMENTACION.md](./DOCUMENTACION.md) incluido en este repositorio.

---
*Desarrollado con ❤️ para optimizar la gestión farmacéutica.*
