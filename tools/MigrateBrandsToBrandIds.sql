-- ============================================================================
-- Script de Migración: Baterías - Brand String a BrandId
-- ============================================================================
-- Este script migra el campo Brand de string a ID en las proyecciones
-- Maneja tanto eventos legacy con nombres de marca como nuevos eventos con IDs
-- ============================================================================

-- Paso 1: Crear función para mapear strings legacy a IDs
CREATE OR REPLACE FUNCTION get_brand_id_from_string(brand_string TEXT)
RETURNS INTEGER AS $$
BEGIN
    -- Intentar parsear como entero (eventos nuevos)
    BEGIN
        RETURN brand_string::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        -- Continuar con matching de strings si falla el parseo
    END;

    -- Mapeo de nombres legacy (case-insensitive)
    RETURN CASE LOWER(TRIM(brand_string))
        WHEN 'bosch' THEN 1
        WHEN 'varta' THEN 2
        WHEN 'optima' THEN 3
        WHEN 'acdelco' THEN 4
        WHEN 'ac delco' THEN 4
        WHEN 'interstate batteries' THEN 5
        WHEN 'interstate' THEN 5
        WHEN 'mac' THEN 6
        WHEN 'willard' THEN 7
        WHEN 'lth' THEN 8
        WHEN 'duncan' THEN 9
        WHEN 'titan' THEN 10
        WHEN 'exide' THEN 11
        WHEN 'yuasa' THEN 12
        WHEN 'amaron' THEN 13
        WHEN 'motorcraft' THEN 14
        WHEN 'moura' THEN 15
        WHEN 'gs yuasa' THEN 16
        WHEN 'panasonic' THEN 17
        WHEN 'rocket' THEN 18
        -- Agregar otros nombres comunes que puedan existir
        WHEN 'trojan' THEN 18  -- No está en la lista, usar Rocket como default
        WHEN 'crown' THEN 18
        ELSE 18 -- Default a Rocket (ID 18) para marcas no reconocidas
    END;
END;
$$ LANGUAGE plpgsql;

-- Paso 2: Agregar nuevas columnas a la tabla de proyección
ALTER TABLE mt_doc_batterystatusprojection
ADD COLUMN IF NOT EXISTS brand_id INTEGER,
ADD COLUMN IF NOT EXISTS brand_name TEXT,
ADD COLUMN IF NOT EXISTS brand_category TEXT;

-- Paso 3: Actualizar proyecciones existentes con brand_id desde el campo Brand
UPDATE mt_doc_batterystatusprojection
SET brand_id = get_brand_id_from_string(data->>'Brand')
WHERE brand_id IS NULL OR brand_id = 0;

-- Paso 4: Poblar brand_name y brand_category desde la tabla de marcas
UPDATE mt_doc_batterystatusprojection p
SET
    brand_name = b.data->>'Name',
    brand_category = b.data->>'Category'
FROM mt_doc_batterybranddocument b
WHERE b.id = p.brand_id
  AND (p.brand_name IS NULL OR p.brand_name = '');

-- Paso 5: Crear índice en brand_id para mejorar queries
CREATE INDEX IF NOT EXISTS idx_battery_brand_id
ON mt_doc_batterystatusprojection(brand_id);

-- Paso 6: Crear índice en brand_name para búsquedas
CREATE INDEX IF NOT EXISTS idx_battery_brand_name
ON mt_doc_batterystatusprojection(brand_name);

-- ============================================================================
-- Reportes de Verificación
-- ============================================================================

-- Reporte 1: Resumen de marcas migradas
SELECT
    p.brand_id,
    p.brand_name,
    p.brand_category,
    COUNT(*) as cantidad_baterias,
    array_agg(DISTINCT p.data->>'Brand') as valores_originales
FROM mt_doc_batterystatusprojection p
GROUP BY p.brand_id, p.brand_name, p.brand_category
ORDER BY cantidad_baterias DESC;

-- Reporte 2: Baterías con marca no reconocida (ID 18)
SELECT
    p.id,
    p.data->>'SerialNumber' as serial_number,
    p.data->>'Brand' as marca_original,
    p.brand_id,
    p.brand_name
FROM mt_doc_batterystatusprojection p
WHERE p.brand_id = 18
  AND p.data->>'Brand' NOT IN ('Rocket', '18');

-- Reporte 3: Verificar que todas las baterías tienen brand_id asignado
SELECT COUNT(*) as baterias_sin_brand_id
FROM mt_doc_batterystatusprojection
WHERE brand_id IS NULL OR brand_id = 0;

-- Reporte 4: Verificar que todos los brand_id tienen brand_name
SELECT COUNT(*) as baterias_sin_brand_name
FROM mt_doc_batterystatusprojection
WHERE brand_id > 0 AND (brand_name IS NULL OR brand_name = '');

-- ============================================================================
-- Limpieza (opcional - descomentar si se desea eliminar la función temporal)
-- ============================================================================
-- DROP FUNCTION IF EXISTS get_brand_id_from_string(TEXT);

-- ============================================================================
-- Notas de Ejecución
-- ============================================================================
-- 1. BACKUP: Hacer backup de la base de datos ANTES de ejecutar
-- 2. VERIFICAR: Revisar los reportes después de la migración
-- 3. MANUAL: Si hay marcas no reconocidas, considerar agregarlas a la lista
-- 4. REBUILD: Puede ser necesario rebuildar projections si hay inconsistencias
-- ============================================================================
