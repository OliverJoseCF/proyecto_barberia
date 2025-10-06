# 🚀 Guía de Deployment - CantaBarba Studio

## ✅ Pre-Deployment Checklist

### 1. Verificación de Build
```bash
# Asegúrate de que el build funcione sin errores
npm run build

# Resultado esperado:
✓ 2135 modules transformed
✓ built in ~10s
✓ No errors
```

### 2. Test Local del Build
```bash
# Preview del build de producción
npm run preview

# Abrir http://localhost:4173
# Verificar que todo funcione correctamente
```

### 3. Verificación de Archivos
```bash
# Revisar tamaño de archivos en dist/
ls -lh dist/assets/*.js

# Buscar bundle inicial < 150KB (gzipped)
```

## 📦 Opciones de Deployment

### Opción 1: Vercel (Recomendado) ⚡

**Por qué Vercel:**
- ✅ Deployment automático desde Git
- ✅ Edge network global
- ✅ HTTPS gratis
- ✅ CDN automático
- ✅ Zero configuration

**Pasos:**
```bash
1. Crear cuenta en vercel.com
2. Conectar repositorio GitHub
3. Vercel detecta Vite automáticamente
4. Deploy automático en cada push
```

**Configuración (vercel.json):**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Opción 2: Netlify 🎯

**Pasos:**
```bash
1. Crear cuenta en netlify.com
2. Nuevo sitio desde Git
3. Build command: npm run build
4. Publish directory: dist
5. Deploy
```

**Configuración (netlify.toml):**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Opción 3: GitHub Pages 🆓

**Pasos:**
```bash
# 1. Instalar gh-pages
npm install -D gh-pages

# 2. Agregar scripts a package.json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}

# 3. Deploy
npm run deploy

# 4. Configurar en GitHub
Settings > Pages > Source: gh-pages branch
```

### Opción 4: Manual (Servidor Propio) 🖥️

**Requisitos:**
- Servidor con Node.js
- Nginx o Apache
- Dominio configurado

**Pasos:**
```bash
# 1. Build local
npm run build

# 2. Subir carpeta dist/ al servidor
scp -r dist/* user@server:/var/www/cantabarba

# 3. Configurar Nginx
server {
    listen 80;
    server_name cantabarba.com;
    root /var/www/cantabarba;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔧 Variables de Entorno

### Producción
```bash
# .env.production
VITE_APP_TITLE=CantaBarba Studio
VITE_API_URL=https://api.cantabarba.com
VITE_ENABLE_ANALYTICS=true
```

### Desarrollo
```bash
# .env.development
VITE_APP_TITLE=CantaBarba Studio (Dev)
VITE_API_URL=http://localhost:3000
VITE_ENABLE_ANALYTICS=false
```

## 📊 Post-Deployment

### 1. Verificar Performance
```bash
# Lighthouse CI
npx lighthouse https://cantabarba.com --view

# Esperado:
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 90+
```

### 2. Monitorear Métricas
```bash
# Google PageSpeed Insights
https://pagespeed.web.dev/

# Web Vitals
- FCP < 1.8s
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms
- TTI < 3.5s
```

### 3. Setup Analytics (Opcional)
```typescript
// src/lib/analytics.ts
export const trackPageView = (url: string) => {
  if (import.meta.env.VITE_ENABLE_ANALYTICS) {
    // Google Analytics
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
    });
  }
};
```

## 🔒 Seguridad

### Headers de Seguridad
```nginx
# Agregar a configuración del servidor
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "no-referrer-when-downgrade";
```

### HTTPS
```bash
# Certbot (Let's Encrypt)
sudo certbot --nginx -d cantabarba.com
```

## 📱 PWA (Opcional)

### Instalar Plugin
```bash
npm install -D vite-plugin-pwa
```

### Configurar
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CantaBarba Studio',
        short_name: 'CantaBarba',
        description: 'La idea es tuya, nosotros hacemos la magia',
        theme_color: '#d4af37',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
```

## 🎯 CDN para Assets

### Cloudflare (Recomendado)
```bash
1. Crear cuenta en cloudflare.com
2. Agregar dominio
3. Configurar DNS
4. Activar CDN automáticamente
```

### Optimización de Imágenes
```bash
# Cloudinary o ImgIx para imágenes
# Reemplazar URLs:
src="/assets/image.jpg"
# Por:
src="https://res.cloudinary.com/your-account/image/upload/cantabarba/image.jpg"
```

## ✅ Deployment Checklist Final

- [ ] Build sin errores
- [ ] Preview local funciona
- [ ] Variables de entorno configuradas
- [ ] Dominio apuntando correctamente
- [ ] HTTPS configurado
- [ ] Headers de seguridad activos
- [ ] Analytics configurado (opcional)
- [ ] Performance verificado (Lighthouse 90+)
- [ ] Robots.txt configurado
- [ ] Sitemap.xml generado
- [ ] SEO meta tags verificados

## 🚨 Troubleshooting

### Build Errors
```bash
# Limpiar cache
rm -rf node_modules dist
npm install
npm run build
```

### 404 en Rutas
```bash
# Asegurar redirect rules en servidor
# Vercel/Netlify: Automático
# Nginx: try_files configurado
```

### Assets no cargan
```bash
# Verificar base URL en vite.config.ts
base: '/subfolder/' # Si está en subdirectorio
```

## 📞 Soporte

### Recursos
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

---
**Última actualización**: Octubre 6, 2025  
**Status**: ✅ Ready for Production
