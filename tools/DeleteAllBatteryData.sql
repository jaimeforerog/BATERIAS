-- ============================================
-- Script para BORRAR TODOS los datos de baterías y proyecciones
-- Base de datos: battery_control
-- Sistema: Marten Event Sourcing
-- Fecha: 2025-12-24
-- ============================================
--
-- ADVERTENCIA: Este script borrará:
-- - 9 baterías (mt_doc_batterystatusprojection)
-- - 5 registros de mantenimiento (mt_doc_maintenancehistoryprojection)
-- - 19 eventos (mt_events)
-- - 9 streams (mt_streams)
--
-- Asegúrate de tener un respaldo antes de ejecutar
-- ============================================

BEGIN;

-- 1. Borrar las proyecciones de baterías (tablas de lectura)
TRUNCATE TABLE mt_doc_batterystatusprojection RESTART IDENTITY CASCADE;
TRUNCATE TABLE mt_doc_maintenancehistoryprojection RESTART IDENTITY CASCADE;

-- 2. Borrar todos los eventos (Event Store)
DELETE FROM mt_events;

-- 3. Borrar todos los streams
DELETE FROM mt_streams;

-- 4. Reiniciar las secuencias de eventos
DO $$
BEGIN
    -- Reiniciar secuencia de eventos si existe
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'mt_events_sequence') THEN
        ALTER SEQUENCE mt_events_sequence RESTART WITH 1;
    END IF;
END $$;

-- 5. Limpiar tabla de progresión de eventos si existe
TRUNCATE TABLE mt_event_progression RESTART IDENTITY CASCADE;

COMMIT;

-- Verificar que todo se borró correctamente
SELECT 'Baterías restantes' as tabla, COUNT(*) as registros FROM mt_doc_batterystatusprojection
UNION ALL
SELECT 'Mantenimientos restantes', COUNT(*) FROM mt_doc_maintenancehistoryprojection
UNION ALL
SELECT 'Eventos restantes', COUNT(*) FROM mt_events
UNION ALL
SELECT 'Streams restantes', COUNT(*) FROM mt_streams;
