-- ============================================
-- CORRECCIÓN DE DATOS DE CLIENTES
-- ============================================
-- USO: Limpiar y normalizar datos de clientes
-- ============================================

-- Ver duplicados por teléfono
SELECT 
    cliente_telefono,
    COUNT(*) as cantidad,
    STRING_AGG(DISTINCT cliente_nombre, ', ') as nombres,
    STRING_AGG(DISTINCT cliente_email, ', ') as emails
FROM citas
GROUP BY cliente_telefono
HAVING COUNT(*) > 1
ORDER BY cantidad DESC;

-- ============================================
-- NORMALIZAR NOMBRES (capitalizar)
-- ============================================

-- Ver nombres que necesitan corrección
SELECT DISTINCT
    cliente_nombre,
    INITCAP(cliente_nombre) as nombre_corregido
FROM citas
WHERE cliente_nombre != INITCAP(cliente_nombre);

-- Aplicar corrección
/*
UPDATE citas
SET cliente_nombre = INITCAP(cliente_nombre)
WHERE cliente_nombre != INITCAP(cliente_nombre);
*/

-- ============================================
-- LIMPIAR TELÉFONOS (quitar espacios, guiones)
-- ============================================

-- Ver teléfonos con formato incorrecto
SELECT DISTINCT
    cliente_telefono,
    REGEXP_REPLACE(cliente_telefono, '[^0-9]', '', 'g') as telefono_limpio
FROM citas
WHERE cliente_telefono ~ '[^0-9]';

-- Limpiar teléfonos
/*
UPDATE citas
SET cliente_telefono = REGEXP_REPLACE(cliente_telefono, '[^0-9]', '', 'g')
WHERE cliente_telefono ~ '[^0-9]';
*/

-- ============================================
-- NORMALIZAR EMAILS (minúsculas)
-- ============================================

-- Ver emails en mayúsculas
SELECT DISTINCT
    cliente_email,
    LOWER(cliente_email) as email_corregido
FROM citas
WHERE cliente_email != LOWER(cliente_email)
  AND cliente_email IS NOT NULL;

-- Aplicar corrección
/*
UPDATE citas
SET cliente_email = LOWER(cliente_email)
WHERE cliente_email != LOWER(cliente_email)
  AND cliente_email IS NOT NULL;
*/

-- ============================================
-- CORREGIR CLIENTE ESPECÍFICO
-- ============================================

-- Actualizar todos los datos de un cliente por teléfono
/*
UPDATE citas
SET 
    cliente_nombre = 'Juan Pérez',
    cliente_email = 'juan.perez@email.com'
WHERE cliente_telefono = '5512345678';
*/

-- ============================================
-- ELIMINAR CITAS DE PRUEBA
-- ============================================

-- Ver citas de prueba (nombres genéricos)
SELECT *
FROM citas
WHERE LOWER(cliente_nombre) LIKE '%test%'
   OR LOWER(cliente_nombre) LIKE '%prueba%'
   OR LOWER(cliente_email) LIKE '%test%'
   OR cliente_telefono LIKE '0000000%'
   OR cliente_telefono LIKE '1111111%';

-- Eliminar citas de prueba
/*
DELETE FROM citas
WHERE LOWER(cliente_nombre) LIKE '%test%'
   OR LOWER(cliente_nombre) LIKE '%prueba%'
   OR LOWER(cliente_email) LIKE '%test%'
   OR cliente_telefono LIKE '0000000%';
*/
