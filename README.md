# API de Gestión de Usuarios con Hono.js

API REST desarrollada con Hono.js y TypeScript para la gestión de usuarios, con conexión a PostgreSQL, formulario HTML para registro y datos curiosos de programación.

## 🚀 Tecnologías

- **Hono.js** - Framework web ultrarrápido para Node.js
- **TypeScript** - Tipado estático para JavaScript
- **PostgreSQL** - Base de datos relacional
- **Node.js** - Entorno de ejecución
- **pg** - Cliente PostgreSQL para Node.js

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd holamundohono
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

4. Edita el archivo `.env` con tus credenciales de PostgreSQL:
```env
DATABASE_URL=postgres://user:password@localhost:5432/db_name
PORT=3000
```

5. Crea la tabla en PostgreSQL:
```sql
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) NOT NULL,
    zip_code VARCHAR(5) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🏃 Ejecución

### Modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📡 API v1 - Endpoints

### GET /api/v1/User
Obtiene todos los usuarios registrados.

**Respuesta:**
```json
[
  {
    "id": 1,
    "username": "jgomez",
    "password": "********",
    "phone": "+34 600 123 456",
    "email": "usuario@dominio.com",
    "zip_code": "28001"
  }
]
```

### POST /api/v1/User
Crea un nuevo usuario.

**Body (form-data):**
- `username` (string, 8-20 caracteres)
- `password` (string, mínimo 8 caracteres)
- `phone` (string, opcional)
- `email` (string, requerido)
- `zip_code` (string, 5 dígitos)

### GET /api/v1/Fact
Obtiene un dato curioso aleatorio sobre la historia de la programación.

**Respuesta:**
```text
El primer bug informático documentado fue una polilla encontrada en un relé en 1947.
```

## 🌐 Interfaz Web

Accede a `http://localhost:3000/newUser.html` para utilizar el formulario de registro de usuarios.

El formulario incluye validaciones HTML5:
- Username: 8-20 caracteres alfanuméricos
- Password: mínimo 8 caracteres
- Teléfono: formato internacional
- Email: formato válido
- Código postal: 5 dígitos (formato España)

## 📁 Estructura del Proyecto

```
holamundohono/
├── src/
│   ├── config/
│   │   └── db.ts                        # Configuración de PostgreSQL
│   ├── middleware/
│   │   └── programmingHistoryFact.ts    # Middleware de datos curiosos
│   ├── routes/
│   │   ├── userRouter.ts                # Rutas de usuarios
│   │   └── factsRouter.ts               # Rutas de datos curiosos
│   └── index.ts                         # Servidor principal
├── public/
│   └── newUser.html                     # Formulario de registro
├── .env.example                         # Variables de entorno de ejemplo
├── package.json
├── tsconfig.json
└── README.md
```

## ⚠️ Consideraciones de Seguridad

**IMPORTANTE:** Esta aplicación es un ejemplo educativo. Para producción, considera:

- ✅ Hashear contraseñas con bcrypt o argon2
- ✅ Usar consultas preparadas para prevenir SQL injection
- ✅ Implementar validación de datos en el backend
- ✅ Añadir autenticación y autorización (JWT, sesiones)
- ✅ Implementar rate limiting
- ✅ Usar HTTPS
- ✅ Sanitizar inputs del usuario

## 🛠️ Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo con hot-reload
- `npm test` - Ejecuta los tests (pendiente de implementar)

## 📝 Licencia

ISC

## 👤 Autor

[Tu nombre]
