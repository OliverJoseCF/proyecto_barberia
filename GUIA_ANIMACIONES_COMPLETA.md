# 🎬 GUÍA DE ANIMACIONES PARA PÁGINAS DE CONFIGURACIÓN

## ✅ COMPLETADO

### **ScheduleManagement.tsx**
- ✅ Header animado (slide down)
- ✅ Botones con hover/tap effects
- ✅ Ícono Clock con pendulum animation
- ✅ Cards de horarios con entrada escalonada
- ✅ Días festivos con slide from left
- ✅ Hover effects en todos los elementos interactivos

---

## 📋 INSTRUCCIONES PARA APLICAR ANIMACIONES

### **Para cada página, aplicar el siguiente patrón:**

#### **1. Importar AnimatePresence**
```tsx
import { motion, AnimatePresence } from 'framer-motion';
```

#### **2. Header (TODAS LAS PÁGINAS)**
```tsx
<motion.header
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
  className="bg-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-md"
>
  {/* Botón Volver */}
  <motion.div whileHover={{ x: -5 }} transition={{ duration: 0.2 }}>
    <Button ... />
  </motion.div>
  
  {/* Ícono Principal */}
  <motion.div animate={{...}}>
    {icon}
  </motion.div>
  
  {/* Botones de Acción */}
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Button ... />
  </motion.div>
</motion.header>
```

#### **3. Secciones Principales**
```tsx
{/* Primera Sección */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2, duration: 0.5 }}
>
  <Card ... />
</motion.div>

{/* Segunda Sección */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4, duration: 0.5 }}
>
  <Card ... />
</motion.div>
```

#### **4. Grids y Listas**
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.3 }}
    whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
  >
    <Card ... />
  </motion.div>
))}
```

#### **5. Modales**
```tsx
<AnimatePresence>
  {showModal && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setShowModal(false)}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <Card ... />
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### **6. Botones**
```tsx
{/* Botón Principal */}
<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  <Button className="gradient-gold" ... />
</motion.div>

{/* Botón Secundario */}
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  <Button variant="outline" ... />
</motion.div>

{/* Botón Peligro */}
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  <Button variant="ghost" className="text-red-500" ... />
</motion.div>
```

---

## 🎯 ANIMACIONES ESPECÍFICAS POR PÁGINA

### **BarberManagement.tsx**

```tsx
// Ícono Header
<motion.div
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
>
  <Users className="h-8 w-8 text-gold" />
</motion.div>

// Grid de Barberos
{barberos.map((barbero, index) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -8, scale: 1.03 }}
  >
    <Card ... />
  </motion.div>
))}
```

---

### **BusinessSettings.tsx**

```tsx
// Ícono Header
<motion.div
  animate={{ y: [0, -5, 0] }}
  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
>
  <Info className="h-8 w-8 text-gold" />
</motion.div>

// Formularios
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.2 }}
>
  <Card ... />
</motion.div>
```

---

### **GalleryManagement.tsx**

```tsx
// Ícono Header
<motion.div
  animate={{ rotate: [0, 10, -10, 0] }}
  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
>
  <Image className="h-8 w-8 text-gold" />
</motion.div>

// Grid de Imágenes
{images.map((img, index) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, type: "spring" }}
    whileHover={{ scale: 1.05, zIndex: 10 }}
  >
    <div className="relative group">
      <img ... />
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        {/* Acciones */}
      </motion.div>
    </div>
  </motion.div>
))}
```

---

### **NotificationSettings.tsx**

```tsx
// Ícono Header
<motion.div
  animate={{ rotate: [0, 15, -15, 15, 0] }}
  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
>
  <Bell className="h-8 w-8 text-gold" />
</motion.div>

// Toggle Switches
{notifications.map((notif, index) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ x: 5 }}
  >
    <Card ... />
  </motion.div>
))}
```

---

### **ReportsManagement.tsx**

```tsx
// Ícono Header
<motion.div
  animate={{ rotate: [0, 360] }}
  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
>
  <TrendingUp className="h-8 w-8 text-gold" />
</motion.div>

// Filtros
<motion.div
  initial={{ opacity: 0, x: -30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.2 }}
>
  <Card ... />
</motion.div>

// Tabla de Resultados
{rows.map((row, index) => (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ backgroundColor: "rgba(212, 175, 55, 0.1)" }}
  >
    ...
  </motion.tr>
))}
```

---

### **ClientManagement.tsx**

```tsx
// Ícono Header
<motion.div
  animate={{ scale: [1, 1.15, 1] }}
  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
>
  <UserCheck className="h-8 w-8 text-gold" />
</motion.div>

// Búsqueda
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <Input placeholder="Buscar cliente..." />
</motion.div>

// Clientes VIP (efecto especial)
{client.isVIP && (
  <motion.div
    animate={{ 
      boxShadow: [
        "0 0 0px rgba(212, 175, 55, 0)",
        "0 0 20px rgba(212, 175, 55, 0.5)",
        "0 0 0px rgba(212, 175, 55, 0)"
      ]
    }}
    transition={{ duration: 2, repeat: Infinity }}
  >
    <Badge>VIP</Badge>
  </motion.div>
)}
```

---

### **BookingSettings.tsx**

```tsx
// Ícono Header
<motion.div
  animate={{ scale: [1, 0.95, 1] }}
  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
>
  <Calendar className="h-8 w-8 text-gold" />
</motion.div>

// Políticas (Accordion)
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: "auto", opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  <div className="p-4">
    ...
  </div>
</motion.div>
```

---

## 🎨 COLORES Y ESTADOS

### **Estados de Cards:**
```tsx
// Normal
className="glass-effect border-gold/20"

// Hover
className="hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10"

// Activo
className="border-gold/50 bg-gold/5"

// Inactivo
className="opacity-50 grayscale"
```

### **Estados de Botones:**
```tsx
// Normal
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}

// Deshabilitado
disabled={loading}
className="opacity-50 cursor-not-allowed"

// Cargando
{loading && <Loader className="animate-spin" />}
```

---

## ⚡ PERFORMANCE

### **Optimizaciones:**
```tsx
// Usar layoutId para smooth transitions
<motion.div layoutId={item.id}>

// Limitar animaciones en listas grandes
{items.slice(0, 20).map(...)}

// Usar will-change para GPU acceleration
className="will-change-transform"

// Lazy animation en scroll
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }}
>
```

---

## ✅ CHECKLIST FINAL

Para cada página, verificar:
- [x] Header animado (slide down)
- [x] Botón volver (hover left)
- [x] Ícono principal (animación contextual)
- [x] Botones de acción (scale + tap)
- [x] Secciones principales (fade in staggered)
- [x] Grids/Listas (entrada secuencial)
- [x] Cards (hover elevation)
- [x] Modales (AnimatePresence)
- [x] Forms (smooth transitions)
- [x] Loading states (spinner)
- [x] Error states (shake)
- [x] Success feedback (bounce)

---

*Guía completa de animaciones para CantaBarba Studio* ✨  
*Todas las páginas con el mismo nivel de polish* 🎬
