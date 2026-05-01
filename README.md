# Epic RPG Frontend

Un RPG estratégico moderno construido con Next.js 15, Supabase y TypeScript, diseñado para escalar a miles de usuarios concurrentes.

## 🚀 Características Principales

### Arquitectura Escalable
- **React Query** para caching inteligente y sincronización de estado
- **Zustand stores modulares** separados por dominio
- **Sistema de validación** con Zod para type safety
- **Rate limiting** integrado para protección de APIs
- **Virtualización** automática para listas grandes

### Rendimiento Optimizado
- **Code splitting** automático por rutas
- **Asset manager** con lazy loading y cache inteligente
- **Monitoreo de performance** con Web Vitals
- **Sistema de logging** estructurado
- **Preloading** inteligente de recursos críticos

### Calidad de Código
- **ESLint + Prettier** con reglas estrictas
- **Husky pre-commits** automatizados
- **TypeScript strict** mode
- **Testing framework** configurado (Jest + RTL)
- **Error boundaries** comprehensivos

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Base de datos**: Supabase (PostgreSQL)
- **State Management**: Zustand + React Query
- **Animations**: Motion (Framer Motion)
- **Validation**: Zod
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## 📁 Estructura del Proyecto

```
epic-front/
├── app/                    # Next.js App Router
├── components/             # Componentes React
│   ├── ui/                # Componentes base reutilizables
│   └── views/             # Vistas principales del juego
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y configuración
│   ├── config/           # Configuración centralizada
│   ├── services/         # Servicios de negocio
│   ├── stores/           # Estado global (Zustand)
│   ├── validation/       # Esquemas de validación
│   └── rpg-system/       # Lógica del juego
├── public/               # Assets estáticos
├── supabase/            # Scripts de base de datos
└── types/               # Definiciones de tipos
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/Leem0nStudio/Epic-Front.git
   cd epic-front
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura variables de entorno**
   ```bash
   cp .env.example .env.local
   # Edita .env.local con tus credenciales de Supabase
   ```

4. **Configura la base de datos**
   ```bash
   # Ejecuta los scripts SQL en orden en Supabase SQL Editor
   # 01-schema.sql → 02-security.sql → 03-functions.sql → 04-seed.sql
   ```

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

## 📊 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run start           # Servidor de producción

# Calidad de código
npm run lint            # Ejecutar ESLint
npm run lint:fix        # Corregir errores de linting
npm run type-check      # Verificar tipos TypeScript

# Testing
npm run test            # Ejecutar tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Tests con coverage

# Utilidades
npm run clean           # Limpiar cache de Next.js
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Opcional: Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Configuración de app
NEXT_PUBLIC_APP_ENV=development
```

### Configuración de ESLint

Las reglas de ESLint están configuradas en `eslint.config.mjs` con:
- Reglas estrictas de TypeScript
- Reglas de React y hooks
- Reglas de accesibilidad
- Reglas personalizadas para el proyecto

### Configuración de Prettier

El formato de código está configurado en `.prettierrc.json` con:
- Single quotes
- Trailing commas
- Print width de 100 caracteres

## 🧪 Testing

### Ejecutar Tests
```bash
npm run test
```

### Tests con Coverage
```bash
npm run test:coverage
```

### Estructura de Tests
```
__tests__/
├── unit/           # Tests unitarios
├── integration/    # Tests de integración
└── e2e/           # Tests end-to-end (planeado)
```

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
npm run start
```

### Variables de Producción
Asegúrate de configurar estas variables en tu plataforma de despliegue:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NODE_ENV=production`

### Optimizaciones de Producción
- **Code splitting** automático
- **Asset optimization** con Next.js
- **API response compression**
- **CDN integration** para assets

## 📈 Monitoreo y Analytics

### Web Vitals
El proyecto incluye monitoreo automático de:
- **CLS** (Cumulative Layout Shift)
- **FID** (First Input Delay)
- **LCP** (Largest Contentful Paint)

### Logging
Sistema de logging estructurado con niveles:
- `DEBUG`: Información detallada para desarrollo
- `INFO`: Eventos importantes del usuario
- `WARN`: Advertencias que requieren atención
- `ERROR`: Errores que afectan la funcionalidad

### Performance Monitoring
- Métricas de carga de assets
- Tiempos de ejecución de funciones
- Estadísticas de API calls
- Monitoreo de rate limits

## 🤝 Contribución

### Pre-commits
Los pre-commits están configurados automáticamente con Husky y ejecutan:
- ESLint
- Prettier
- TypeScript type checking

### Guías de Desarrollo
1. Usa TypeScript para todo el código nuevo
2. Escribe tests para funcionalidades críticas
3. Sigue las convenciones de nomenclatura existentes
4. Usa el sistema de logging para debugging
5. Valida datos con los esquemas de Zod

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para soporte técnico:
- Crea un issue en GitHub
- Revisa la documentación en `/docs`
- Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ por Leem0n Studio**
