# Sistema de Autenticación y Sesiones - Especificación

## Introducción

Este documento describe los requisitos para implementar un sistema de autenticación y gestión de sesiones seguro en la aplicación Hono.js existente. El sistema permitirá a los usuarios registrarse, iniciar sesión de forma segura, y mantener sesiones autenticadas.

## Glossario*

- **Sistema**: La aplicación API REST desarrollada con Hono.js
- **Usuario**: Persona que interactúa con el sistema mediante credenciales
- **Sesión**: Período de tiempo durante el cual un usuario permanece autenticado
- **Token JWT**: JSON Web Token utilizado para autenticación stateless
- **Hash**: Resultado de aplicar una función criptográfica unidireccional a una contraseña
- **Middleware de Autenticación**: Componente que verifica la validez de las credenciales en cada petición

## Dependencias Recomendadas

### 1. bcrypt (v5.1.1)
**Propósito**: Hashear y verificar contraseñas de forma segura.

**¿Por qué?**
- Implementa el algoritmo bcrypt diseñado específicamente para contraseñas
- Incluye "salt" automático para prevenir ataques de rainbow tables
- Ajustable en complejidad (cost factor) para resistir ataques de fuerza bruta
- Estándar de la industria para almacenamiento de contraseñas

**Uso básico**:
```typescript
import bcrypt from 'bcrypt';

// Hashear contraseña al registrar
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verificar contraseña al hacer login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 2. jsonwebtoken (v9.0.2)
**Propósito**: Crear y verificar tokens JWT para autenticación stateless.

**¿Por qué?**
- Permite autenticación sin almacenar sesiones en el servidor
- Los tokens contienen información del usuario de forma segura
- Pueden incluir tiempo de expiración
- Estándar ampliamente adoptado (RFC 7519)

**Uso básico**:
```typescript
import jwt from 'jsonwebtoken';

// Crear token al hacer login
const token = jwt.sign(
  { userId: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Verificar token en middleware
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### 3. @types/bcrypt y @types/jsonwebtoken
**Propósito**: Definiciones de tipos TypeScript para las librerías anteriores.

**¿Por qué?**
- Proporciona autocompletado en el IDE
- Detecta errores de tipo en tiempo de desarrollo
- Mejora la experiencia de desarrollo con TypeScript

## Requisitos

### Requirement 1: Registro de Usuario Seguro

**User Story:** Como usuario nuevo, quiero registrarme en el sistema con credenciales seguras, para poder acceder a funcionalidades protegidas.

#### Acceptance Criteria

1. WHEN un usuario envía credenciales de registro THEN el Sistema SHALL hashear la contraseña usando bcrypt antes de almacenarla en la base de datos
2. WHEN un usuario intenta registrarse con un username existente THEN el Sistema SHALL rechazar el registro y retornar un error 409 (Conflict)
3. WHEN un usuario se registra exitosamente THEN el Sistema SHALL almacenar el hash de la contraseña y retornar un código 201 (Created)
4. WHEN un usuario envía una contraseña de menos de 8 caracteres THEN el Sistema SHALL rechazar el registro y retornar un error 400 (Bad Request)
5. WHEN un usuario se registra THEN el Sistema SHALL NO retornar la contraseña hasheada en la respuesta

### Requirement 2: Inicio de Sesión

**User Story:** Como usuario registrado, quiero iniciar sesión con mis credenciales, para obtener acceso autenticado al sistema.

#### Acceptance Criteria

1. WHEN un usuario envía credenciales válidas THEN el Sistema SHALL generar un token JWT con tiempo de expiración de 24 horas
2. WHEN un usuario envía credenciales inválidas THEN el Sistema SHALL retornar un error 401 (Unauthorized) sin revelar si el username o password es incorrecto
3. WHEN un usuario inicia sesión exitosamente THEN el Sistema SHALL retornar el token JWT en la respuesta
4. WHEN se genera un token JWT THEN el Sistema SHALL incluir el userId y username en el payload
5. WHEN se genera un token JWT THEN el Sistema SHALL firmarlo con una clave secreta almacenada en variables de entorno

### Requirement 3: Protección de Rutas

**User Story:** Como administrador del sistema, quiero que ciertas rutas requieran autenticación, para proteger datos sensibles.

#### Acceptance Criteria

1. WHEN una petición incluye un token JWT válido en el header Authorization THEN el Sistema SHALL permitir el acceso a rutas protegidas
2. WHEN una petición no incluye token JWT THEN el Sistema SHALL retornar un error 401 (Unauthorized)
3. WHEN una petición incluye un token JWT expirado THEN el Sistema SHALL retornar un error 401 (Unauthorized) con mensaje "Token expired"
4. WHEN una petición incluye un token JWT inválido THEN el Sistema SHALL retornar un error 401 (Unauthorized) con mensaje "Invalid token"
5. WHEN un token es validado exitosamente THEN el Sistema SHALL agregar la información del usuario al contexto de la petición

### Requirement 4: Gestión de Sesiones

**User Story:** Como usuario autenticado, quiero que mi sesión expire después de un tiempo, para mantener la seguridad de mi cuenta.

#### Acceptance Criteria

1. WHEN se crea un token JWT THEN el Sistema SHALL configurar un tiempo de expiración de 24 horas
2. WHEN un usuario intenta usar un token expirado THEN el Sistema SHALL rechazar la petición y requerir nuevo login
3. WHEN un usuario cierra sesión THEN el Sistema SHALL invalidar el token en el cliente
4. WHEN se verifica un token THEN el Sistema SHALL validar la firma y el tiempo de expiración

### Requirement 5: Seguridad de Contraseñas

**User Story:** Como usuario, quiero que mis contraseñas estén almacenadas de forma segura, para proteger mi cuenta de accesos no autorizados.

#### Acceptance Criteria

1. WHEN el Sistema hashea una contraseña THEN el Sistema SHALL usar bcrypt con un cost factor mínimo de 10
2. WHEN el Sistema almacena una contraseña THEN el Sistema SHALL almacenar únicamente el hash, nunca la contraseña en texto plano
3. WHEN el Sistema verifica una contraseña THEN el Sistema SHALL usar bcrypt.compare para comparación segura
4. WHEN el Sistema retorna información de usuario THEN el Sistema SHALL excluir el campo password del resultado
5. WHEN se actualiza una contraseña THEN el Sistema SHALL hashear la nueva contraseña antes de almacenarla

### Requirement 6: Variables de Entorno

**User Story:** Como desarrollador, quiero configurar secretos mediante variables de entorno, para mantener la seguridad en diferentes ambientes.

#### Acceptance Criteria

1. WHEN el Sistema inicia THEN el Sistema SHALL cargar JWT_SECRET desde variables de entorno
2. WHEN JWT_SECRET no está definido THEN el Sistema SHALL lanzar un error y no iniciar
3. WHEN se genera un token JWT THEN el Sistema SHALL usar JWT_SECRET para firmar el token
4. WHEN se verifica un token JWT THEN el Sistema SHALL usar JWT_SECRET para validar la firma
5. WHEN se documenta la configuración THEN el Sistema SHALL incluir JWT_SECRET en el archivo .env.example

## Estructura de Implementación Propuesta

```
src/
├── config/
│   └── db.ts
├── middleware/
│   ├── programmingHistoryFact.ts
│   └── auth.ts                    # Nuevo: Middleware de autenticación
├── routes/
│   ├── userRouter.ts              # Modificar: Agregar rutas de auth
│   ├── factsRouter.ts
│   └── authRouter.ts              # Nuevo: Rutas de login/registro
├── services/
│   └── authService.ts             # Nuevo: Lógica de autenticación
└── index.ts
```

## Flujo de Autenticación

### Registro:
1. Usuario envía POST /api/v1/auth/register con { username, password, email, phone, zip_code }
2. Sistema valida que username no exista
3. Sistema hashea password con bcrypt
4. Sistema guarda usuario en base de datos
5. Sistema retorna 201 Created

### Login:
1. Usuario envía POST /api/v1/auth/login con { username, password }
2. Sistema busca usuario por username
3. Sistema compara password con bcrypt.compare
4. Sistema genera JWT con información del usuario
5. Sistema retorna token JWT

### Acceso a Ruta Protegida:
1. Cliente envía petición con header: Authorization: Bearer <token>
2. Middleware extrae y verifica token
3. Si válido: agrega usuario al contexto y continúa
4. Si inválido: retorna 401 Unauthorized

## Consideraciones de Seguridad

1. **Nunca** almacenar contraseñas en texto plano
2. **Siempre** usar HTTPS en producción
3. **Rotar** JWT_SECRET periódicamente
4. **Implementar** rate limiting en endpoints de auth
5. **Validar** todos los inputs del usuario
6. **Usar** consultas preparadas para prevenir SQL injection
7. **No revelar** información sobre existencia de usuarios en errores
8. **Implementar** logout en el cliente (eliminar token)

## Variables de Entorno Adicionales

Agregar a `.env`:
```env
JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria_aqui
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

## Comandos de Instalación

```bash
npm install bcrypt jsonwebtoken
npm install --save-dev @types/bcrypt @types/jsonwebtoken
```

## Próximos Pasos

1. Revisar y aprobar estos requisitos
2. Crear el diseño detallado de la implementación
3. Crear el plan de tareas (tasks.md)
4. Implementar paso a paso según el plan
