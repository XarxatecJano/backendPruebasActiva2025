# Tests del Backend

Este directorio contiene todos los tests para el backend de la aplicación. Los tests están organizados en diferentes categorías para cubrir todos los aspectos del código.

## Estructura de Tests

```
__tests__/
├── unit/                    # Tests unitarios
│   ├── controller/         # Tests de controladores
│   ├── model/             # Tests de modelos
│   ├── middleware/        # Tests de middleware
│   ├── routes/            # Tests de rutas
│   ├── types/             # Tests de tipos TypeScript
│   └── config/            # Tests de configuración
├── integration/           # Tests de integración
├── e2e/                  # Tests end-to-end
└── setup/               # Utilidades para tests
```

## Tipos de Tests

### Tests Unitarios (`unit/`)
- **Controller Tests**: Prueban la lógica de los controladores de forma aislada
- **Model Tests**: Verifican las operaciones de base de datos y lógica de modelos
- **Middleware Tests**: Validan el comportamiento de middleware de autenticación
- **Route Tests**: Comprueban la configuración de rutas
- **Type Tests**: Verifican la correcta definición de tipos TypeScript
- **Config Tests**: Prueban la configuración de base de datos

### Tests de Integración (`integration/`)
- Prueban el flujo completo de la aplicación
- Verifican la interacción entre diferentes componentes
- Simulan escenarios reales de uso

### Tests End-to-End (`e2e/`)
- Prueban flujos completos de usuario
- Verifican la seguridad y manejo de errores
- Documentan vulnerabilidades conocidas para futura refactorización

## Comandos de Test

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar solo tests unitarios
npm test -- __tests__/unit

# Ejecutar solo tests de integración
npm test -- __tests__/integration

# Ejecutar tests de un archivo específico
npm test -- UserController.test.ts
```

## Configuración

### Jest Configuration (`jest.config.js`)
- Configurado para TypeScript con ES modules
- Soporte para imports con extensión `.js`
- Cobertura de código configurada
- Setup automático de variables de entorno

### Test Setup (`jest.setup.js`)
- Variables de entorno para testing
- Mocks globales para reducir ruido en logs

### Test Utils (`setup/testUtils.ts`)
- Funciones utilitarias para crear mocks
- Helpers para configuración de tests
- Objetos mock reutilizables

## Mocks y Dependencias

Los tests utilizan mocks para:
- **Base de datos** (`pg`): Simulación de queries y resultados
- **Bcrypt**: Hash y comparación de passwords
- **JWT**: Generación y verificación de tokens
- **Hono Context**: Simulación de requests y responses

## Cobertura de Código

Los tests cubren:
- ✅ Modelos de datos (`UserModel`)
- ✅ Controladores (`UserController`)
- ✅ Middleware de autenticación
- ✅ Rutas de usuario y autenticación
- ✅ Tipos TypeScript
- ✅ Configuración de base de datos
- ✅ Flujos de integración
- ✅ Escenarios de error

## Casos de Test Importantes

### Funcionalidad Básica
- Creación, lectura, actualización y eliminación de usuarios
- Autenticación y autorización
- Validación de tokens JWT
- Manejo de middleware

### Casos de Error
- Errores de base de datos
- Tokens inválidos
- Usuarios no encontrados
- Permisos insuficientes
- Datos malformados

### Seguridad
- Validación de tokens JWT
- Verificación de roles de usuario
- Documentación de vulnerabilidades SQL injection (para futura corrección)

## Notas para Refactorización

Los tests documentan el comportamiento actual del código, incluyendo:

1. **Vulnerabilidades de SQL Injection**: Los métodos `deleteUser` y `updateUser` en `UserController` son vulnerables a SQL injection
2. **Separación de responsabilidades**: Los tests están preparados para cuando se refactorice la lógica de negocio
3. **Manejo de errores**: Algunos endpoints no manejan errores de base de datos apropiadamente

## Ejecutar Tests

Para instalar las dependencias de testing:

```bash
npm install
```

Para ejecutar todos los tests:

```bash
npm test
```

Los tests están configurados para ejecutarse en un entorno aislado con mocks, por lo que no requieren una base de datos real para ejecutarse.