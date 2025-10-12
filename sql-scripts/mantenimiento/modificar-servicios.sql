-- ============================================
-- MODIFICACIÓN DE SERVICIOS
-- ============================================
-- USO: Actualizar precios, nombres y disponibilidad
-- ============================================

-- Ver todos los servicios actuales
SELECT * FROM servicios ORDER BY categoria, nombre;

-- ============================================
-- ACTUALIZAR PRECIOS
-- ============================================

-- Aumentar todos los precios 10%
/*
UPDATE servicios
SET precio = ROUND(precio * 1.10);
*/

-- Aumentar precios de una categoría específica
/*
UPDATE servicios
SET precio = precio + 50
WHERE categoria = 'Cortes';
*/

-- Cambiar precio de un servicio específico
/*
UPDATE servicios
SET precio = 250
WHERE nombre = 'Corte Clásico';
*/

-- ============================================
-- RENOMBRAR SERVICIOS
-- ============================================

-- Cambiar nombre de servicio
/*
UPDATE servicios
SET nombre = 'Nuevo Nombre del Servicio'
WHERE nombre = 'Nombre Anterior';
*/

-- Actualizar descripción
/*
UPDATE servicios
SET descripcion = 'Nueva descripción del servicio'
WHERE nombre = 'Corte Clásico';
*/

-- ============================================
-- CAMBIAR DURACIÓN
-- ============================================

-- Cambiar duración de servicios específicos
/*
UPDATE servicios
SET duracion = 45
WHERE nombre IN ('Corte Clásico', 'Corte Fade');
*/

-- ============================================
-- ACTIVAR/DESACTIVAR SERVICIOS
-- ============================================

-- Desactivar servicio temporalmente
/*
UPDATE servicios
SET activo = false
WHERE nombre = 'Servicio a desactivar';
*/

-- Reactivar servicio
/*
UPDATE servicios
SET activo = true
WHERE nombre = 'Servicio a reactivar';
*/

-- Desactivar todos los servicios de una categoría
/*
UPDATE servicios
SET activo = false
WHERE categoria = 'Tratamientos Especiales';
*/

-- ============================================
-- CAMBIAR CATEGORÍA
-- ============================================

-- Mover servicio a otra categoría
/*
UPDATE servicios
SET categoria = 'Nueva Categoría'
WHERE nombre = 'Nombre del Servicio';
*/

-- ============================================
-- AGREGAR NUEVO SERVICIO
-- ============================================

-- Insertar nuevo servicio
/*
INSERT INTO servicios (nombre, descripcion, precio, duracion, categoria, activo, icono)
VALUES (
    'Nuevo Servicio',
    'Descripción del nuevo servicio',
    300,
    60,
    'Cortes',
    true,
    'scissors'
);
*/

-- ============================================
-- ELIMINAR SERVICIO
-- ============================================

-- ⚠️ CUIDADO: Verificar que no haya citas con este servicio
SELECT COUNT(*) FROM citas WHERE servicio = 'Servicio a eliminar';

-- Si el resultado es 0, es seguro eliminar
/*
DELETE FROM servicios
WHERE nombre = 'Servicio a eliminar';
*/
