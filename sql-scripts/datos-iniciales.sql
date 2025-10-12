-- ============================================
-- DATOS INICIALES - BARBEROS Y SERVICIOS
-- CantaBarba Studio
-- ============================================

-- 🗑️ PASO 1: LIMPIAR DATOS EXISTENTES
-- ============================================
DELETE FROM barberos;
DELETE FROM servicios;

-- 1️⃣ PASO 2: INSERTAR BARBEROS
-- ============================================
INSERT INTO barberos (nombre, especialidad, activo, email) 
VALUES
  ('Angel Ramirez', 'Cortes clásicos y modernos', true, 'angel@cantabarba.com'),
  ('Emiliano Vega', 'Barbería tradicional y afeitados', true, 'emiliano@cantabarba.com');

-- 2️⃣ PASO 3: INSERTAR SERVICIOS
-- ============================================
INSERT INTO servicios (nombre, descripcion, duracion, precio, activo) 
VALUES
  ('Corte de Cabello (Hombre)', 'Corte profesional con tijera y máquina', 30, 150.00, true),
  ('Corte de Cabello (Niño)', 'Corte especial para niños', 25, 120.00, true),
  ('Arreglo de Barba', 'Perfilado y recorte de barba', 20, 100.00, true),
  ('Afeitado Clásico', 'Afeitado tradicional con navaja y toalla caliente', 30, 120.00, true),
  ('Tintes', 'Coloración profesional', 60, 300.00, true),
  ('Diseños Capilares', 'Diseños artísticos personalizados', 40, 200.00, true),
  ('Tratamientos Barba y Cejas', 'Tratamiento completo de barba y cejas', 35, 180.00, true),
  ('Faciales y Skincare', 'Tratamiento facial y cuidado de la piel', 45, 250.00, true);

-- 3️⃣ PASO 4: VERIFICACIÓN
-- ============================================
SELECT 'BARBEROS INSERTADOS:' as resultado, COUNT(*) as total FROM barberos;
SELECT 'SERVICIOS INSERTADOS:' as resultado, COUNT(*) as total FROM servicios;

-- Ver los datos insertados
SELECT id, nombre, email, especialidad, activo FROM barberos ORDER BY nombre;
SELECT id, nombre, precio, duracion FROM servicios ORDER BY nombre;
