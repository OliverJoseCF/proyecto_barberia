# 🪒 CantaBarba Studio - Sitio Web Oficial

## 📋 Descripción
Sitio web profesional para CantaBarba Studio, una barbería tradicional especializada en cortes modernos, afeitado clásico y tratamientos de barba premium.

**"La idea es tuya, nosotros hacemos la magia"**

---

## ✨ Características Principales

### 🎨 **Diseño & UX**
- ✅ Diseño elegante con esquema dorado/negro
- ✅ Responsive para móviles y desktop
- ✅ Animaciones fluidas con Framer Motion
- ✅ Navegación intuitiva y accesible

### 📱 **Funcionalidades**
- ✅ **Sistema de Reservas**: Formulario completo con validaciones
- ✅ **Galería de Trabajos**: Showcase de cortes y estilos
- ✅ **Información del Equipo**: Perfiles de barberos
- ✅ **Servicios y Precios**: Catálogo completo
- ✅ **PWA**: Instalable como app móvil
- ✅ **SEO Optimizado**: Mejor ranking en buscadores

### 🔧 **Panel de Administración**
- ✅ Dashboard con métricas de negocio
- ✅ Gestión de citas (ver, editar, confirmar)
- ✅ Vista de calendario
- ✅ Estadísticas y análisis

---

## 🚀 Instalación y Uso

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn

### **Instalación**
```bash
# Clonar el repositorio
git clone [repository-url]
cd cantabarba-magic-booking-main

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Acceder en: http://localhost:5173
```

### **Compilación para Producción**
```bash
# Build optimizado
npm run build

# Preview del build
npm run preview
```

---

## 🛠️ Stack Tecnológico

### **Frontend**
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones premium

### **UI/UX**
- **ShadCN UI** - Componentes accesibles
- **Lucide React** - Iconos modernos
- **React Router** - Navegación SPA
- **Sonner** - Notificaciones elegantes

### **Validaciones**
- **Zod** - Validación robusta de formularios
- **React Hook Form** (próximamente)

### **PWA**
- **Service Worker** - Cache offline
- **Manifest.json** - Instalación como app

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base (ShadCN)
│   ├── Hero.tsx        # Sección principal
│   ├── Navigation.tsx  # Menu de navegación
│   ├── Services.tsx    # Catálogo de servicios
│   ├── Booking.tsx     # Formulario de reservas
│   ├── Gallery.tsx     # Galería de trabajos
│   └── Team.tsx        # Equipo de barberos
├── pages/              # Páginas principales
│   ├── Index.tsx       # Página principal
│   └── admin/          # Panel administración
├── hooks/              # Hooks personalizados
├── constants/          # Datos constantes
├── assets/            # Imágenes y recursos
└── lib/               # Utilidades
```

---

## 🎯 Funcionalidades Principales

### **1. Sistema de Reservas**
- Formulario inteligente con validaciones
- Verificación de disponibilidad en tiempo real
- Confirmación automática por WhatsApp
- Guardado temporal en localStorage

### **2. Panel de Administración**
- **Dashboard**: Métricas de negocio en tiempo real
- **Gestión de Citas**: Ver, editar, confirmar, cancelar
- **Calendario**: Vista semanal/mensual
- **Estadísticas**: Análisis de servicios populares

### **3. PWA (Progressive Web App)**
- Instalable en móviles como app nativa
- Funciona offline con cache
- Push notifications (próximamente)

---

## 🔧 Configuración

### **Variables de Entorno** (próximamente)
```env
VITE_API_URL=your_api_url
VITE_WHATSAPP_PHONE=52XXXXXXXXXX
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

### **Personalización**
1. **Colores**: Editar `src/index.css` (variables CSS)
2. **Servicios**: Modificar `src/constants/bookingOptions.ts`
3. **Información**: Actualizar `src/components/Hero.tsx` y `Team.tsx`
4. **Imágenes**: Reemplazar archivos en `src/assets/`

---

## 🚀 Roadmap

### **Completado ✅**
- [x] Diseño responsive elegante
- [x] Sistema de reservas con validaciones
- [x] Panel de administración
- [x] PWA funcional
- [x] SEO optimizado

### **En Progreso 🔄**
- [ ] Backend con Supabase/Firebase
- [ ] Autenticación de administradores
- [ ] Sistema de recordatorios automáticos

### **Próximamente 📅**
- [ ] Integración WhatsApp Business API
- [ ] Sistema de pagos online
- [ ] App móvil nativa
- [ ] IA para recomendaciones personalizadas

---

## 💡 Consejos para Desarrollo

### **Comandos Útiles**
```bash
# Linting
npm run lint

# Build de desarrollo
npm run build:dev

# Análisis de bundle
npm run build && npx vite-bundle-analyzer
```

### **Mejores Prácticas**
- Usar lazy loading para componentes pesados
- Optimizar imágenes antes de subirlas
- Mantener componentes pequeños y reutilizables
- Validar todos los formularios con Zod

---

## 📱 Contacto y Soporte

- **WhatsApp**: [Número de la barbería]
- **Instagram**: [@cantabarba_studio]
- **Ubicación**: [Dirección de la barbería]

---

## 📄 Licencia

© 2024 CantaBarba Studio. Todos los derechos reservados.

---

**Desarrollado con ❤️ para CantaBarba Studio**